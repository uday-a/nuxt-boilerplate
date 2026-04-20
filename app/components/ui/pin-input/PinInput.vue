<script setup lang="ts" generic="Type extends 'text' | 'number' = 'text'">
import { computed, provide, toRef } from 'vue'
import type { PinInputRootEmits, PinInputRootProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { PinInputRoot, useForwardPropsEmits } from 'reka-ui'
import { cn } from '@/lib/utils'

type PinInputStatus = 'error' | 'warning' | 'success' | 'default'
type PinInputSize = 'sm' | 'md' | 'lg'

const props = withDefaults(
  defineProps<
    PinInputRootProps<Type> & {
      class?: HTMLAttributes['class']
      mask?: boolean
      autoSubmit?: boolean
      status?: PinInputStatus
      size?: PinInputSize
    }
  >(),
  {
    otp: true,
    mask: false,
    autoSubmit: false,
    status: 'default',
    size: 'md',
  }
)

const emits = defineEmits<
  Omit<PinInputRootEmits<Type>, 'complete'> & {
    complete: [value: string]
  }
>()

const delegatedProps = reactiveOmit(props, 'class', 'mask', 'autoSubmit', 'status', 'size')
const forwarded = useForwardPropsEmits(delegatedProps, emits)

provide('pinInputContext', {
  mask: toRef(props, 'mask'),
  status: toRef(props, 'status'),
  size: toRef(props, 'size'),
})

function handleComplete(value: string[]) {
  const joined = value.join('')
  emits('complete', joined)
  if (props.autoSubmit) {
    const event = new CustomEvent('pin-submit', { detail: joined, bubbles: true })
    document.dispatchEvent(event)
  }
}
</script>

<template>
  <PinInputRoot
    :otp="props.otp"
    data-uipkge
    data-slot="pin-input"
    v-bind="forwarded"
    :class="cn('flex items-center gap-2 disabled:cursor-not-allowed has-disabled:opacity-50', props.class)"
    @complete="handleComplete"
  >
    <slot />
  </PinInputRoot>
</template>
