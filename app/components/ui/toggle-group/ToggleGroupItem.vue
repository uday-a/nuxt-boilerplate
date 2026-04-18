<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { ToggleGroupItem, useForwardProps } from 'reka-ui'
import { inject } from 'vue'
import { cn } from '@/lib/utils'
import { toggleVariants } from '@/components/ui/toggle'

type ToggleGroupContext = {
  variant?: 'default' | 'outline'
  size?: 'default' | 'sm' | 'lg'
  spacing?: number
}

// Inlined unions: SFC compiler can't extract runtime props from
// indexed-access types. Same for reka-ui's ToggleGroupItemProps.
const props = defineProps<{
  class?: HTMLAttributes['class']
  variant?: 'default' | 'outline'
  size?: 'default' | 'sm' | 'lg'
  asChild?: boolean
  as?: string | object
  value: string
  disabled?: boolean
}>()

const context = inject<ToggleGroupContext>('toggleGroup')

const delegatedProps = reactiveOmit(props, 'class', 'size', 'variant')
const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <ToggleGroupItem
    v-slot="slotProps"
    data-uipkge
    data-slot="toggle-group-item"
    :data-variant="context?.variant || variant"
    :data-size="context?.size || size"
    :data-spacing="context?.spacing"
    v-bind="forwardedProps"
    :class="
      cn(
        toggleVariants({
          variant: context?.variant || variant,
          size: context?.size || size,
        }),
        'w-auto min-w-0 shrink-0 px-3 focus:z-10 focus-visible:z-10',
        'data-[spacing=0]:rounded-none data-[spacing=0]:shadow-none data-[spacing=0]:first:rounded-l-md data-[spacing=0]:last:rounded-r-md data-[spacing=0]:data-[variant=outline]:border-l-0 data-[spacing=0]:data-[variant=outline]:first:border-l',
        props.class
      )
    "
  >
    <slot v-bind="slotProps" />
  </ToggleGroupItem>
</template>
