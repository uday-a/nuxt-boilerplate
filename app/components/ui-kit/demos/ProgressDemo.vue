<script setup lang="ts">
import { Progress } from '@/components/ui/progress'

const rows = [
  { label: 'Uploading', value: 78 },
  { label: 'Processing', value: 42 },
  { label: 'Complete', value: 100 },
]
</script>

<template>
  <div class="space-y-4">
    <div
      v-for="row in rows"
      :key="row.label"
      class="space-y-1"
    >
      <div class="flex justify-between text-xs">
        <span>{{ row.label }}</span><span class="tabular-nums">{{ row.value }}%</span>
      </div>
      <Progress
        :model-value="row.value"
        :aria-label="row.label"
      />
    </div>
  </div>
</template>
