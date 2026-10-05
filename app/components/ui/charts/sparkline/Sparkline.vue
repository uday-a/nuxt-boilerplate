<script setup lang="ts">
import { computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart as EChartsBarChart, LineChart as EChartsLineChart } from 'echarts/charts'
import VChart from 'vue-echarts'
import { cn } from '@/lib/utils'
import { chartColors } from '../useChartTheme'

use([CanvasRenderer, EChartsBarChart, EChartsLineChart])

type SparklineVariant = 'area' | 'bars' | 'line' | 'dots'

interface Props {
  data: number[]
  color?: string
  height?: number | string
  /** Mini form per KPI so every card reads distinct: area fill, bars,
   *  plain line, or line with sample dots. */
  variant?: SparklineVariant
  option?: any
  /** Screen-reader name for the canvas. Sets role="img" + aria-label on the wrapper. */
  label?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  height: 40,
  variant: 'area',
  color: chartColors.value[1],
})

const mergedOption = computed(() => {
  const line = {
    type: 'line',
    smooth: true,
    symbol: props.variant === 'dots' ? 'circle' : 'none',
    symbolSize: props.variant === 'dots' ? 5 : 0,
    showSymbol: props.variant === 'dots',
    lineStyle: { width: 2, color: props.color },
    itemStyle: { color: props.color },
    // WHY (Rule51): flat area fill at low opacity -- no linear-gradient
    // wash. Gradients read as decoration, not data.
    areaStyle: props.variant === 'line' || props.variant === 'dots' ? undefined : { opacity: 0.12, color: props.color },
    data: props.data,
  }
  const bars = {
    type: 'bar',
    barWidth: '60%',
    itemStyle: { color: props.color, borderRadius: [2, 2, 0, 0] },
    data: props.data,
  }
  return {
    grid: { left: 0, right: 0, top: 2, bottom: 2 },
    xAxis: { type: 'category', show: false, data: props.data.map((_, i) => i) },
    // WHY (Rule45): zero-based so a small trend can't read as a cliff.
    // Sparklines show shape; the zero base keeps them honest.
    yAxis: { type: 'value', show: false, min: 0 },
    tooltip: { show: false },
    series: [props.variant === 'bars' ? bars : line],
    ...props.option,
  }
})
</script>

<template>
  <div
    :style="{ height: /^\d+$/.test(String(height)) ? `${height}px` : String(height) }"
    :class="cn('w-full', props.class)"
    :role="props.label ? 'img' : undefined"
    :aria-label="props.label"
  >
    <VChart
      :option="mergedOption"
      :autoresize="true"
      class="size-full"
    />
  </div>
</template>
