<script setup lang="ts">
import { computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { HeatmapChart as EChartsHeatmap } from 'echarts/charts'
import { GridComponent, TooltipComponent, VisualMapComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { cn } from '@/lib/utils'
import { chartTooltipBg, chartTooltipBorder, chartTooltipText } from '../useChartTheme'

use([CanvasRenderer, EChartsHeatmap, GridComponent, TooltipComponent, VisualMapComponent])

interface Props {
  data: [number, number, number][] // [xIndex, yIndex, value]
  xLabels: string[]
  yLabels: string[]
  height?: number | string
  min?: number
  max?: number
  option?: any
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  height: 300,
})

const mergedOption = computed(() => {
  const values = props.data.map((d) => d[2])
  const computedMin = props.min ?? Math.min(...values)
  const computedMax = props.max ?? Math.max(...values)

  return {
    grid: { left: 16, right: 16, top: 16, bottom: 16, containLabel: true },
    tooltip: {
      position: 'top',
      backgroundColor: chartTooltipBg,
      borderColor: chartTooltipBorder,
      textStyle: { color: chartTooltipText, fontSize: 12 },
      formatter: (params: any) => `${props.yLabels[params.value[1]]} / ${props.xLabels[params.value[0]]}: ${params.value[2]}`,
    },
    xAxis: {
      type: 'category',
      data: props.xLabels,
      splitArea: { show: true },
      axisLabel: { fontSize: 11 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'category',
      data: props.yLabels,
      splitArea: { show: true },
      axisLabel: { fontSize: 11 },
      axisTick: { show: false },
    },
    visualMap: {
      min: computedMin,
      max: computedMax,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      itemWidth: 12,
      itemHeight: 80,
      inRange: {
        color: ['#e0f2fe', '#3b82f6', '#1e3a8a'],
      },
      textStyle: { fontSize: 10 },
    },
    series: [
      {
        type: 'heatmap',
        data: props.data,
        label: { show: false },
        itemStyle: { borderRadius: 3, borderColor: '#fff', borderWidth: 1 },
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.2)' },
        },
      },
    ],
    ...props.option,
  }
})
</script>

<template>
  <div
    :style="{ height: /^\d+$/.test(String(height)) ? `${height}px` : String(height) }"
    :class="cn('w-full', props.class)"
  >
    <VChart :option="mergedOption" :autoresize="true" class="size-full" />
  </div>
</template>
