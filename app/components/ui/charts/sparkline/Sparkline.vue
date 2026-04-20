<script setup lang="ts">
import { computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart as EChartsLineChart } from 'echarts/charts'
import VChart from 'vue-echarts'
import { cn } from '@/lib/utils'
import { chartColors } from '../useChartTheme'

use([CanvasRenderer, EChartsLineChart])

interface Props {
  data: number[]
  color?: string
  height?: number | string
  option?: any
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  height: 40,
  color: chartColors[1],
})

const mergedOption = computed(() => {
  return {
    grid: { left: 0, right: 0, top: 2, bottom: 2 },
    xAxis: { type: 'category', show: false, data: props.data.map((_, i) => i) },
    yAxis: { type: 'value', show: false, min: (value: any) => value.min * 0.9 },
    tooltip: { show: false },
    series: [
      {
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: props.color },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: props.color + '40' },
              { offset: 1, color: props.color + '00' },
            ],
          },
        },
        data: props.data,
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
