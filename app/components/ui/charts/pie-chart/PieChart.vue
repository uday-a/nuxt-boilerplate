<script setup lang="ts">
import { computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart as EChartsPieChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { cn } from '@/lib/utils'
import { chartColors, chartTooltipBg, chartTooltipBorder, chartTooltipText } from '../useChartTheme'

use([CanvasRenderer, EChartsPieChart, TooltipComponent, LegendComponent])

interface Props {
  data: Record<string, any>[]
  nameField?: string
  valueField?: string
  height?: number | string
  donut?: boolean
  option?: any
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  nameField: 'name',
  valueField: 'value',
  height: 300,
  donut: false,
})

const mergedOption = computed(() => {
  const chartData = props.data.map((d) => ({
    name: d[props.nameField!],
    value: d[props.valueField!],
  }))

  return {
    color: chartColors.value,
    tooltip: {
      trigger: 'item',
      backgroundColor: chartTooltipBg.value,
      borderColor: chartTooltipBorder.value,
      textStyle: { color: chartTooltipText.value, fontSize: 12 },
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      bottom: 0,
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8,
      textStyle: { fontSize: 11 },
    },
    series: [
      {
        type: 'pie',
        radius: props.donut ? ['45%', '70%'] : '65%',
        center: ['50%', '45%'],
        itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        data: chartData,
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
