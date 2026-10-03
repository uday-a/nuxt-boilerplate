<script setup lang="ts">
import { OverlayScroll } from '@/components/ui/overlay-scroll'
</script>

<template>
  <OverlayScroll class="h-24 rounded-md border p-2">
    <p
      v-for="i in 10"
      :key="i"
      class="py-1 text-xs"
    >
      Scrollable content line {{ i }}
    </p>
  </OverlayScroll>
</template>
