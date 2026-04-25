<script setup lang="ts">
import { computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { FunnelChart as EChartsFunnelChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { cn } from '@/lib/utils'
import { chartColors, chartTextColor, chartTooltipBg, chartTooltipBorder, chartTooltipText } from '../useChartTheme'

use([CanvasRenderer, EChartsFunnelChart, TooltipComponent, LegendComponent])

interface Props {
  data: { name: string; value: number }[]
  height?: number | string
  showLabels?: boolean
  showLegend?: boolean
  /** ECharts option escape hatch -- merged on top of the computed option. */
  option?: any
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  height: 300,
  showLabels: true,
  showLegend: false,
})

const mergedOption = computed(() => ({
  color: chartColors,
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)',
    backgroundColor: chartTooltipBg,
    borderColor: chartTooltipBorder,
    textStyle: { color: chartTooltipText, fontSize: 12 },
  },
  legend: props.showLegend
    ? { bottom: 0, icon: 'circle', itemWidth: 8, itemHeight: 8, textStyle: { fontSize: 11, color: chartTextColor } }
    : undefined,
  series: [
    {
      type: 'funnel',
      left: '8%',
      right: '8%',
      top: 12,
      bottom: props.showLegend ? 32 : 12,
      sort: 'descending',
      gap: 2,
      label: {
        show: props.showLabels,
        position: 'inside',
        color: '#fff',
        fontSize: 11,
        fontWeight: 600,
      },
      labelLine: { length: 8, lineStyle: { width: 1, type: 'solid' } },
      itemStyle: { borderColor: '#fff', borderWidth: 1 },
      emphasis: { label: { fontSize: 13, fontWeight: 700 } },
      data: props.data,
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
