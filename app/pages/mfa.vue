<script setup lang="ts">
definePageMeta({ auth: false, layout: false })
useHead({ title: 'Two-step verification' })

// MFA is part of the sign-in flow. Once a session exists, the user has
// already cleared the bar — bounce them to the dashboard.
const { loggedIn } = useUserSession()
if (loggedIn.value) await navigateTo('/dashboard')

function onVerify(code: string) {
  console.warn('MFA verify (mock-only):', code)
}

function onContinue() {
  navigateTo('/dashboard')
}
</script>

<template>
  <AuthMfa
    continue-href="/dashboard"
    recovery-href="#"
    @verify="onVerify"
    @continue="onContinue"
  />
</template>
