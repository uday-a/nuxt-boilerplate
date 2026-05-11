<script setup lang="ts">
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import type { ApiResponse } from '~~/server/utils/response'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Account · Settings' })

const { user } = useUserSession()

interface Profile {
  name: string | null
  bio: string | null
  timezone: string
  locale: string
  notifyEmail: boolean
  notifyInApp: boolean
}

const { data: profileRes, refresh } = await useFetch<ApiResponse<{ profile: Profile }>>('/api/me/profile')

// Initialize from server, keep email read-only (changing it requires the
// reverification flow which lives in the magic-link branch, not here).
const name = ref('')
const bio = ref('')
const email = ref(user.value?.email ?? '')
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

watchEffect(() => {
  if (profileRes.value?.ok) {
    name.value = profileRes.value.data.profile.name ?? ''
    bio.value = profileRes.value.data.profile.bio ?? ''
  }
})

const initials = computed(() =>
  (name.value || 'U')
    .split(' ')
    .map(s => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase(),
)

type Status = { kind: 'idle' } | { kind: 'saving' } | { kind: 'saved', demo?: boolean } | { kind: 'error', message: string }
const status = ref<Status>({ kind: 'idle' })

async function save() {
  status.value = { kind: 'saving' }
  const res = await $fetch<ApiResponse<{ profile: Profile, demo?: boolean }>>('/api/me/profile', {
    method: 'PUT',
    body: { name: name.value, bio: bio.value || null },
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
        Account
      </h1>
      <p class="text-muted-foreground text-sm">
        Your personal profile and credentials.
      </p>
    </header>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">
          Profile
        </CardTitle>
        <CardDescription>How you appear in the workspace.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex items-center gap-4">
          <Avatar class="size-16">
            <AvatarImage
              v-if="user?.avatar"
              :src="user.avatar"
              :alt="name"
            />
            <AvatarFallback>{{ initials }}</AvatarFallback>
          </Avatar>
          <div class="space-y-1">
            <Button
              variant="outline"
              size="sm"
            >
              Upload photo
            </Button>
            <p class="text-muted-foreground text-xs">
              PNG or JPG, up to 2MB.
            </p>
          </div>
        </div>
        <div class="grid gap-2">
          <Label for="acct-name">Full name</Label>
          <Input
            id="acct-name"
            v-model="name"
          />
        </div>
        <div class="grid gap-2">
          <Label for="acct-bio">Bio</Label>
          <Textarea
            id="acct-bio"
            v-model="bio"
            rows="3"
            placeholder="A short paragraph about yourself."
          />
          <p class="text-muted-foreground text-xs">
            500 characters max. Visible to workspace members.
          </p>
        </div>
        <div class="grid gap-2">
          <Label for="acct-email">Email</Label>
          <Input
            id="acct-email"
            v-model="email"
            type="email"
            disabled
          />
          <p class="text-muted-foreground text-xs">
            Email comes from your GitHub account. Change it there or add email/password auth to edit here.
          </p>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">
          Password
        </CardTitle>
        <CardDescription>Use 12+ characters with a mix of letters, numbers, and symbols.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="grid gap-2">
          <Label for="pw-current">Current password</Label>
          <Input
            id="pw-current"
            v-model="currentPassword"
            type="password"
          />
        </div>
        <div class="grid gap-2">
          <Label for="pw-new">New password</Label>
          <Input
            id="pw-new"
            v-model="newPassword"
            type="password"
          />
        </div>
        <div class="grid gap-2">
          <Label for="pw-confirm">Confirm new password</Label>
          <Input
            id="pw-confirm"
            v-model="confirmPassword"
            type="password"
          />
        </div>
      </CardContent>
    </Card>

    <Card class="border-destructive/40">
      <CardHeader>
        <CardTitle class="text-base text-destructive">
          Danger zone
        </CardTitle>
        <CardDescription>Irreversible account actions.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex items-start justify-between gap-6">
          <div class="space-y-0.5">
            <p class="text-sm font-medium">
              Delete account
            </p>
            <p class="text-muted-foreground text-xs">
              Permanently remove your account and all personal data. Workspace data is retained per your billing plan.
            </p>
          </div>
          <Button variant="destructive">
            Delete account
          </Button>
        </div>
        <Separator />
        <div class="flex items-start justify-between gap-6">
          <div class="space-y-0.5">
            <p class="text-sm font-medium">
              Export data
            </p>
            <p class="text-muted-foreground text-xs">
              Download a JSON archive of your personal data.
            </p>
          </div>
          <Button variant="outline">
            Request export
          </Button>
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
        :disabled="status.kind === 'saving' || !name"
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
