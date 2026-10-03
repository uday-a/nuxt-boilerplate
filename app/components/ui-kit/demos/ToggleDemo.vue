<script setup lang="ts">
import { Bold, Italic, Underline } from '@/lib/icon-pack'
import { Toggle } from '@/components/ui/toggle'
</script>

<template>
  <div class="flex gap-2">
    <Toggle aria-label="Bold">
      <Bold class="size-4" />
    </Toggle>
    <Toggle aria-label="Italic">
      <Italic class="size-4" />
    </Toggle>
    <Toggle aria-label="Underline">
      <Underline class="size-4" />
    </Toggle>
  </div>
</template>
