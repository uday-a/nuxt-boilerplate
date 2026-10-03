<script setup lang="ts">
import { computed } from 'vue'

// One usage meter for Billing and Limits. Colour follows a single
// threshold rule: < 70% neutral, 70-89% warning, >= 90% destructive.

const props = defineProps<{
  label: string
  used: number
  limit: number
  // Pre-formatted "used / limit" text; defaults to locale numbers.
  valueText?: string
  // Muted qualifier next to the label ("this month", "workspace total").
  scope?: string
}>()

const pct = computed(() => (props.limit > 0 ? Math.min(100, Math.round((props.used / props.limit) * 100)) : 0))
const tone = computed(() => (pct.value >= 90 ? 'bg-destructive' : pct.value >= 70 ? 'bg-warning' : 'bg-foreground'))
const text = computed(() => props.valueText ?? `${props.used.toLocaleString()} / ${props.limit.toLocaleString()}`)
</script>

<template>
  <div class="space-y-1.5">
    <div class="flex items-baseline justify-between gap-3 text-sm">
      <span class="font-medium">
        {{ label }}
        <span
          v-if="scope"
          class="text-muted-foreground ml-1 text-xs font-normal"
        >{{ scope }}</span>
      </span>
      <span class="text-muted-foreground text-xs tabular-nums">
        {{ text }} <span :class="pct >= 90 ? 'text-destructive font-medium' : pct >= 70 ? 'text-warning font-medium' : ''">({{ pct }}%)</span>
      </span>
    </div>
    <div
      class="bg-muted h-1.5 w-full overflow-hidden rounded-full"
      role="progressbar"
      :aria-label="label"
      :aria-valuenow="pct"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div
        :class="['h-full rounded-full transition-[width] duration-200', tone]"
        :style="{ width: `${pct}%` }"
      />
    </div>
  </div>
</template>
