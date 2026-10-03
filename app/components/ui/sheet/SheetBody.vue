<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

// The scrolling middle of a sheet: SheetHeader (title + close) and
// SheetFooter (actions) stay pinned; only this region scrolls.
const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <div
    data-uipkge
    data-slot="sheet-body"
    :class="cn('min-h-0 flex-1 overflow-y-auto p-4', props.class)"
  >
    <slot />
  </div>
</template>
