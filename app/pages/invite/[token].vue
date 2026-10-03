<script setup lang="ts">
import { Mail, Users, AlertCircle, Loader2 } from '@/lib/icon-pack'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { ApiResponse } from '~~/server/utils/response'

definePageMeta({ auth: false, layout: false })

const { t } = useI18n()
const route = useRoute()
const token = computed(() => String(route.params.token))

const { user, loggedIn } = useUserSession()

interface InvitePreview {
  email: string
  role: string
  valid: boolean
}

const { data: inviteRes, pending: verifying, error: verifyError } = await useFetch<ApiResponse<InvitePreview>>(
  () => `/api/team/invites/${token.value}`,
)

const invite = computed<InvitePreview | null>(() =>
  inviteRes.value?.ok ? inviteRes.value.data : null,
)
const verifyFailed = computed(() =>
  Boolean(verifyError.value) || Boolean(inviteRes.value && !inviteRes.value.ok),
)
// A 401 means the link may be fine but the recipient isn't signed in —
// send them to sign in rather than calling a valid invite "invalid".
const needsSignin = computed(() =>
  verifyError.value?.statusCode === 401
  || (inviteRes.value && !inviteRes.value.ok && inviteRes.value.error.code === 'UNAUTHORIZED'),
)
const signinHref = computed(() => `/login?next=/invite/${token.value}`)

useHead(() => ({ title: t('invite.joinTitle') }))

const emailMismatch = computed(() =>
  Boolean(invite.value && loggedIn.value && (user.value?.email ?? '').toLowerCase() !== invite.value.email.toLowerCase()),
)

const accepting = ref(false)
const acceptError = ref<string | null>(null)

async function accept() {
  if (!loggedIn.value) {
    navigateTo(`/login?next=/invite/${token.value}`)
    return
  }
  accepting.value = true
  acceptError.value = null
  const res = await $fetch<ApiResponse<{ accepted: boolean }>>(`/api/team/invites/${token.value}`, {
    method: 'POST',
  }).catch((err) => {
    const data = (err as { data?: { error?: { message?: string } } }).data
    return { ok: false as const, error: { code: 'INTERNAL' as const, message: data?.error?.message ?? t('invite.acceptFailed') } }
  })

  if (!res.ok) {
    acceptError.value = res.error.message
    accepting.value = false
    return
  }
  await navigateTo('/dashboard')
}

function decline() {
  navigateTo('/')
}
</script>

<template>
  <div class="bg-background text-foreground min-h-screen">
    <main class="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-4">
      <div
        v-if="verifying"
        class="text-muted-foreground flex items-center justify-center gap-2 text-sm"
      >
        <Loader2
          class="size-4 animate-spin"
          aria-hidden="true"
        />
        {{ t('invite.loading') }}
      </div>

      <Card v-else-if="invite && !verifyFailed">
        <CardHeader class="items-center text-center">
          <CardTitle class="pt-3 text-2xl">
            {{ t('invite.joinTitle') }}
          </CardTitle>
          <CardDescription>
            {{ t('invite.description', { role: invite.role }) }}
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-3">
          <div class="text-muted-foreground flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
            <Mail
              class="size-4"
              aria-hidden="true"
            />
            <span>{{ t('invite.invitedEmail') }}: <span class="text-foreground">{{ invite.email }}</span></span>
          </div>
          <div class="text-muted-foreground flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
            <Users
              class="size-4"
              aria-hidden="true"
            />
            <span>{{ t('invite.roleLabel') }}: <span class="text-foreground">{{ invite.role }}</span></span>
          </div>
          <div
            v-if="emailMismatch"
            class="text-muted-foreground text-center text-xs"
          >
            {{ t('invite.needSignin', { email: invite.email }) }}
          </div>
          <div
            v-if="acceptError"
            class="text-destructive flex items-center gap-2 text-sm"
          >
            <AlertCircle
              class="size-4"
              aria-hidden="true"
            />
            {{ acceptError }}
          </div>
          <div class="flex flex-col gap-2 pt-2">
            <Button
              class="w-full"
              :disabled="accepting"
              @click="accept"
            >
              <Loader2
                v-if="accepting"
                class="size-4 animate-spin"
              />
              {{ accepting ? t('invite.accepting') : loggedIn && !emailMismatch ? t('invite.accept') : t('invite.signinCta') }}
            </Button>
            <Button
              variant="ghost"
              class="w-full"
              @click="decline"
            >
              {{ t('invite.decline') }}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card v-else-if="needsSignin">
        <CardHeader class="items-center text-center">
          <CardTitle class="pt-3 text-2xl">
            {{ t('invite.signinTitle') }}
          </CardTitle>
          <CardDescription>
            {{ t('invite.signinDescription') }}
          </CardDescription>
        </CardHeader>
        <CardContent class="flex flex-col gap-2">
          <Button
            as-child
            class="w-full"
          >
            <NuxtLink :to="signinHref">
              {{ t('invite.signinCta') }}
            </NuxtLink>
          </Button>
          <Button
            variant="ghost"
            class="w-full"
            @click="decline"
          >
            {{ t('invite.backHome') }}
          </Button>
        </CardContent>
      </Card>

      <Card v-else>
        <CardHeader class="items-center text-center">
          <CardTitle class="pt-3 text-2xl">
            {{ t('invite.invalidTitle') }}
          </CardTitle>
          <CardDescription>
            {{ t('invite.invalidDescription') }}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            class="w-full"
            @click="decline"
          >
            {{ t('invite.backHome') }}
          </Button>
        </CardContent>
      </Card>
    </main>
  </div>
</template>
