<script setup lang="ts">
import { ref } from 'vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'General · Settings' })

const workspaceName = ref('Acme Inc')
const workspaceUrl = ref('acme-inc')
const supportEmail = ref('support@acme.com')
const timezone = ref('America/New_York')
const locale = ref('en-US')
const brandColor = ref('#5B6FE6')
const allowExternalShares = ref(true)
const requireSso = ref(false)
const sendWeeklyDigest = ref(true)
</script>

<template>
  <div class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-semibold tracking-tight">
        General
      </h1>
      <p class="text-muted-foreground text-sm">
        Workspace identity, locale, and default behaviour.
      </p>
    </header>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">
          Workspace
        </CardTitle>
        <CardDescription>Visible to every member.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="grid gap-2">
          <Label for="ws-name">Workspace name</Label>
          <Input
            id="ws-name"
            v-model="workspaceName"
          />
        </div>
        <div class="grid gap-2">
          <Label for="ws-url">URL slug</Label>
          <div class="flex">
            <span class="bg-muted text-muted-foreground inline-flex items-center rounded-l-md border border-r-0 px-3 text-sm">app.acme.com/</span>
            <Input
              id="ws-url"
              v-model="workspaceUrl"
              class="rounded-l-none"
            />
          </div>
          <p class="text-muted-foreground text-xs">
            Renaming the slug breaks existing share links. Old links 404; we don't redirect.
          </p>
        </div>
        <div class="grid gap-2">
          <Label for="ws-email">Support email</Label>
          <Input
            id="ws-email"
            v-model="supportEmail"
            type="email"
          />
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">
          Localization
        </CardTitle>
        <CardDescription>Affects date/time formatting and AI response defaults.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="grid gap-2">
          <Label>Timezone</Label>
          <Select v-model="timezone">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="America/Los_Angeles">
                America/Los_Angeles · UTC-8
              </SelectItem>
              <SelectItem value="America/New_York">
                America/New_York · UTC-5
              </SelectItem>
              <SelectItem value="Europe/London">
                Europe/London · UTC+0
              </SelectItem>
              <SelectItem value="Europe/Berlin">
                Europe/Berlin · UTC+1
              </SelectItem>
              <SelectItem value="Asia/Singapore">
                Asia/Singapore · UTC+8
              </SelectItem>
              <SelectItem value="Asia/Tokyo">
                Asia/Tokyo · UTC+9
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="grid gap-2">
          <Label>Locale</Label>
          <Select v-model="locale">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="en-US">
                English (US)
              </SelectItem>
              <SelectItem value="en-GB">
                English (UK)
              </SelectItem>
              <SelectItem value="fr-FR">
                Français
              </SelectItem>
              <SelectItem value="de-DE">
                Deutsch
              </SelectItem>
              <SelectItem value="ja-JP">
                日本語
              </SelectItem>
              <SelectItem value="ko-KR">
                한국어
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">
          Branding
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="grid gap-2">
          <Label>Primary brand colour</Label>
          <div class="flex items-center gap-3">
            <input
              v-model="brandColor"
              type="color"
              class="size-10 cursor-pointer rounded-md border"
            >
            <Input
              v-model="brandColor"
              class="font-mono text-sm w-32"
            />
          </div>
          <p class="text-muted-foreground text-xs">
            Used on shared report headers, exported PDFs, and the public-facing share page.
          </p>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">
          Defaults
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-1">
        <div class="flex items-start justify-between gap-6 py-3">
          <div class="space-y-0.5">
            <Label
              for="allow-external-shares"
              class="text-sm font-medium"
            >Allow external shares</Label>
            <p class="text-muted-foreground text-xs">
              Members can generate public read-only share links. Disabled by default at the Enterprise tier.
            </p>
          </div>
          <Switch
            id="allow-external-shares"
            v-model="allowExternalShares"
          />
        </div>
        <Separator />
        <div class="flex items-start justify-between gap-6 py-3">
          <div class="space-y-0.5">
            <Label
              for="require-sso"
              class="text-sm font-medium"
            >Require SSO</Label>
            <p class="text-muted-foreground text-xs">
              All members must authenticate via your SAML or OIDC provider. Email/password is blocked.
            </p>
          </div>
          <Switch
            id="require-sso"
            v-model="requireSso"
          />
        </div>
        <Separator />
        <div class="flex items-start justify-between gap-6 py-3">
          <div class="space-y-0.5">
            <Label
              for="send-weekly-digest"
              class="text-sm font-medium"
            >Send weekly digest</Label>
            <p class="text-muted-foreground text-xs">
              Mondays at 9am workspace time. Usage, top prompts, and any rate-limit hits from the prior week.
            </p>
          </div>
          <Switch
            id="send-weekly-digest"
            v-model="sendWeeklyDigest"
          />
        </div>
      </CardContent>
    </Card>

    <div class="flex justify-end gap-2">
      <Button variant="outline">
        Cancel
      </Button>
      <Button>Save changes</Button>
    </div>
  </div>
</template>
