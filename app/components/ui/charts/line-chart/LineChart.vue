<script setup lang="ts">
import { computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart as EChartsLineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { cn } from '@/lib/utils'
import { chartColors, chartTextColor, chartAxisColor, chartSplitLineColor, chartTooltipBg, chartTooltipBorder, chartTooltipText } from '../useChartTheme'

use([CanvasRenderer, EChartsLineChart, GridComponent, TooltipComponent, LegendComponent])

interface Props {
  data: Record<string, any>[]
  xField?: string
  yField?: string | string[]
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
  const fields = Array.isArray(props.yField) ? props.yField : [props.yField]
  const xData = props.data.map((d) => d[props.xField!])

  const series = fields.map((field, i) => ({
    name: field,
    type: 'line',
    smooth: true,
    symbol: 'circle',
    symbolSize: 6,
    lineStyle: { width: 2 },
    itemStyle: { color: chartColors.value[i % chartColors.value.length] },
    data: props.data.map((d) => d[field]),
  }))

  return {
    color: chartColors.value,
    grid: { left: 16, right: 16, top: 24, bottom: fields.length > 1 ? 32 : 24, containLabel: true },
    tooltip: {
      trigger: 'axis',
      backgroundColor: chartTooltipBg.value,
      borderColor: chartTooltipBorder.value,
      textStyle: { color: chartTooltipText.value, fontSize: 12 },
    },
    legend: fields.length > 1 ? { bottom: 0, icon: 'circle', itemWidth: 8, itemHeight: 8, textStyle: { fontSize: 11, color: chartTextColor.value } } : undefined,
    xAxis: {
      type: 'category',
      data: xData,
      axisLine: { lineStyle: { color: chartAxisColor.value } },
      axisLabel: { color: chartTextColor.value, fontSize: 11 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: chartSplitLineColor.value } },
      axisLabel: { color: chartTextColor.value, fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false },
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
    <VChart :option="mergedOption" :autoresize="true" class="size-full" />
  </div>
</template>
