<script setup lang="ts">
import { computed, inject } from 'vue'
import type { PinInputInputProps } from 'reka-ui'
import type { HTMLAttributes, Ref } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { PinInputInput, useForwardProps } from 'reka-ui'
import { cn } from '@/lib/utils'

type PinInputStatus = 'error' | 'warning' | 'success' | 'default'
type PinInputSize = 'sm' | 'md' | 'lg'

interface PinInputContext {
  mask: Ref<boolean>
  status: Ref<PinInputStatus>
  size: Ref<PinInputSize>
}

const props = defineProps<
  PinInputInputProps & {
    class?: HTMLAttributes['class']
    /** Override the inherited mask flag for this slot. */
    mask?: boolean
  }
>()

const ctx = inject<PinInputContext | null>('pinInputContext', null)
const forwarded = useForwardProps(reactiveOmit(props, 'class', 'mask'))

const effectiveMask = computed(() => props.mask ?? ctx?.mask.value ?? false)
const status = computed(() => ctx?.status.value ?? 'default')
const size = computed(() => ctx?.size.value ?? 'md')

const inputType = computed(() => (effectiveMask.value ? 'password' : 'text'))

const sizeClasses = computed(() => {
  switch (size.value) {
    case 'sm': return 'h-8 w-8 text-sm'
    case 'lg': return 'h-12 w-12 text-xl'
    default: return 'h-10 w-10 text-base'
  }
})

const statusClasses = computed(() => {
  switch (status.value) {
    case 'error':
      return 'border-destructive focus:border-destructive focus:ring-destructive/40 text-destructive'
    case 'warning':
      return 'border-warning focus:border-warning focus:ring-warning/40 text-warning'
    case 'success':
      return 'border-success focus:border-success focus:ring-success/40 text-success'
    default:
      return ''
  }
})
</script>

<template>
  <PinInputInput
    :type="inputType"
    data-uipkge
    data-slot="pin-input-slot"
    v-bind="forwarded"
    :class="
      cn(
        'relative -ml-px flex items-center justify-center border border-input bg-background text-center text-foreground shadow-xs outline-none transition-[border-color,box-shadow] first:ml-0 first:rounded-l-md last:rounded-r-md',
        'focus:relative focus:z-10 focus:border-ring focus:ring-2 focus:ring-ring/40',
        'disabled:cursor-not-allowed disabled:opacity-50',
        sizeClasses,
        statusClasses,
        props.class,
      )
    "
  />
</template>
