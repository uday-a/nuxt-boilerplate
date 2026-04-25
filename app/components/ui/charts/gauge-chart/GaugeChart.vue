<script setup lang="ts">
import { computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { GaugeChart as EChartsGaugeChart } from 'echarts/charts'
import { TooltipComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { cn } from '@/lib/utils'
import { chartColors, chartTextColor, chartTooltipBg, chartTooltipBorder, chartTooltipText } from '../useChartTheme'

interface Props {
  value: number
  min?: number
  max?: number
  unit?: string
  label?: string
  height?: number | string
  /** Colour stops as [percentage, hex] pairs. Default: green→amber→red. */
  thresholds?: [number, string][]
  option?: any
  class?: string
}

use([CanvasRenderer, EChartsGaugeChart, TooltipComponent])

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  unit: '',
  height: 220,
  thresholds: () => [
    [0.6, '#16a34a'],
    [0.85, '#f59e0b'],
    [1, '#dc2626'],
  ],
})

const mergedOption = computed(() => ({
  tooltip: {
    formatter: '{b}: {c}' + (props.unit ? ` ${props.unit}` : ''),
    backgroundColor: chartTooltipBg,
    borderColor: chartTooltipBorder,
    textStyle: { color: chartTooltipText, fontSize: 12 },
  },
  series: [
    {
      type: 'gauge',
      min: props.min,
      max: props.max,
      center: ['50%', '60%'],
      radius: '85%',
      startAngle: 200,
      endAngle: -20,
      progress: { show: true, width: 14 },
      pointer: { show: true, length: '55%', width: 4 },
      axisLine: {
        lineStyle: {
          width: 14,
          color: props.thresholds.map(([stop, color]) => [stop, color] as [number, string]),
        },
      },
      axisTick: { distance: -22, length: 4, lineStyle: { color: chartTextColor, width: 1 } },
      splitLine: { distance: -26, length: 8, lineStyle: { color: chartTextColor, width: 2 } },
      axisLabel: { color: chartTextColor, fontSize: 10, distance: -34 },
      anchor: { show: false },
      title: {
        offsetCenter: [0, '88%'],
        color: chartTextColor,
        fontSize: 11,
        fontWeight: 500,
      },
      detail: {
        valueAnimation: true,
        formatter: `{value}${props.unit ? ' ' + props.unit : ''}`,
        color: chartColors[0],
        fontSize: 28,
        fontWeight: 700,
        offsetCenter: [0, '40%'],
      },
      data: [{ value: props.value, name: props.label ?? '' }],
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
