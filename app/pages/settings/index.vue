<script setup lang="ts">
import { User, UserCircle, ShieldCheck, Bell, Plug, Users, CreditCard, Gauge, ArrowRight } from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Settings' })

const sections = [
  { slug: 'general', icon: User, title: 'General', description: 'Workspace name, timezone, default locale, brand colours.', meta: 'You · 4 fields' },
  { slug: 'account', icon: UserCircle, title: 'Account', description: 'Profile, email, password, account deletion.', meta: 'Your personal info' },
  { slug: 'security', icon: ShieldCheck, title: 'Security', description: 'Sessions, two-factor auth, API tokens.', meta: '1 active session' },
  { slug: 'notifications', icon: Bell, title: 'Notifications', description: 'Email and in-app delivery preferences.', meta: 'Email · in-app' },
  { slug: 'integrations', icon: Plug, title: 'Integrations', description: 'Connected OAuth apps and webhooks.', meta: '0 connected' },
  { slug: 'team', icon: Users, title: 'Team', description: 'Members, roles, invitations, and SSO configuration.', meta: '8 members · 2 pending invites' },
  { slug: 'billing', icon: CreditCard, title: 'Billing', description: 'Current plan, payment method, invoices, usage caps.', meta: 'Pro · $148.40 this cycle' },
  { slug: 'limits', icon: Gauge, title: 'Limits', description: 'API quotas, rate limits, storage allowances per workspace.', meta: '47% of monthly quota' },
]
</script>

<template>
  <div class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-semibold tracking-tight">Settings</h1>
      <p class="text-muted-foreground text-sm">Workspace configuration. Changes apply to all members.</p>
    </header>

    <div class="grid gap-4 sm:grid-cols-2">
      <NuxtLink v-for="s in sections" :key="s.slug" :to="`/settings/${s.slug}`" class="group block">
        <Card class="hover:border-foreground/20 h-full transition-colors">
          <CardHeader>
            <div class="flex items-start justify-between gap-3">
              <div class="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
                <component :is="s.icon" class="size-5" />
              </div>
              <ArrowRight class="text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 size-4 transition-transform" />
            </div>
            <CardTitle class="text-base pt-3">{{ s.title }}</CardTitle>
            <CardDescription>{{ s.description }}</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" class="text-[10px]">{{ s.meta }}</Badge>
          </CardContent>
        </Card>
      </NuxtLink>
    </div>
  </div>
</template>
