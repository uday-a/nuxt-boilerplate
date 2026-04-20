<script setup lang="ts">
import { computed } from 'vue'
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  class?: HTMLAttributes['class']
  lines?: number
  lastLineWidth?: string
  firstLineWidth?: string
}

const props = withDefaults(defineProps<Props>(), {
  lines: 3,
  lastLineWidth: '80%',
  firstLineWidth: '100%',
})

const lineWidths = computed(() => {
  return Array.from({ length: props.lines }, (_, i) => {
    if (i === 0) return props.firstLineWidth
    if (i === props.lines - 1) return props.lastLineWidth
    return '100%'
  })
})
</script>

<template>
  <div data-uipkge data-slot="skeleton-text" :class="cn('space-y-2', props.class)">
    <div v-for="(width, i) in lineWidths" :key="i" class="bg-primary/10 h-4 animate-pulse rounded" :style="{ width }" />
  </div>
</template>
