<script setup lang="ts">
definePageMeta({ auth: false, layout: false })
useHead({ title: 'Create an account' })

const { loggedIn } = useUserSession()
if (loggedIn.value) await navigateTo('/dashboard')

function onSubmit(_payload: { name: string, email: string, password: string }) {
  alert('Email signup is not wired. Use the GitHub button to continue.')
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
  <AuthSignUp
    sign-in-href="/login"
    :oauth-providers="['github']"
    @submit="onSubmit"
    @oauth="onOAuth"
  />
</template>
