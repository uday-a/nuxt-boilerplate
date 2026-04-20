<script setup lang="ts">
definePageMeta({ auth: false, layout: false })
useHead({ title: 'Two-step verification' })

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
