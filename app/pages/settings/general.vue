<script setup lang="ts">
import { CheckCircle2, AlertCircle, Loader2 } from '@/lib/icon-pack'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Page, PageHeader, PageHeaderHeading, PageBody } from '@/components/ui/page'
import type { ApiResponse } from '~~/server/utils/response'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
const title = useRouteLabel()
useHead({ title })

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
// Brand accent is picked from the theme's chart palette so it stays
// legible in light and dark mode.
const brandSwatches = [
  { value: 'chart-1', label: 'Colour 1', class: 'bg-chart-1' },
  { value: 'chart-2', label: 'Colour 2', class: 'bg-chart-2' },
  { value: 'chart-3', label: 'Colour 3', class: 'bg-chart-3' },
  { value: 'chart-4', label: 'Colour 4', class: 'bg-chart-4' },
  { value: 'chart-5', label: 'Colour 5', class: 'bg-chart-5' },
]
const brandColor = ref('chart-1')
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
  <Page>
    <PageHeader>
      <PageHeaderHeading
        :title="title"
        description="Workspace identity, locale, and default behaviour."
      />
    </PageHeader>

    <PageBody class="max-w-3xl space-y-4">
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
          <CardDescription>Affects date and time formatting across the workspace.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid gap-2">
            <Label for="ws-timezone">Timezone</Label>
            <Select v-model="timezone">
              <SelectTrigger id="ws-timezone">
                <SelectValue />
              </SelectTrigger>
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
            <Label for="ws-locale">Locale</Label>
            <Select v-model="locale">
              <SelectTrigger id="ws-locale">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">
                  English
                </SelectItem>
                <SelectItem value="es">
                  Español
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
            <Label id="ws-brand-label">Primary brand colour</Label>
            <div
              class="flex items-center gap-2"
              role="radiogroup"
              aria-labelledby="ws-brand-label"
            >
              <button
                v-for="c in brandSwatches"
                :key="c.value"
                type="button"
                role="radio"
                :aria-checked="brandColor === c.value"
                :aria-label="c.label"
                :class="['ring-offset-background focus-visible:ring-ring size-8 rounded-full border transition-shadow outline-none focus-visible:ring-2 focus-visible:ring-offset-2', c.class, brandColor === c.value && 'ring-foreground ring-2 ring-offset-2']"
                @click="brandColor = c.value"
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
          <div class="flex items-start justify-between gap-4 py-3">
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
          <div class="flex items-start justify-between gap-4 py-3">
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
          <div class="flex items-start justify-between gap-4 py-3">
            <div class="space-y-0.5">
              <Label
                for="send-weekly-digest"
                class="text-sm font-medium"
              >Send weekly digest</Label>
              <p class="text-muted-foreground text-xs">
                Mondays at 9am workspace time. Usage, top projects, and any rate-limit hits from the prior week.
              </p>
            </div>
            <Switch
              id="send-weekly-digest"
              v-model="sendWeeklyDigest"
            />
          </div>
        </CardContent>
      </Card>

      <div class="flex items-center justify-end gap-2">
        <div
          v-if="status.kind === 'saved'"
          class="text-success flex items-center gap-2 text-sm"
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
    </PageBody>
  </Page>
</template>
