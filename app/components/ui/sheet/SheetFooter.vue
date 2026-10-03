<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <div
    data-uipkge
    data-slot="sheet-footer"
    :class="cn('mt-auto flex shrink-0 flex-col-reverse gap-2 border-t p-4 sm:flex-row sm:justify-end', props.class)"
  >
    <slot />
  </div>
</template>
