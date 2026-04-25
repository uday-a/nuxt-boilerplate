<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { TabsContent, type TabsContentProps } from 'reka-ui'
import { cn } from '@/lib/utils'

interface Props {
  class?: HTMLAttributes['class']
  value: string
  forceMount?: boolean
}

const props = defineProps<Props>()
</script>

<template>
  <TabsContent
    v-slot="slotProps"
    :value="props.value"
    :force-mount="props.forceMount"
    :class="
      cn(
        'flex-1 ring-offset-background focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-2 focus-visible:ring-[3px] focus-visible:outline-none',
        props.class
      )
    "
    data-uipkge data-slot="tabs-content"
  >
    <slot v-bind="slotProps" />
  </TabsContent>
</template>
