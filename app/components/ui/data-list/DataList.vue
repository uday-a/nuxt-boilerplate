<script setup lang="ts">
import { cn } from '@/lib/utils'
</script>

<template>
  <div :class="cn('flex flex-col', $attrs.class as string)">
    <slot />
  </div>
</template>
