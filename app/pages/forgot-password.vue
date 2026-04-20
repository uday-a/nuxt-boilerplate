<script setup lang="ts">
definePageMeta({ auth: false, layout: false })
useHead({ title: 'Reset password' })

function onRequest(email: string) {
  console.warn('Password reset requested for:', email, '(not wired)')
}

function onReset(_password: string) {
  console.warn('Password reset submitted (not wired)')
}
</script>

<template>
  <AuthPasswordReset sign-in-href="/login" @request="onRequest" @reset="onReset" />
</template>
