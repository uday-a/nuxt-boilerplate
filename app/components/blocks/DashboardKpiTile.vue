<script setup lang="ts">
import type { Component } from 'vue'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'

// Shared KPI tile shape for the dashboard hero strip. Encapsulates the
// label/value/delta header so the page stops repeating Card+CardHeader+
// CardContent six times. Default slot is whatever sits under the
// headline number -- a Sparkline, a Bar/Area chart, or a Progress
// block. The slot adds its own top spacing so we don't impose a margin
// the Churn-style Progress layout doesn't want.

defineProps<{
  label: string
  value: string
  delta?: string
  // Tone for the delta string. Default 'positive' = emerald. Use
  // 'negative' explicitly when the metric is "up = bad" (e.g. latency,
  // churn that grew) -- direction can't be inferred from the +/- sign
  // because churn going DOWN is good.
  deltaTone?: 'positive' | 'negative'
  icon?: Component
  iconClass?: string
}>()
</script>

<template>
  <Card>
    <CardHeader class="pb-2">
      <CardDescription class="text-[10px] uppercase tracking-wider flex items-center justify-between">
        {{ label }}
        <component :is="icon" v-if="icon" :class="['size-3', iconClass]" />
      </CardDescription>
    </CardHeader>
    <CardContent class="pb-3">
      <div class="flex items-baseline gap-1.5">
        <span class="text-xl font-semibold tabular-nums">{{ value }}</span>
        <span
          v-if="delta"
          :class="['text-[11px] font-medium', deltaTone === 'negative' ? 'text-rose-600' : 'text-emerald-600']"
        >
          {{ delta }}
        </span>
      </div>
      <slot />
    </CardContent>
  </Card>
</template>
