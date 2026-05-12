<script setup lang="ts">
import type { ApiResponse } from '~~/server/utils/response'

definePageMeta({ auth: false, layout: false })
useHead({ title: 'Sign-in link' })

// Already signed in? Skip the form — they don't need to reset.
const { loggedIn } = useUserSession()
if (loggedIn.value) await navigateTo('/dashboard')

const status = ref<'idle' | 'sending' | 'sent' | 'error'>('idle')
const errorMsg = ref('')

async function onRequest(email: string) {
  status.value = 'sending'
  errorMsg.value = ''

  const res = await $fetch<ApiResponse<{ expiresInMin: number }>>('/auth/magic-link', {
    method: 'POST',
    body: { email },
  }).catch((err) => {
    const data = (err as { data?: { error?: { message?: string } } }).data
    return { ok: false, error: { code: 'INTERNAL', message: data?.error?.message ?? 'Failed to send link' } } as const
  })

  if (!res.ok) {
    errorMsg.value = res.error.message
    status.value = 'error'
    return
  }
  status.value = 'sent'
}

// The /reset path is unused — magic-link IS the recovery. Keep the
// component's submit slot inert.
function onReset(_password: string) {
  // intentional: with magic-link, there is no password to reset.
}
</script>

<template>
  <div>
    <AuthPasswordReset
      sign-in-href="/login"
      @request="onRequest"
      @reset="onReset"
    />
    <!-- Errors surface in a toast-style overlay rather than inside the
         card. Keeping the card's existing stage machine intact so any
         AuthPasswordReset registry update lands cleanly. -->
    <div
      v-if="status === 'error'"
      class="fixed inset-x-0 bottom-6 z-50 mx-auto w-fit max-w-md rounded-full border border-destructive/30 bg-background/95 px-4 py-2 text-sm text-destructive shadow-lg backdrop-blur"
    >
      {{ errorMsg }}
    </div>
  </div>
</template>
