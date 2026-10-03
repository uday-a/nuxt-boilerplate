<script setup lang="ts">
import { cn } from '@/lib/utils'

defineProps<{
  title: string
  description?: string
  class?: string
}>()
</script>

<template>
  <div :class="cn('', $props.class)">
    <h1 class="text-2xl font-semibold tracking-tight">
      {{ title }}
    </h1>
    <p
      v-if="description"
      class="text-muted-foreground mt-1 text-sm"
    >
      {{ description }}
    </p>
  </div>
</template>
