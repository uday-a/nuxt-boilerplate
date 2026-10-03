<script setup lang="ts">
import 'vue-sonner/style.css'
import { Toaster } from '@/components/ui/sonner'
import { COLOR_THEME_DEFAULT } from '@/lib/color-themes'
import { useColorTheme } from '@/composables/useColorTheme'

// Colour theme + radius on <html> (SSR too, so the first paint is already
// themed). 'default' drops the attribute → plain neutral tokens.
const { colorTheme, radius } = useColorTheme()
useHead({
  htmlAttrs: {
    'data-color-theme': () => (colorTheme.value === COLOR_THEME_DEFAULT ? undefined : colorTheme.value),
    'style': () => `--radius: ${radius.value}rem`,
  },
})
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <!-- One toast host for the whole app; call `toast()` from vue-sonner anywhere. -->
    <ClientOnly>
      <Toaster />
    </ClientOnly>
  </div>
</template>
