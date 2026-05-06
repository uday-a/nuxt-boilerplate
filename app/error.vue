<script setup lang="ts">
import type { NuxtError } from '#app'
import { Button } from '@/components/ui/button'

const props = defineProps<{ error: NuxtError }>()

useHead(() => ({ title: `${props.error.statusCode ?? 'Error'} · Acme` }))

const is404 = computed(() => Number(props.error.statusCode) === 404)
const title = computed(() => (is404.value ? 'Page not found' : 'Something broke'))
const description = computed(() =>
  is404.value
    ? 'The page you were looking for doesn’t exist or was moved.'
    : props.error.statusMessage || 'An unexpected error occurred.',
)

function goHome() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div class="bg-background text-foreground min-h-screen">
    <main class="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 py-16 text-center">
      <p class="text-muted-foreground font-mono text-sm tracking-widest">
        {{ error.statusCode ?? 'ERROR' }}
      </p>
      <h1 class="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        {{ title }}
      </h1>
      <p class="text-muted-foreground mt-3 text-base">
        {{ description }}
      </p>
      <div class="mt-8 flex gap-3">
        <Button
          as-child
          variant="outline"
        >
          <NuxtLink to="/">Go home</NuxtLink>
        </Button>
        <Button @click="goHome">
          Try again
        </Button>
      </div>
    </main>
  </div>
</template>
