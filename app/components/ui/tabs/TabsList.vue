<script setup lang="ts">
import { computed, inject } from 'vue'
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { TabsList, useForwardProps } from 'reka-ui'
import { cn } from '@/lib/utils'
import { tabsListVariants } from './tabs.variants'

// Inlined unions: SFC compiler can't extract runtime props from
// indexed-access types or reka-ui's TabsListProps.
const props = defineProps<{
  class?: HTMLAttributes['class']
  variant?: 'segmented' | 'pill' | 'underline'
  orientation?: 'horizontal' | 'vertical'
  asChild?: boolean
  as?: string | object
  loop?: boolean
}>()

const delegatedProps = reactiveOmit(props, 'class', 'variant', 'orientation')
const forwarded = useForwardProps(delegatedProps)

// Inherit orientation from <Tabs> when not set explicitly. Provided as a
// computed ref by Tabs.vue so updates propagate.
const tabsOrientation = inject<{ value: 'horizontal' | 'vertical' } | 'horizontal' | 'vertical'>(
  Symbol.for('tabsOrientation'),
  'horizontal'
)
const effectiveOrientation = computed(() => {
  if (props.orientation) return props.orientation
  return typeof tabsOrientation === 'string' ? tabsOrientation : tabsOrientation.value
})
</script>

<template>
  <TabsList
    data-uipkge
    data-slot="tabs-list"
    v-bind="forwarded"
    :class="
      cn(
        tabsListVariants({ variant, orientation: effectiveOrientation }),
        props.class
      )
    "
  >
    <slot />
  </TabsList>
</template>
