<script setup lang="ts">
import type { ToggleGroupRootEmits } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { ToggleGroupRoot, useForwardPropsEmits } from 'reka-ui'
import { provide } from 'vue'
import { cn } from '@/lib/utils'

// Inlined unions: SFC compiler can't extract runtime props from
// `VariantProps<typeof toggleVariants>['...']`. Same for the
// reka-ui `ToggleGroupRootProps` (no exports.types). Inline the
// surface we expose.
const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes['class']
    variant?: 'default' | 'outline'
    size?: 'default' | 'sm' | 'lg'
    spacing?: number
    asChild?: boolean
    as?: string | object
    type?: 'single' | 'multiple'
    modelValue?: string | string[]
    defaultValue?: string | string[]
    disabled?: boolean
    loop?: boolean
    orientation?: 'horizontal' | 'vertical'
    rovingFocus?: boolean
    dir?: 'ltr' | 'rtl'
  }>(),
  {
    spacing: 0,
  }
)

const emits = defineEmits<ToggleGroupRootEmits>()

provide('toggleGroup', {
  variant: props.variant,
  size: props.size,
  spacing: props.spacing,
})

const delegatedProps = reactiveOmit(props, 'class', 'size', 'variant')
const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <ToggleGroupRoot
    v-slot="slotProps"
    data-uipkge
    data-slot="toggle-group"
    :data-size="size"
    :data-variant="variant"
    :data-spacing="spacing"
    :style="{
      '--gap': spacing,
    }"
    v-bind="forwarded"
    :class="
      cn(
        'group/toggle-group flex w-fit items-center gap-[--spacing(var(--gap))] rounded-md data-[spacing=default]:data-[variant=outline]:shadow-xs',
        props.class
      )
    "
  >
    <slot v-bind="slotProps" />
  </ToggleGroupRoot>
</template>
