<script setup lang="ts">
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import type { ApiResponse } from '~~/server/utils/response'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'General · Settings' })

interface Profile {
  name: string | null
  bio: string | null
  timezone: string
  locale: string
  notifyEmail: boolean
  notifyInApp: boolean
}

const { data: profileRes, refresh } = await useFetch<ApiResponse<{ profile: Profile }>>('/api/me/profile')

// Timezone + locale are user-scoped (live on `users` table) and persist
// via /api/me/profile. The workspace-level fields below (name, slug,
// brand color, SSO requirements) need a `workspaces` table; until you
// add one they're visual-only — kept in this page so the form shows
// the full settings UX, but Save only ships the user-scoped fields.
const timezone = ref('UTC')
const locale = ref('en')
watchEffect(() => {
  if (profileRes.value?.ok) {
    timezone.value = profileRes.value.data.profile.timezone
    locale.value = profileRes.value.data.profile.locale
  }
})

// Workspace-level state. UI shells until you add a workspaces table.
const workspaceName = ref('Acme Inc')
const workspaceUrl = ref('acme-inc')
const supportEmail = ref('support@acme.com')
const brandColor = ref('#5B6FE6')
const allowExternalShares = ref(true)
const requireSso = ref(false)
const sendWeeklyDigest = ref(true)

type Status = { kind: 'idle' } | { kind: 'saving' } | { kind: 'saved', demo?: boolean } | { kind: 'error', message: string }
const status = ref<Status>({ kind: 'idle' })

async function save() {
  status.value = { kind: 'saving' }
  const res = await $fetch<ApiResponse<{ profile: Profile, demo?: boolean }>>('/api/me/profile', {
    method: 'PUT',
    body: { timezone: timezone.value, locale: locale.value },
  }).catch((err) => {
    const data = (err as { data?: { error?: { message?: string } } }).data
    return { ok: false, error: { code: 'INTERNAL', message: data?.error?.message ?? 'Failed to save' } } as const
  })
  if (!res.ok) {
    status.value = { kind: 'error', message: res.error.message }
    return
  }
  status.value = { kind: 'saved', demo: res.data.demo }
  await refresh()
}
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
              <SelectItem value="UTC">
                UTC
              </SelectItem>
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
              <SelectItem value="en">
                English
              </SelectItem>
              <SelectItem value="es">
                Español
              </SelectItem>
            </SelectContent>
          </Select>
          <p class="text-muted-foreground text-xs">
            Add more options in <code>i18n/locales/</code> + the <code>i18n</code> module config.
          </p>
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

    <div class="flex items-center justify-end gap-3">
      <div
        v-if="status.kind === 'saved'"
        class="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400"
      >
        <CheckCircle2 class="size-4" />
        {{ status.demo ? 'Saved (demo — not persisted)' : 'Saved' }}
      </div>
      <div
        v-else-if="status.kind === 'error'"
        class="text-destructive flex items-center gap-2 text-sm"
      >
        <AlertCircle class="size-4" />
        {{ status.message }}
      </div>
      <Button variant="outline">
        Cancel
      </Button>
      <Button
        :disabled="status.kind === 'saving'"
        @click="save"
      >
        <Loader2
          v-if="status.kind === 'saving'"
          class="size-4 animate-spin"
        />
        Save changes
      </Button>
    </div>
  </div>
</template>
