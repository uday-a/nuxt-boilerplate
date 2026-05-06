<script setup lang="ts">
import type { SwitchRootEmits, SwitchRootProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { computed, getCurrentInstance, useSlots } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { SwitchRoot, SwitchThumb, useForwardPropsEmits } from 'reka-ui'
import { Loader2 } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

const props = defineProps<
  SwitchRootProps & {
    class?: HTMLAttributes['class']
    size?: 'sm' | 'default' | 'lg'
    checkedChildren?: string
    unCheckedChildren?: string
    loading?: boolean
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | string
  }
>()

const emits = defineEmits<SwitchRootEmits>()
const slots = useSlots()

const delegatedProps = reactiveOmit(
  props,
  'class',
  'size',
  'modelValue',
  'checkedChildren',
  'unCheckedChildren',
  'loading',
  'color',
)

const forwarded = useForwardPropsEmits(delegatedProps, emits)

// Detect controlled-vs-uncontrolled (Vue auto-defaults Boolean props to `false`,
// so the prop value alone can't distinguish).
const instance = getCurrentInstance()
const isControlled = computed(() => Boolean(instance?.vnode?.props?.['onUpdate:modelValue']))
const userPassedModelValue = computed(() => {
  const raw = instance?.vnode?.props
  return Boolean(raw && ('modelValue' in raw || 'model-value' in raw))
})

const switchStateBindings = computed(() => {
  if (isControlled.value) return { 'model-value': props.modelValue }
  if (userPassedModelValue.value) return { 'default-value': Boolean(props.modelValue) }
  return { 'default-value': false }
})

const hasChildren = computed(() =>
  Boolean(
    props.checkedChildren
    || props.unCheckedChildren
    || slots['checked-children']
    || slots['unchecked-children'],
  ),
)

const sizeClasses = computed(() => {
  const height = {
    sm: 'h-4',
    default: 'h-[1.15rem]',
    lg: 'h-6',
  }[props.size ?? 'default']

  if (hasChildren.value) {
    const width = {
      sm: 'min-w-8 w-fit',
      default: 'min-w-10 w-fit',
      lg: 'min-w-[3.25rem] w-fit',
    }[props.size ?? 'default']
    return `${height} ${width}`
  }

  const width = {
    sm: 'w-6',
    default: 'w-8',
    lg: 'w-11',
  }[props.size ?? 'default']
  return `${height} ${width}`
})

const thumbSizes = {
  sm: 'size-3',
  default: 'size-4',
  lg: 'size-5',
}

const thumbTranslate = {
  sm: 'data-[state=checked]:translate-x-[calc(100%-2px)]',
  default: 'data-[state=checked]:translate-x-[calc(100%-2px)]',
  lg: 'data-[state=checked]:translate-x-[calc(100%-5px)]',
}

const textSizes = {
  sm: 'text-[7px]',
  default: 'text-xs',
  lg: 'text-xs',
}

const thumbIconSizes = {
  sm: 'size-2',
  default: 'size-2.5',
  lg: 'size-3',
}

const colorMap: Record<string, string> = {
  primary: 'var(--primary)',
  secondary: 'var(--secondary)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  error: 'var(--destructive)',
  info: 'var(--info)',
}

const trackStyle = computed(() => ({
  '--switch-checked-bg': props.color
    ? (colorMap[props.color] || props.color)
    : 'var(--primary)',
}))
</script>

<template>
  <SwitchRoot
    v-slot="{ checked }"
    v-bind="{ 'data-slot': 'switch', ...forwarded, ...switchStateBindings }"
    :disabled="props.disabled || props.loading"
    :class="
      cn(
        'peer relative inline-flex shrink-0 items-center overflow-hidden rounded-full border border-transparent shadow-xs transition-[background-color,border-color,box-shadow] duration-150 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[var(--switch-checked-bg)] data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80',
        sizeClasses,
        props.class,
      )
    "
    :style="trackStyle"
  >
    <!-- Checked children (left side, visible when checked) -->
    <div
      v-if="hasChildren"
      class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-1 transition-opacity duration-150"
      :class="[checked ? 'opacity-100' : 'opacity-0', textSizes[size ?? 'default']]"
    >
      <span class="truncate font-medium text-primary-foreground">
        <slot name="checked-children">{{ checkedChildren }}</slot>
      </span>
    </div>

    <!-- Unchecked children (right side, visible when unchecked) -->
    <div
      v-if="hasChildren"
      class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-1 transition-opacity duration-150"
      :class="[!checked ? 'opacity-100' : 'opacity-0', textSizes[size ?? 'default']]"
    >
      <span class="truncate font-medium text-muted-foreground">
        <slot name="unchecked-children">{{ unCheckedChildren }}</slot>
      </span>
    </div>

    <SwitchThumb
      data-uipkge
      data-slot="switch-thumb"
      :class="
        cn(
          'bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none z-10 block rounded-full ring-0 transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] data-[state=unchecked]:translate-x-0',
          thumbSizes[size ?? 'default'],
          thumbTranslate[size ?? 'default'],
        )
      "
    >
      <Loader2
        v-if="loading"
        :class="[thumbIconSizes[size ?? 'default'], 'animate-spin text-muted-foreground']"
      />
      <slot
        v-else
        name="thumb"
        v-bind="{ checked }"
      />
    </SwitchThumb>
  </SwitchRoot>
</template>
