<script setup lang="ts">
definePageMeta({ auth: false, layout: false })

const { loggedIn } = useUserSession()
if (loggedIn.value) await navigateTo('/dashboard')

function onGithub() {
  window.location.href = '/auth/github'
}
</script>

<template>
  <main class="bg-background flex min-h-screen items-center justify-center p-6">
    <div class="bg-card w-full max-w-sm space-y-6 rounded-xl border p-8 shadow-sm">
      <div class="space-y-1">
        <h1 class="text-xl font-semibold">Sign in</h1>
        <p class="text-muted-foreground text-sm">Auth surface is coming via registry blocks in a follow-up.</p>
      </div>
      <button
        type="button"
        class="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-md px-4 py-2 text-sm font-medium"
        @click="onGithub"
      >
        Continue with GitHub
      </button>
    </div>
  </main>
</template>
