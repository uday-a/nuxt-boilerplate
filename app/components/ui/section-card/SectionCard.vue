<script setup lang="ts">
import { cn } from '@/lib/utils'
import { Card, CardAction, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const props = defineProps<{
  title: string
  description?: string
  class?: string
  contentClass?: string
}>()
</script>

<template>
  <Card :class="cn('flex flex-col', props.class)">
    <CardHeader>
      <CardTitle class="text-base font-semibold">
        {{ title }}
      </CardTitle>
      <CardDescription v-if="description">
        {{ description }}
      </CardDescription>
      <CardAction v-if="$slots['header-action']">
        <slot name="header-action" />
      </CardAction>
    </CardHeader>
    <CardContent :class="cn('flex-1', props.contentClass)">
      <slot />
    </CardContent>
    <slot name="footer" />
  </Card>
</template>
