<script setup lang="ts">
import { computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart as EChartsBarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { cn } from '@/lib/utils'
import { chartColors, chartTextColor, chartAxisColor, chartSplitLineColor, chartTooltipBg, chartTooltipBorder, chartTooltipText } from '../useChartTheme'

use([CanvasRenderer, EChartsBarChart, GridComponent, TooltipComponent, LegendComponent])

interface Props {
  data: Record<string, any>[]
  xField?: string
  yField?: string | string[]
  height?: number | string
  /** Unit appended to tooltip values (Rule56), e.g. 'requests'. */
  unit?: string
  option?: any
  /** Screen-reader name for the canvas. Sets role="img" + aria-label on the wrapper. */
  label?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  xField: 'x',
  yField: 'y',
  height: 300,
  unit: '',
})

const mergedOption = computed(() => {
  const fields = Array.isArray(props.yField) ? props.yField : [props.yField]
  const xData = props.data.map(d => d[props.xField!])

  const series = fields.map((field, i) => ({
    name: fields.length > 1 ? field : '',
    type: 'bar',
    barMaxWidth: 32,
    itemStyle: { color: chartColors.value[i % chartColors.value.length], borderRadius: [4, 4, 0, 0] },
    data: props.data.map(d => d[field]),
  }))

  const base: any = {
    color: chartColors.value,
    grid: { left: 16, right: 16, top: 24, bottom: fields.length > 1 ? 32 : 24, containLabel: true },
    tooltip: {
      trigger: 'axis',
      backgroundColor: chartTooltipBg.value,
      borderColor: chartTooltipBorder.value,
      textStyle: { color: chartTooltipText.value, fontSize: 12 },
      // WHY (Rule56): series with known units format through here so the
      // default tooltip never shows a bare number.
      valueFormatter: (v: number) => `${Number(v).toLocaleString()}${props.unit ? ` ${props.unit}` : ''}`,
    },
    legend: fields.length > 1 ? { bottom: 0, icon: 'circle', itemWidth: 8, itemHeight: 8, textStyle: { fontSize: 12, color: chartTextColor.value } } : undefined,
    xAxis: {
      type: 'category',
      data: xData,
      axisLine: { lineStyle: { color: chartAxisColor.value } },
      axisLabel: { color: chartTextColor.value, fontSize: 12 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      // WHY (Rule45): bars encode value as length from zero -- a truncated
      // baseline turns small deltas into cliffs. Always zero-based.
      min: 0,
      splitLine: { lineStyle: { color: chartSplitLineColor.value } },
      axisLabel: { color: chartTextColor.value, fontSize: 12 },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series,
  }
  // Axis overrides merge one level deep so an `xAxis`/`yAxis` in `option`
  // (e.g. hiding labels on a mini chart) can't wipe the category data.
  const o = props.option ?? {}
  const axis = (b: any, x: any) => (x === undefined ? b : Array.isArray(x) ? x : { ...b, ...x })
  return { ...base, ...o, xAxis: axis(base.xAxis, o.xAxis), yAxis: axis(base.yAxis, o.yAxis) }
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
