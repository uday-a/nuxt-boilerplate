<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div
    data-uipkge
    data-slot="card-header"
    :class="
      cn(
        // Upstream minus `grid-rows-[auto_auto]`: an explicit empty second
        // row keeps its 6px gap under title-only headers.
        'grid auto-rows-min grid-cols-[minmax(0,1fr)] items-start gap-1.5 p-4 has-data-[slot=card-action]:grid-cols-[minmax(0,1fr)_auto]',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
