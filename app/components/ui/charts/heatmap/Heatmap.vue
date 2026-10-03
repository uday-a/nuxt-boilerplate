<script setup lang="ts">
import { computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { HeatmapChart as EChartsHeatmap } from 'echarts/charts'
import { GridComponent, TooltipComponent, VisualMapComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { cn } from '@/lib/utils'
import { chartColors, chartSurfaceColor, chartTextColor, chartTooltipBg, chartTooltipBorder, chartTooltipText } from '../useChartTheme'

use([CanvasRenderer, EChartsHeatmap, GridComponent, TooltipComponent, VisualMapComponent])

interface Props {
  data: [number, number, number][] // [xIndex, yIndex, value]
  xLabels: string[]
  yLabels: string[]
  height?: number | string
  min?: number
  max?: number
  /** Unit appended to tooltip values (Rule56), e.g. 'sessions'. */
  unit?: string
  option?: any
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  height: 300,
  unit: '',
})

const mergedOption = computed(() => {
  const values = props.data.map(d => d[2])
  const computedMin = props.min ?? Math.min(...values)
  const computedMax = props.max ?? Math.max(...values)

  return {
    grid: { left: 16, right: 16, top: 16, bottom: 16, containLabel: true },
    tooltip: {
      position: 'top',
      backgroundColor: chartTooltipBg.value,
      borderColor: chartTooltipBorder.value,
      textStyle: { color: chartTooltipText.value, fontSize: 12 },
      // WHY (Rule56): values without units read as bare numbers. The unit
      // rides in the formatter so the default tooltip always carries it.
      formatter: (params: any) => `${props.yLabels[params.value[1]]} / ${props.xLabels[params.value[0]]}: ${params.value[2]}${props.unit ? ` ${props.unit}` : ''}`,
    },
    xAxis: {
      type: 'category',
      data: props.xLabels,
      splitArea: { show: true },
      axisLabel: { fontSize: 12 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'category',
      data: props.yLabels,
      splitArea: { show: true },
      axisLabel: { fontSize: 12 },
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
        color: [`${chartColors.value[0]}1a`, `${chartColors.value[0]}80`, chartColors.value[0]],
      },
      textStyle: { fontSize: 12, color: chartTextColor.value },
    },
    series: [
      {
        type: 'heatmap',
        data: props.data,
        label: { show: false },
        itemStyle: { borderRadius: 3, borderColor: chartSurfaceColor.value, borderWidth: 1 },
        // WHY (Rule51): flat highlight instead of a drop-shadow hover --
        // shadows lift the cell off the surface; a border reads as selection.
        emphasis: {
          itemStyle: { borderColor: chartTextColor.value, borderWidth: 2 },
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
    <VChart
      :option="mergedOption"
      :autoresize="true"
      class="size-full"
    />
  </div>
</template>
