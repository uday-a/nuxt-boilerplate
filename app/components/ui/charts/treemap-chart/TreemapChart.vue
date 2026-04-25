<script setup lang="ts">
import { computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { TreemapChart as EChartsTreemapChart } from 'echarts/charts'
import { TooltipComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { cn } from '@/lib/utils'
import { chartColors, chartTooltipBg, chartTooltipBorder, chartTooltipText } from '../useChartTheme'

interface TreeNode {
  name: string
  value?: number
  children?: TreeNode[]
}

interface Props {
  data: TreeNode[]
  height?: number | string
  /** Show breadcrumb at top when drilling into a sub-tree. Default false. */
  showBreadcrumb?: boolean
  option?: any
  class?: string
}

use([CanvasRenderer, EChartsTreemapChart, TooltipComponent])

const props = withDefaults(defineProps<Props>(), {
  height: 320,
  showBreadcrumb: false,
})

const mergedOption = computed(() => ({
  color: chartColors,
  tooltip: {
    formatter: (info: any) => {
      const parts = info.treePathInfo.map((n: any) => n.name).filter(Boolean)
      return `<strong>${parts.join(' / ')}</strong><br>${info.value?.toLocaleString?.() ?? info.value}`
    },
    backgroundColor: chartTooltipBg,
    borderColor: chartTooltipBorder,
    textStyle: { color: chartTooltipText, fontSize: 12 },
  },
  series: [
    {
      type: 'treemap',
      width: '100%',
      height: '100%',
      roam: false,
      nodeClick: false,
      breadcrumb: { show: props.showBreadcrumb },
      label: {
        show: true,
        formatter: '{b}',
        fontSize: 11,
        fontWeight: 600,
        color: '#fff',
      },
      upperLabel: { show: true, height: 22, fontSize: 11, color: '#fff' },
      itemStyle: { borderColor: '#fff', borderWidth: 2, gapWidth: 2 },
      levels: [
        {
          itemStyle: { borderColor: '#fff', borderWidth: 3, gapWidth: 3 },
          upperLabel: { show: false },
        },
        {
          itemStyle: { borderColor: '#fff', borderWidth: 2, gapWidth: 2 },
          colorSaturation: [0.4, 0.7],
        },
        {
          itemStyle: { borderColor: '#fff', borderWidth: 1, gapWidth: 1 },
          colorSaturation: [0.3, 0.55],
        },
      ],
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
