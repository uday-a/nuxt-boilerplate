<script setup lang="ts">
import { shallowRef } from 'vue'
import { getLocalTimeZone, today, type DateValue } from '@internationalized/date'
import { Calendar } from '@/components/ui/calendar'

const date = shallowRef<DateValue>(today(getLocalTimeZone()))
</script>

<template>
  <div class="flex flex-wrap items-start gap-4">
    <Calendar
      v-model="date"
      class="rounded-md border"
    />
    <p class="text-muted-foreground text-xs">
      Selected: <span class="text-foreground tabular-nums">{{ date?.toString() }}</span>
    </p>
  </div>
</template>
