<script setup lang="ts">
import { cn } from '@/lib/utils'

defineProps<{
  class?: string
}>()
</script>

<template>
  <div :class="cn('flex flex-col justify-between gap-4 sm:flex-row sm:items-center', $props.class)">
    <div class="flex-1">
      <slot />
    </div>
    <div
      v-if="$slots.actions"
      class="flex flex-wrap items-center gap-2 self-start sm:self-auto"
    >
      <slot name="actions" />
    </div>
  </div>
</template>
