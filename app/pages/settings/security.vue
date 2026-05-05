<script setup lang="ts">
import { Key, Laptop, Smartphone, Trash2 } from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Security · Settings' })

const mfaEnabled = ref(false)

const sessions = [
  { id: '1', device: 'MacBook Pro', browser: 'Chrome 130 · macOS 15', location: 'New York, US', current: true, lastActive: 'Active now' },
  { id: '2', device: 'iPhone 15', browser: 'Safari · iOS 18', location: 'New York, US', current: false, lastActive: '2 hours ago' },
]

const tokens = [
  { id: 't1', name: 'CLI · uday-laptop', scopes: ['read', 'write'], created: '2026-03-12', lastUsed: '2026-05-16' },
]
</script>

<template>
  <div class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-semibold tracking-tight">Security</h1>
      <p class="text-muted-foreground text-sm">Sessions, two-factor auth, and API tokens.</p>
    </header>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">Two-factor authentication</CardTitle>
        <CardDescription>Require a code from your authenticator app on every sign-in.</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex items-start justify-between gap-6">
          <div class="space-y-0.5">
            <Label for="mfa-toggle" class="text-sm font-medium">Authenticator app (TOTP)</Label>
            <p class="text-muted-foreground text-xs">Compatible with 1Password, Authy, Google Authenticator.</p>
          </div>
          <Switch id="mfa-toggle" v-model="mfaEnabled" />
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">Active sessions</CardTitle>
        <CardDescription>Devices currently signed in to your account.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        <div v-for="(s, i) in sessions" :key="s.id">
          <div class="flex items-start justify-between gap-4 py-2">
            <div class="flex items-start gap-3">
              <component :is="s.device.includes('iPhone') ? Smartphone : Laptop" class="text-muted-foreground size-4 mt-0.5" />
              <div class="space-y-0.5">
                <div class="flex items-center gap-2">
                  <p class="text-sm font-medium">{{ s.device }}</p>
                  <Badge v-if="s.current" variant="secondary" class="text-[10px]">This device</Badge>
                </div>
                <p class="text-muted-foreground text-xs">{{ s.browser }} · {{ s.location }}</p>
                <p class="text-muted-foreground text-xs">{{ s.lastActive }}</p>
              </div>
            </div>
            <Button v-if="!s.current" variant="ghost" size="sm">Revoke</Button>
          </div>
          <Separator v-if="i < sessions.length - 1" />
        </div>
        <div class="pt-2">
          <Button variant="outline" size="sm">Sign out all other sessions</Button>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader class="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle class="text-base">API tokens</CardTitle>
          <CardDescription>Personal access tokens for CLI and API use.</CardDescription>
        </div>
        <Button size="sm">
          <Key class="size-4" />
          Create token
        </Button>
      </CardHeader>
      <CardContent class="space-y-3">
        <div v-if="!tokens.length" class="text-muted-foreground text-sm">No tokens yet.</div>
        <div v-for="t in tokens" :key="t.id" class="flex items-start justify-between gap-4 py-2">
          <div class="space-y-0.5">
            <div class="flex items-center gap-2">
              <p class="text-sm font-medium">{{ t.name }}</p>
              <Badge v-for="s in t.scopes" :key="s" variant="secondary" class="text-[10px]">{{ s }}</Badge>
            </div>
            <p class="text-muted-foreground text-xs">Created {{ t.created }} · last used {{ t.lastUsed }}</p>
          </div>
          <Button variant="ghost" size="icon" aria-label="Revoke token">
            <Trash2 class="text-destructive size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
