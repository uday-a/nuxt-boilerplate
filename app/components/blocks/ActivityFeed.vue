<script setup lang="ts">
import type { Component } from 'vue'
import { SectionCard } from '@/components/ui/section-card'
import { DataList, DataListItem } from '@/components/ui/data-list'
import { IconBox } from '@/components/ui/icon-box'

interface ActivityItem {
  id: string | number
  action: string
  detail?: string
  time: string
  icon?: Component
  iconClass?: string
}

defineProps<{
  title?: string
  description?: string
  items: ActivityItem[]
  class?: string
}>()
</script>

<template>
  <SectionCard :title="title ?? 'Recent Activity'" :description="description" :class="$props.class">
    <DataList>
      <DataListItem v-for="item in items" :key="item.id">
        <div class="flex items-center gap-3">
          <IconBox v-if="item.icon" :icon="item.icon" variant="muted" :icon-class="item.iconClass" />
          <div>
            <p class="text-sm font-medium">{{ item.action }}</p>
            <p v-if="item.detail" class="text-muted-foreground text-xs">{{ item.detail }}</p>
          </div>
        </div>
        <span class="text-muted-foreground ml-4 text-xs whitespace-nowrap">{{ item.time }}</span>
      </DataListItem>
    </DataList>
  </SectionCard>
</template>
