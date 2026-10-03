<script setup lang="ts">
import { ref } from 'vue'
import { getLocalTimeZone, today } from '@internationalized/date'
import { RangeCalendar } from '@/components/ui/range-calendar'

const start = today(getLocalTimeZone())
// reka's DateRange type doesn't narrow cleanly through v-model; same as the dashboard picker.
const range = ref<any>({ start: start.subtract({ days: 6 }), end: start })
</script>

<template>
  <div class="flex flex-wrap items-start gap-4">
    <RangeCalendar
      v-model="range"
      class="rounded-md border"
    />
    <p class="text-muted-foreground text-xs">
      <span class="text-foreground tabular-nums">{{ range.start?.toString() }}</span>
      to
      <span class="text-foreground tabular-nums">{{ range.end?.toString() }}</span>
    </p>
  </div>
</template>
