<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

// Scrollable content between DialogHeader and DialogFooter. Bleeds to the
// dialog edges so the scrollbar sits at the border, not inside the padding.
const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <div
    data-uipkge
    data-slot="dialog-body"
    :class="cn('-mx-4 max-h-[60vh] overflow-y-auto px-4', props.class)"
  >
    <slot />
  </div>
</template>
