<script setup lang="ts">
import type { PopoverContentEmits, PopoverContentProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { PopoverContent, PopoverPortal, useForwardPropsEmits } from 'reka-ui'
import { inject } from 'vue'
import { cn } from '@/lib/utils'
import { POPOVER_INJECTION_KEY } from './context'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(defineProps<PopoverContentProps & { class?: HTMLAttributes['class'] }>(), {
  align: 'center',
  sideOffset: 4,
})
const emits = defineEmits<PopoverContentEmits>()

const ctx = inject(POPOVER_INJECTION_KEY, null)

const delegatedProps = reactiveOmit(props, 'class')

const forwarded = useForwardPropsEmits(delegatedProps, emits)

function onPointerDownOutside(e: Event) {
  const mode = ctx?.closeBehavior.value ?? 'auto'
  if (mode === 'esc' || mode === 'manual' || mode === 'none') {
    e.preventDefault()
  }
}

function onEscapeKeyDown(e: KeyboardEvent) {
  const mode = ctx?.closeBehavior.value ?? 'auto'
  if (mode === 'click-outside' || mode === 'manual' || mode === 'none') {
    e.preventDefault()
  }
}
</script>

<template>
  <PopoverPortal>
    <PopoverContent
      data-uipkge
      data-slot="popover-content"
      v-bind="{ ...$attrs, ...forwarded }"
      :class="
        cn(
          'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--reka-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden',
          props.class
        )
      "
      @pointer-down-outside="onPointerDownOutside"
      @escape-key-down="onEscapeKeyDown"
    >
      <slot />
    </PopoverContent>
  </PopoverPortal>
</template>
