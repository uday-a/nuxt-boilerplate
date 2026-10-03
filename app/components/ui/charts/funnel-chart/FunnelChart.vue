<script setup lang="ts">
import { computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { FunnelChart as EChartsFunnelChart } from 'echarts/charts'
import { AriaComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { cn } from '@/lib/utils'
import {
  computeFunnelStats, describeFunnelForAria, formatPct, formatStepPill,
  funnelBarOpacity, normalizeFunnelStages,
} from '@/lib/funnel'
import {
  chartColors, chartMutedColor, chartSurfaceColor, chartTextColor,
  chartTooltipBg, chartTooltipBorder, chartTooltipText,
} from '../useChartTheme'

use([CanvasRenderer, EChartsFunnelChart, AriaComponent, TooltipComponent, LegendComponent])

interface Props {
  data: { name: string, value: number }[]
  height?: number | string
  showLabels?: boolean
  showLegend?: boolean
  /** ECharts option escape hatch -- merged on top of the computed option. */
  option?: any
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  height: 300,
  showLabels: true,
  showLegend: false,
})

// True ECharts funnel (triangle): stage order top->bottom matches the data
// order via sort:'none' (never re-sorts equal stages). Single-hue
// sequential fill -- chart-1 blue fading 1.0 -> 0.45 by depth -- instead of
// per-stage rainbow. (--primary is near-monochrome in both themes, so it
// reads black/white; --chart-1 keeps its hue across themes by token
// contract.) minSize keeps the tail stage wide enough that its inside label
// hides cleanly instead of truncating; the HTML step pills + sr-only table
// below always carry the exact numbers.
const stages = computed(() => normalizeFunnelStages(props.data))
const stats = computed(() => computeFunnelStats(stages.value))
const ariaLabel = computed(() => describeFunnelForAria(stats.value))

// Solid stage colour = primary laid over the card surface at the depth
// opacity. Pre-blending (instead of item opacity) keeps the same-colour
// round-join stroke from showing as a darker ring where it overlaps the fill.
// A 1px canvas resolves any CSS colour format (hex, rgb, oklch).
function blendOver(fg: string, bg: string, alpha: number): string {
  if (alpha >= 1 || typeof document === 'undefined') return fg
  const ctx = document.createElement('canvas').getContext('2d')
  if (!ctx) return fg
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, 1, 1)
  ctx.globalAlpha = alpha
  ctx.fillStyle = fg
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
  return `rgb(${r}, ${g}, ${b})`
}

