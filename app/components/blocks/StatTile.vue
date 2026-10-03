<script setup lang="ts">
import type { Component } from 'vue'
import { computed } from 'vue'
import { Info, TrendingDown, TrendingUp } from '@/lib/icon-pack'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

// The app's one stat tile. Every KPI strip (dashboard, calendar,
// activity, locations) uses this so label, number and delta read the
// same everywhere. Default slot sits under the value (sparkline,
// mini-chart, progress); `footer` is a muted line at the bottom.

const props = defineProps<{
  label: string
  value: string
  delta?: string
  // Tone for the delta string. Default 'positive'. Use 'negative' when
  // the metric is "up = bad" (latency) -- direction can't be inferred
  // from the sign because churn going DOWN is good.
  deltaTone?: 'positive' | 'negative'
  // Short muted unit/context under the value ("sessions/day").
  caption?: string
  icon?: Component
  // Category dot before the label, e.g. 'bg-chart-1'.
  dotClass?: string
  // WHY (Rule97): optional formula/grain note rendered as an info tooltip
  // next to the label so a KPI's definition is one hover away.
  definition?: string
}>()

// WHY (Rules 37/40): color never carries direction alone -- a shape
// (TrendingUp/TrendingDown) rides next to the delta. Sign is read from the
// string ('-', '−' and '↓' count as down); tone only picks the color.
const deltaDown = computed(() => {
  const d = (props.delta ?? '').trim()
  return d.startsWith('-') || d.startsWith('−') || d.startsWith('↓')
})
</script>

<template>
  <Card class="flex flex-col">
    <CardHeader class="px-4 pt-4 pb-1">
      <CardDescription class="text-muted-foreground flex items-center justify-between gap-2 text-xs font-medium tracking-wider uppercase">
        <span class="flex min-w-0 items-center gap-1.5">
          <span
            v-if="dotClass"
            :class="['size-2 shrink-0 rounded-full', dotClass]"
            aria-hidden="true"
          />
          <span
            class="truncate"
            :title="label"
          >{{ label }}</span>
          <TooltipProvider v-if="definition">
            <Tooltip>
              <TooltipTrigger as-child>
                <button
                  type="button"
                  class="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex shrink-0 items-center rounded focus-visible:ring-2 focus-visible:outline-none"
                  :aria-label="`${label} definition`"
                >
                  <Info
                    class="size-3.5"
                    aria-hidden="true"
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent class="max-w-56 text-xs">
                {{ definition }}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </span>
        <component
          :is="icon"
          v-if="icon"
          class="text-muted-foreground size-4 shrink-0"
          aria-hidden="true"
        />
      </CardDescription>
    </CardHeader>
    <CardContent class="flex flex-1 flex-col px-4 pb-4">
      <div class="flex flex-wrap items-baseline gap-x-2">
        <span class="text-2xl font-semibold tracking-tight tabular-nums">{{ value }}</span>
        <span
          v-if="delta"
          :class="['inline-flex items-center gap-0.5 text-xs font-medium tabular-nums', deltaTone === 'negative' ? 'text-destructive' : 'text-success']"
        >
          <component
            :is="deltaDown ? TrendingDown : TrendingUp"
            class="size-3"
            aria-hidden="true"
          />
          {{ delta }}
        </span>
      </div>
      <p
        v-if="caption"
        class="text-muted-foreground mt-0.5 text-xs"
      >
        {{ caption }}
      </p>
      <slot />
      <div
        v-if="$slots.footer"
        class="text-muted-foreground mt-auto pt-3 text-xs"
      >
        <slot name="footer" />
      </div>
    </CardContent>
  </Card>
</template>
