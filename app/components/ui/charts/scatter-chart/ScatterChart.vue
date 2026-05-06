<script setup lang="ts">
import { computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { ScatterChart as EChartsScatterChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { cn } from '@/lib/utils'
import { chartColors, chartTextColor, chartAxisColor, chartSplitLineColor, chartTooltipBg, chartTooltipBorder, chartTooltipText } from '../useChartTheme'

use([CanvasRenderer, EChartsScatterChart, GridComponent, TooltipComponent, LegendComponent])

interface Props {
  data: Record<string, any>[]
  xField?: string
  yField?: string
  sizeField?: string
  categoryField?: string
  height?: number | string
  option?: any
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  xField: 'x',
  yField: 'y',
  height: 300,
})

const mergedOption = computed(() => {
  const categories = props.categoryField
    ? [...new Set(props.data.map(d => d[props.categoryField!]))]
    : ['default']

  const series = categories.map((cat, i) => ({
    name: cat,
    type: 'scatter',
    symbolSize: (val: any[]) => (props.sizeField ? Math.sqrt(val[2]) * 3 + 4 : 10),
    itemStyle: { color: chartColors.value[i % chartColors.value.length] },
    data: props.categoryField
      ? props.data
          .filter(d => d[props.categoryField!] === cat)
          .map(d => [d[props.xField!], d[props.yField!], props.sizeField ? d[props.sizeField] : 0])
      : props.data.map(d => [d[props.xField!], d[props.yField!], props.sizeField ? d[props.sizeField] : 0]),
  }))

  return {
    color: chartColors.value,
    grid: { left: 16, right: 16, top: 24, bottom: categories.length > 1 ? 32 : 24, containLabel: true },
    tooltip: {
      trigger: 'item',
      backgroundColor: chartTooltipBg.value,
      borderColor: chartTooltipBorder.value,
      textStyle: { color: chartTooltipText.value, fontSize: 12 },
      formatter: (params: any) => `${params.seriesName}<br/>${props.xField}: ${params.value[0]}<br/>${props.yField}: ${params.value[1]}`,
    },
    legend: categories.length > 1 ? { bottom: 0, icon: 'circle', itemWidth: 8, itemHeight: 8, textStyle: { fontSize: 11, color: chartTextColor.value } } : undefined,
    xAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: chartSplitLineColor.value } },
      axisLabel: { color: chartTextColor.value, fontSize: 11 },
      axisLine: { lineStyle: { color: chartAxisColor.value } },
      axisTick: { show: false },
      scale: true,
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: chartSplitLineColor.value } },
      axisLabel: { color: chartTextColor.value, fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false },
      scale: true,
    },
    series,
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