const mergedOption = computed(() => {
  const primary = chartColors.value[0] ?? '#2563eb'
  return {
    color: [primary],
    tooltip: {
      trigger: 'item',
      backgroundColor: chartTooltipBg.value,
      borderColor: chartTooltipBorder.value,
      textStyle: { color: chartTooltipText.value, fontSize: 12 },
      formatter: (p: { dataIndex: number }) => {
        const s = stats.value.steps[p.dataIndex]
        if (!s) return ''
        const lines = [
          `<span class="font-semibold">${s.name}</span>`,
          `Count: ${s.value.toLocaleString()}`,
          s.stepRate === null
            ? 'Baseline: 100% of top'
            : `Step rate: ${formatPct(s.stepRate)} of ${s.prevName}`,
          `Cumulative: ${formatPct(s.cumulative)} of top`,
        ]
        if (s.delta !== null) {
          const sign = s.delta < 0 ? '−' : '+'
          lines.push(`Δ vs prior: ${sign}${Math.abs(s.delta).toLocaleString()}`)
        }
        return lines.join('<br/>')
      },
    },
    aria: { enabled: true, label: { description: ariaLabel.value } },
    legend: props.showLegend
      ? { bottom: 0, icon: 'circle', itemWidth: 8, itemHeight: 8, textStyle: { fontSize: 12, color: chartTextColor.value } }
      : undefined,
    series: [
      {
        name: 'Count',
        type: 'funnel',
        // Data order top->bottom (largest first in practice, but never
        // re-sorted -- equal stages keep their meaning).
        sort: 'none',
        orient: 'vertical',
        // Gap absorbs the 3px outer half of each stage's 6px round-join stroke
        // below, keeping a ~5px visible gutter between stages.
        gap: 11,
        // Tail floor: the last stage stays wide enough for its inside label
        // to hide cleanly instead of rendering truncated text.
        minSize: '28%',
        top: 8,
        bottom: 8,
        left: 8,
        right: 8,
        data: stages.value.map((s, i) => {
          const fill = blendOver(primary, chartSurfaceColor.value, funnelBarOpacity(i, stages.value.length))
          return {
            name: s.name,
            value: s.value,
            itemStyle: {
              color: fill,
              // ECharts funnel polygons have no borderRadius; a same-colour
              // stroke with round joins softens the corners (~3px radius).
              borderColor: fill,
              borderWidth: 6,
              borderJoin: 'round',
            },
          }
        }),
        // Smooth grow-in: staggered per-stage rise with a soft cubic-out
        // ease, re-played on range changes.
        animationDuration: 700,
        animationEasing: 'cubicOut',
        animationDelay: (idx: number) => idx * 60,
        label: {
          show: props.showLabels,
          position: 'inside',
          // WHY (Rule2): inside-label ink comes from the surface token, not
          // a raw '#fff' -- it tracks light/dark like every other token.
          color: chartSurfaceColor.value,
          fontSize: 12,
          fontWeight: 600,
          overflow: 'truncate',
          formatter: (p: { dataIndex: number }) => {
            const s = stats.value.steps[p.dataIndex]
            if (!s) return ''
            return `{t|${s.name}}\n{v|${s.value.toLocaleString()} · ${formatPct(s.cumulative)}}`
          },
          rich: {
            t: { fontSize: 12, fontWeight: 600, lineHeight: 16 },
            v: { fontSize: 12, fontWeight: 500, lineHeight: 16 },
          },
        },
        labelLayout: { hideOverlap: true },
        emphasis: { focus: 'self', scaleSize: 4 },
        // Non-hovered stages grey out (solid muted fill, readable label)
        // instead of ECharts' default near-transparent blur.
        blur: {
          itemStyle: { color: chartMutedColor.value, borderColor: chartMutedColor.value, opacity: 1 },
          label: { color: chartTextColor.value, opacity: 1 },
        },
      },
    ],
    ...props.option,
  }
})
</script>

<template>
  <div :class="cn('w-full', props.class)">
    <div
      role="img"
      tabindex="0"
      :aria-label="ariaLabel"
      :style="{ height: /^\d+$/.test(String(height)) ? `${height}px` : String(height) }"
      :class="cn('w-full rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring')"
    >
      <VChart
        :option="mergedOption"
        :autoresize="true"
        class="size-full"
      />
    </div>
    <!-- Step-conversion pills: HTML (not canvas) so they wrap instead of
      clipping at narrow widths. The sr-only table below is the precise
      screen-reader source; these pills are the glanceable summary. -->
    <ul
      v-if="stats.steps.length > 0"
      class="mt-3 flex flex-wrap gap-1.5"
      aria-label="Step conversion rates"
    >
      <li
        v-for="(s, i) in stats.steps"
        :key="`${s.name}-${i}`"
        class="bg-muted text-muted-foreground rounded-full px-2.5 py-1 text-xs font-medium tabular-nums"
      >
        {{ formatStepPill(s) }}
      </li>
    </ul>
    <table class="sr-only">
      <caption>Conversion funnel by stage</caption>
      <thead>
        <tr>
          <th scope="col">
            Stage
          </th>
          <th scope="col">
            Count
          </th>
          <th scope="col">
            Step rate
          </th>
          <th scope="col">
            Cumulative
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(s, i) in stats.steps"
          :key="`${s.name}-${i}`"
        >
          <th scope="row">
            {{ s.name }}
          </th>
          <td>{{ s.value.toLocaleString() }}</td>
          <td>{{ s.stepRate === null ? '100% baseline' : `${formatPct(s.stepRate)} from ${s.prevName}` }}</td>
          <td>{{ formatPct(s.cumulative) }} of top</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
