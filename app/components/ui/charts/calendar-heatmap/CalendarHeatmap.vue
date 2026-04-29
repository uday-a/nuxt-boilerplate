<script setup lang="ts">
import { computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { HeatmapChart as EChartsHeatmapChart } from 'echarts/charts'
import { CalendarComponent, TooltipComponent, VisualMapComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { cn } from '@/lib/utils'
import { chartColors, chartTextColor, chartSplitLineColor, chartTooltipBg, chartTooltipBorder, chartTooltipText } from '../useChartTheme'

interface Props {
  /** [date string YYYY-MM-DD, value] tuples. */
  data: [string, number][]
  range: string | [string, string]
  height?: number | string
  /** Cell colour ramp [from, to] - default: chart-1 from light to saturated. */
  colorRange?: [string, string]
  option?: any
  class?: string
}

use([CanvasRenderer, EChartsHeatmapChart, CalendarComponent, TooltipComponent, VisualMapComponent])

const props = withDefaults(defineProps<Props>(), {
  height: 200,
  colorRange: () => ['#fef3c7', '#d97706'],
})

const maxValue = computed(() => props.data.reduce((m, [, v]) => Math.max(m, v), 0) || 1)

const mergedOption = computed(() => ({
  color: chartColors.value,
  tooltip: {
    position: 'top',
    formatter: (p: any) => `<strong>${p.value[0]}</strong><br>${p.value[1]} contributions`,
    backgroundColor: chartTooltipBg.value,
    borderColor: chartTooltipBorder.value,
    textStyle: { color: chartTooltipText.value, fontSize: 12 },
  },
  visualMap: {
    show: false,
    min: 0,
    max: maxValue.value,
    inRange: { color: props.colorRange },
  },
  calendar: {
    top: 24,
    left: 36,
    right: 12,
    cellSize: ['auto', 14],
    range: props.range,
    itemStyle: { color: chartSplitLineColor.value, borderColor: '#fff', borderWidth: 2 },
    splitLine: { show: false },
    dayLabel: { color: chartTextColor.value, fontSize: 10, firstDay: 1, nameMap: ['S', 'M', 'T', 'W', 'T', 'F', 'S'] },
    monthLabel: { color: chartTextColor.value, fontSize: 10, fontWeight: 600 },
    yearLabel: { show: false },
  },
  series: [
    {
      type: 'heatmap',
      coordinateSystem: 'calendar',
      data: props.data,
    },
  ],
  ...props.option,
}))
</script>

<template>
  <div
    :style="{ height: /^\d+$/.test(String(height)) ? `${height}px` : String(height) }"
    :class="cn('w-full', props.class)"
  >
    <VChart :option="mergedOption" :autoresize="true" class="size-full" />
  </div>
</template>
