<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { safeRedirectPath } from '@/lib/utils'
import { Sparkles, Mail, AlertCircle, CheckCircle2 } from 'lucide-vue-next'
import type { ApiResponse } from '~~/server/utils/response'

definePageMeta({ auth: false, layout: false })
useHead({ title: 'Sign in' })

const { loggedIn, fetch: refreshSession } = useUserSession()
if (loggedIn.value) await navigateTo('/dashboard')

const route = useRoute()
const next = computed(() => safeRedirectPath(typeof route.query.next === 'string' ? route.query.next : '/dashboard'))

// Show an explanatory error banner when the magic-link verify endpoint
// bounces a bad/expired/used token. Map the short ?error= code from the
// /auth/magic-link redirect to user-facing copy.
const errorBanner = computed(() => {
  const code = typeof route.query.error === 'string' ? route.query.error : null
  switch (code) {
    case 'magic-link-expired': return 'That sign-in link expired. Request a fresh one below.'
    case 'magic-link-used': return 'That sign-in link was already used. Request a fresh one below.'
    case 'magic-link-invalid': return 'That sign-in link is invalid. Request a fresh one below.'
    case 'magic-link-missing-token': return 'Sign-in link was missing a token. Request a fresh one below.'
    case 'magic-link-db-required': return 'Magic-link sign-in needs a DATABASE_URL configured. Use GitHub instead.'
    case 'magic-link-failed': return 'Sign-in failed. Try again or use GitHub.'
    case 'oauth': return 'GitHub sign-in failed. Try again.'
    default: return null
  }
})

// Demo mode flag comes from runtimeConfig.public.demoMode, which mirrors
// the server's `isDemoMode` (see server/utils/env.ts).
const demoMode = useRuntimeConfig().public.demoMode

const demoLoading = ref(false)

async function signInAsDemo() {
  demoLoading.value = true
  try {
    const res = await $fetch('/auth/demo', { method: 'POST' })
    console.log('DEMO_SIGNIN_SUCCESS', res)
    await refreshSession()
    await navigateTo(next.value)
  }
  catch (err) {
    console.error('DEMO_SIGNIN_ERROR', err)
  }
  finally {
    demoLoading.value = false
  }
}

// Magic-link request triggered by the AuthSignIn form's submit event.
// We hijack the email field and ignore the password — magic-link IS the
// auth, no password needed. The block's password field becomes vestigial
// when GitHub OAuth + magic-link are the only configured paths.
type LinkState = { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent', email: string } | { kind: 'error', message: string }
const linkState = ref<LinkState>({ kind: 'idle' })

async function onSubmit(payload: { email: string, password: string, remember: boolean }) {
  linkState.value = { kind: 'sending' }
  const res = await $fetch<ApiResponse<{ expiresInMin: number }>>('/auth/magic-link', {
    method: 'POST',
    body: { email: payload.email },
  }).catch((err) => {
    const data = (err as { data?: { error?: { message?: string } } }).data
    return { ok: false, error: { code: 'INTERNAL', message: data?.error?.message ?? 'Failed to send link' } } as const
  })

  if (!res.ok) {
    linkState.value = { kind: 'error', message: res.error.message }
    return
  }
  linkState.value = { kind: 'sent', email: payload.email }
}

function onOauth(provider: 'github' | 'google') {
  if (provider !== 'github') {
    alert('Only GitHub OAuth is wired right now.')
    return
  }
  // Hard navigation so the browser follows the OAuth redirect to GitHub.
  window.location.href = `/auth/github?next=${encodeURIComponent(next.value)}`
}
</script>

<template>
  <div class="bg-background relative flex min-h-svh items-center justify-center p-6 md:p-10">
    <div class="w-full max-w-sm">
      <AuthSignIn
        forgot-password-href="/forgot-password"
        sign-up-href="/sign-up"
        :oauth-providers="['github']"
        @submit="onSubmit"
        @oauth="onOauth"
      />

      <!-- Top toast overlays -- error banner on bad magic link, confirmation on send -->
      <div
        v-if="errorBanner"
        class="fixed top-6 right-6 z-50 max-w-sm"
      >
        <div class="bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border border-destructive/20 p-4 text-sm shadow-lg">
          <AlertCircle class="size-4 shrink-0" />
          <span>{{ errorBanner }}</span>
        </div>
      </div>

      <div
        v-if="linkState.kind === 'sent'"
        class="fixed top-6 right-6 z-50 max-w-sm"
      >
        <div class="bg-primary/10 text-primary flex items-center gap-2 rounded-lg border border-primary/20 p-4 text-sm shadow-lg">
          <Mail class="size-4 shrink-0" />
          <span>Sign-in link sent to <strong>{{ linkState.email }}</strong>. Check your inbox.</span>
        </div>
      </div>

      <div
        v-if="linkState.kind === 'error'"
        class="fixed top-6 right-6 z-50 max-w-sm"
      >
        <div class="bg-destructive/10 text-destructive flex items-center gap-2 rounded-lg border border-destructive/20 p-4 text-sm shadow-lg">
          <AlertCircle class="size-4 shrink-0" />
          <span>{{ linkState.message }}</span>
        </div>
      </div>
    </div>

    <!-- Floating demo affordance — only shown when OAuth isn't configured.
         Positioned outside the auth card so it doesn't fight with the
         form's layout, and explicit about being a demo (not a real path). -->
    <div
      v-if="demoMode"
      class="fixed inset-x-0 bottom-6 z-40 flex justify-center px-4"
    >
      <div class="bg-background/95 ring-border/60 flex items-center gap-3 rounded-full border px-4 py-2 shadow-lg backdrop-blur ring-1">
        <Sparkles class="text-primary size-4" />
        <span class="text-muted-foreground text-sm">
          No GitHub OAuth configured.
        </span>
        <Button
          size="sm"
          :disabled="demoLoading"
          @click="signInAsDemo"
        >
          {{ demoLoading ? 'Signing in…' : 'Continue as demo user' }}
        </Button>
      </div>
    </div>
  </div>
</template>
