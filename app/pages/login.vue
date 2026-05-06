<script setup lang="ts">
definePageMeta({ auth: false, layout: false })
useHead({ title: 'Sign in' })

const { loggedIn } = useUserSession()
if (loggedIn.value) await navigateTo('/dashboard')

function onSubmit(_payload: { email: string, password: string, remember: boolean }) {
  alert('Email/password not implemented. Use the GitHub button.')
}

function onOAuth(provider: 'github' | 'google') {
  if (provider !== 'github') {
    alert('Only GitHub OAuth is wired right now.')
    return
  }
  window.location.href = '/auth/github'
}
</script>

<template>
  <AuthSignIn
    sign-up-href="/sign-up"
    forgot-password-href="/forgot-password"
    :oauth-providers="['github']"
    @submit="onSubmit"
    @oauth="onOAuth"
  />
</template>
