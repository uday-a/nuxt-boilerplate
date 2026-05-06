<script setup lang="ts">
import { computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { RadarChart as EChartsRadarChart } from 'echarts/charts'
import { RadarComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { cn } from '@/lib/utils'
import { chartColors, chartTooltipBg, chartTooltipBorder, chartTooltipText } from '../useChartTheme'

use([CanvasRenderer, EChartsRadarChart, RadarComponent, TooltipComponent, LegendComponent])

interface Props {
  indicators: { name: string, max: number }[]
  data: { name: string, value: number[] }[]
  height?: number | string
  option?: any
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  height: 300,
})

const mergedOption = computed(() => {
  return {
    color: chartColors.value,
    tooltip: {
      trigger: 'item',
      backgroundColor: chartTooltipBg.value,
      borderColor: chartTooltipBorder.value,
      textStyle: { color: chartTooltipText.value, fontSize: 12 },
    },
    legend: {
      bottom: 0,
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8,
      textStyle: { fontSize: 11 },
    },
    radar: {
      indicator: props.indicators,
      radius: '60%',
      center: ['50%', '45%'],
      axisName: { fontSize: 11 },
      splitArea: { areaStyle: { color: ['rgba(250,250,250,0.3)', 'rgba(200,200,200,0.05)'] } },
    },
    series: [
      {
        type: 'radar',
        data: props.data.map((d, i) => ({
          ...d,
          itemStyle: { color: chartColors.value[i % chartColors.value.length] },
          areaStyle: { opacity: 0.15 },
          lineStyle: { width: 2 },
        })),
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
    <VChart
      :option="mergedOption"
      :autoresize="true"
      class="size-full"
    />
  </div>
</template>
