<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-vue-next'

definePageMeta({ auth: false, layout: false })
useHead({ title: 'Sign in' })

const { loggedIn, fetch: refreshSession } = useUserSession()
if (loggedIn.value) await navigateTo('/dashboard')

const route = useRoute()
const next = computed(() => (typeof route.query.next === 'string' ? route.query.next : '/dashboard'))

// Demo mode flag comes from runtimeConfig.public.demoMode, which mirrors
// the server's `isDemoMode` (see server/utils/env.ts).
const demoMode = useRuntimeConfig().public.demoMode

const demoLoading = ref(false)

async function signInAsDemo() {
  demoLoading.value = true
  try {
    await $fetch('/auth/demo', { method: 'POST' })
    await refreshSession()
    await navigateTo(next.value)
  }
  finally {
    demoLoading.value = false
  }
}

function onSubmit(_payload: { email: string, password: string, remember: boolean }) {
  alert('Email/password not implemented. Use GitHub or demo sign-in.')
}

function onOAuth(provider: 'github' | 'google') {
  if (provider !== 'github') {
    alert('Only GitHub OAuth is wired right now.')
    return
  }
  window.location.href = `/auth/github?next=${encodeURIComponent(next.value)}`
}
</script>

<template>
  <div class="relative">
    <AuthSignIn
      sign-up-href="/sign-up"
      forgot-password-href="/forgot-password"
      :oauth-providers="['github']"
      @submit="onSubmit"
      @oauth="onOAuth"
    />

    <!-- Floating demo affordance — only shown when OAuth isn't configured.
         Positioned outside the auth card so it doesn't fight with the
         form's layout, and explicit about being a demo (not a real path). -->
    <div
      v-if="demoMode"
      class="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-4"
    >
      <div class="pointer-events-auto bg-background/95 ring-border/60 flex items-center gap-3 rounded-full border px-4 py-2 shadow-lg backdrop-blur ring-1">
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
