<script setup lang="ts">
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const props = defineProps<{
  title: string
  description?: string
  class?: string
  contentClass?: string
}>()
</script>

<template>
  <Card :class="cn('flex flex-col', props.class)">
    <CardHeader class="pb-4">
      <div class="flex items-center justify-between">
        <div>
          <CardTitle class="text-base font-semibold">{{ title }}</CardTitle>
          <CardDescription v-if="description" class="mt-0.5">{{ description }}</CardDescription>
        </div>
        <slot name="header-action" />
      </div>
    </CardHeader>
    <CardContent :class="cn('flex-1', props.contentClass)">
      <slot />
    </CardContent>
    <slot name="footer" />
  </Card>
</template>
