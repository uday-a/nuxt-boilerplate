<script lang="ts" setup>
import type { HTMLAttributes } from 'vue'
import { useId } from 'reka-ui'
import { computed, provide } from 'vue'
import { cn } from '@/lib/utils'
import { FORM_ITEM_INJECTION_KEY } from './injectionKeys'
import FormLabel from './FormLabel.vue'
import type { FormStatus } from './types'

const props = defineProps<{
  class?: HTMLAttributes['class']
  label?: string
  required?: boolean
  description?: string
  status?: FormStatus
  help?: string
  layout?: 'vertical' | 'horizontal'
  labelWidth?: string
}>()

const id = useId()
provide(FORM_ITEM_INJECTION_KEY, id)

const statusBorderClass = computed(() => {
  switch (props.status) {
    case 'error':
      return 'border-destructive focus-within:border-destructive focus-within:ring-destructive/20'
    case 'warning':
      return 'border-warning focus-within:border-warning focus-within:ring-warning/20'
    case 'success':
      return 'border-success focus-within:border-success focus-within:ring-success/20'
    default:
      return ''
  }
})

const isHorizontal = computed(() => props.layout === 'horizontal')
</script>

<template>
  <div
    data-uipkge
    data-slot="form-item"
    :class="cn(
      'grid gap-2',
      isHorizontal && 'grid-cols-[var(--label-width,140px)_1fr] items-start gap-x-4 gap-y-0',
      props.class,
    )"
    :style="labelWidth ? { '--label-width': labelWidth } : undefined"
  >
    <div
      v-if="label || $slots.label"
      class="flex items-center gap-1"
    >
      <FormLabel
        v-if="label"
        :for="id"
      >
        {{ label }}
      </FormLabel>
      <slot name="label" />
      <span
        v-if="required"
        class="text-destructive text-sm"
      >*</span>
    </div>

    <div class="space-y-1">
      <slot />
      <p
        v-if="description"
        class="text-muted-foreground text-xs"
      >
        {{ description }}
      </p>
      <p
        v-if="help"
        class="text-xs"
        :class="{
          'text-destructive': status === 'error',
          'text-warning': status === 'warning',
          'text-success': status === 'success',
          'text-muted-foreground': !status,
        }"
      >
        {{ help }}
      </p>
    </div>
  </div>
</template>
