<script setup lang="ts">
import { computed } from 'vue'
import { Sun, Moon, Monitor } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/composables/useTheme'

const { theme, setTheme } = useTheme()

const next = computed(() => {
  if (theme.value === 'light') return 'dark'
  if (theme.value === 'dark') return 'system'
  return 'light'
})

const label = computed(() => `Theme: ${theme.value} (click for ${next.value})`)
</script>

<template>
  <ClientOnly>
    <Button
      variant="ghost"
      size="icon"
      :aria-label="label"
      :title="label"
      @click="setTheme(next)"
    >
      <Sun v-if="theme === 'light'" class="size-4" />
      <Moon v-else-if="theme === 'dark'" class="size-4" />
      <Monitor v-else class="size-4" />
    </Button>
    <template #fallback>
      <Button variant="ghost" size="icon" aria-hidden="true" tabindex="-1" />
    </template>
  </ClientOnly>
</template>
