<script setup lang="ts">
import { cn } from '@/lib/utils'
</script>

<template>
  <div
    :class="
      cn(
        'flex flex-row items-center justify-between border-b py-4 transition-all duration-200 first:pt-0 last:border-0 last:pb-0',
        $attrs.class as string,
      )
    "
  >
    <slot />
  </div>
</template>
