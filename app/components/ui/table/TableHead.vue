<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <th
    data-uipkge
    data-slot="table-head"
    :class="
      cn(
        'text-foreground h-12 px-3 text-sm text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
        props.class
      )
    "
  >
    <slot />
  </th>
</template>
