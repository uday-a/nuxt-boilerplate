<script setup lang="ts">
import { computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { TreemapChart as EChartsTreemapChart } from 'echarts/charts'
import { TooltipComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { cn } from '@/lib/utils'
import { chartColors, chartSurfaceColor, chartTooltipBg, chartTooltipBorder, chartTooltipText } from '../useChartTheme'

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
  /** Screen-reader name for the canvas. Sets role="img" + aria-label on the wrapper. */
  label?: string
  class?: string
}

use([CanvasRenderer, EChartsTreemapChart, TooltipComponent])

const props = withDefaults(defineProps<Props>(), {
  height: 320,
  showBreadcrumb: false,
})

const mergedOption = computed(() => ({
  color: chartColors.value,
  tooltip: {
    formatter: (info: any) => {
      const parts = info.treePathInfo.map((n: any) => n.name).filter(Boolean)
      return `<span class="font-semibold">${parts.join(' / ')}</span><br>${info.value?.toLocaleString?.() ?? info.value}`
    },
    backgroundColor: chartTooltipBg.value,
    borderColor: chartTooltipBorder.value,
    textStyle: { color: chartTooltipText.value, fontSize: 12 },
  },
  series: [
    {
      type: 'treemap',
      // Explicit left/top/right/bottom anchor the layout at 0,0 of the
      // container. Without these, ECharts centres the treemap and the
      // (invisible) breadcrumb still reserves ~22px at the top -- shows
      // up as a phantom gap above the first rect.
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      width: 'auto',
      height: 'auto',
      roam: false,
      nodeClick: false,
      breadcrumb: { show: props.showBreadcrumb, height: 0 },
      label: {
        show: true,
        formatter: ({ name, value }: any) => (value ? `{b|${name}}\n{v|${value}}` : name),
        rich: {
          b: { color: chartSurfaceColor.value, fontSize: 12, fontWeight: 600, lineHeight: 16 },
          v: { color: chartSurfaceColor.value, fontSize: 12, fontWeight: 400, lineHeight: 16 },
        },
        overflow: 'truncate',
        ellipsis: '…',
      },
      labelLayout: { hideOverlap: false },
      upperLabel: { show: false },
      itemStyle: { borderColor: chartSurfaceColor.value, borderWidth: 2, gapWidth: 2 },
      // The earlier `levels` config carried `colorSaturation` per depth
      // for nested trees, but it also implicitly cleared the series
      // `label` config at each level -- which meant flat data (the
      // common case) rendered as untitled coloured rectangles. Apply
      // saturation directly on the series so a single level config
      // doesn't blow away the labels.
      colorSaturation: [0.45, 0.7],
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
