<script setup lang="ts">
import { Info } from '@/lib/icon-pack'

// The single place a page admits it's showing sample data. Replaces the
// scattered implementation notes that used to sit in page copy.

defineProps<{ message?: string }>()
</script>

<template>
  <div
    class="bg-muted/50 text-muted-foreground flex items-center gap-2 rounded-md border px-3 py-2 text-xs"
    role="note"
  >
    <Info
      class="size-3.5 shrink-0"
      aria-hidden="true"
    />
    <span>{{ message ?? 'Sample data. Connect a database to see live records.' }}</span>
  </div>
</template>
