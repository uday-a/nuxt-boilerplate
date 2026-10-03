<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <div
    data-uipkge
    data-slot="sheet-header"
    :class="cn('flex shrink-0 flex-col gap-1.5 border-b p-4 pr-12', props.class)"
  >
    <slot />
  </div>
</template>
