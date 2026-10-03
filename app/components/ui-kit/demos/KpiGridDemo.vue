<script setup lang="ts">
import { KpiGrid } from '@/components/ui/kpi-grid'
import StatTile from '@/components/blocks/StatTile.vue'

const tiles = [
  { label: 'Total revenue', value: '$84,230', delta: '+12.5%' },
  { label: 'Active users', value: '2,420', delta: '+8.2%' },
  { label: 'Conversion rate', value: '3.24%', delta: '-0.4%', deltaTone: 'negative' as const },
  { label: 'Avg. order value', value: '$64.50', delta: '+2.1%' },
]
</script>

<template>
  <KpiGrid :columns="2">
    <StatTile
      v-for="tile in tiles"
      :key="tile.label"
      v-bind="tile"
    />
  </KpiGrid>
</template>
