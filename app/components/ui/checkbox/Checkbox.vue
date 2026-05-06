<script setup lang="ts">
import type { CheckboxRootProps } from 'reka-ui'
import type { ComputedRef, HTMLAttributes } from 'vue'
import { computed, getCurrentInstance, inject } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { Check, Minus, Loader2 } from 'lucide-vue-next'
import { CheckboxIndicator, CheckboxRoot, useForwardPropsEmits } from 'reka-ui'
import { cn } from '@/lib/utils'

export interface CheckboxProps extends Omit<CheckboxRootProps<boolean | string>, 'defaultValue' | 'modelValue'> {
  class?: HTMLAttributes['class']
  /** The controlled checked state of the checkbox. Can be binded with v-model. */
  modelValue?: boolean | 'indeterminate' | null
  /** The value given as data when submitted with a name. */
  value?: string
  /** Id of the element */
  id?: string
  /** The value used when the checkbox is checked. Defaults to `true`. */
  trueValue?: boolean | string
  /** The value used when the checkbox is unchecked. Defaults to `false`. */
  falseValue?: boolean | string
  /** Size of the checkbox */
  size?: 'sm' | 'md' | 'lg'
  /** Custom color for the checked state - matches Vuetify color system */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | string
  /** Label text displayed next to the checkbox */
  label?: string
  /** Hint text shown below the checkbox */
  hint?: string
  /** Error message to display */
  errorMessages?: string | string[]
  /** Whether to show error state */
  error?: boolean
  /** When `true`, prevents the user from interacting with the checkbox */
  disabled?: boolean
  /** When `true`, the checkbox is in readonly state */
  readonly?: boolean
  /** When `true`, shows an indeterminate state */
  indeterminate?: boolean
  /** Density of the checkbox - affects spacing */
  density?: 'compact' | 'default' | 'comfortable'
  /** When `true`, the icon is hidden */
  hideIcon?: boolean
  /** Loading state - shows a spinner */
  loading?: boolean
  /** Ripple effect on click */
  ripple?: boolean
  /** Custom icon to show when checked */
  checkedIcon?: any
  /** Custom icon to show when indeterminate */
  indeterminateIcon?: any
  /** Label position - before or after the checkbox */
  labelPosition?: 'before' | 'after'
  /** Whether the checkbox appears flat (no elevation) */
  flat?: boolean
  /** Whether the checkbox has a background color */
  bgColor?: boolean
  /** Inline text style */
  inline?: boolean
  /** Name attribute for form submission */
  name?: string
}

const props = withDefaults(defineProps<CheckboxProps>(), {
  size: 'md',
  density: 'default',
  color: 'primary',
  trueValue: true,
  falseValue: false,
  hideIcon: false,
  ripple: true,
  labelPosition: 'after',
  flat: false,
  bgColor: false,
  inline: false,
})

const emits = defineEmits<{
  'update:modelValue': [value: boolean | 'indeterminate']
  'change': [value: boolean | 'indeterminate']
  'focus': [event: FocusEvent]
  'blur': [event: FocusEvent]
}>()

const delegatedProps = reactiveOmit(
  props,
  'class',
  'size',
  'color',
  'label',
  'hint',
  'errorMessages',
  'error',
  'disabled',
  'readonly',
  'indeterminate',
  'density',
  'hideIcon',
  'loading',
  'ripple',
  'checkedIcon',
  'indeterminateIcon',
  'labelPosition',
  'flat',
  'bgColor',
  'inline',
  'trueValue',
  'falseValue',
  'modelValue',
  'name',
)

const forwarded = useForwardPropsEmits(delegatedProps, emits)

// Injected group context
const groupContext = inject<{ name?: ComputedRef<string | undefined> } | null>('checkboxGroupContext', null)
const actualName = computed(() => props.name ?? groupContext?.name?.value)

// Size classes
const sizeClasses = {
  sm: 'size-3.5',
  md: 'size-4',
  lg: 'size-5',
}

const iconSizes = {
  sm: 'size-2.5',
  md: 'size-3.5',
  lg: 'size-4',
}

// Color classes for checked state
const colorClasses: Record<string, string> = {
  primary:
    'data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:border-primary',
  secondary:
    'data-[state=checked]:bg-secondary data-[state=checked]:border-secondary data-[state=indeterminate]:bg-secondary data-[state=indeterminate]:border-secondary',
  success:
    'data-[state=checked]:bg-[var(--success)] data-[state=checked]:border-[var(--success)] data-[state=indeterminate]:bg-[var(--success)] data-[state=indeterminate]:border-[var(--success)]',
  warning:
    'data-[state=checked]:bg-[var(--warning)] data-[state=checked]:border-[var(--warning)] data-[state=indeterminate]:bg-[var(--warning)] data-[state=indeterminate]:border-[var(--warning)]',
  error:
    'data-[state=checked]:bg-destructive data-[state=checked]:border-destructive data-[state=indeterminate]:bg-destructive data-[state=indeterminate]:border-destructive',
  info: 'data-[state=checked]:bg-[var(--info)] data-[state=checked]:border-[var(--info)] data-[state=indeterminate]:bg-[var(--info)] data-[state=indeterminate]:border-[var(--info)]',
}

// Density classes
const densityClasses = {
  compact: 'gap-1',
  default: 'gap-2',
  comfortable: 'gap-3',
}

// Build error state
const hasError = computed(() => {
  if (props.error) return true
  if (
    props.errorMessages
    && (typeof props.errorMessages === 'string' ? props.errorMessages : props.errorMessages.length > 0)
  )
    return true
  return false
})

// Determine if the checkbox is in an indeterminate state
const isIndeterminate = computed(() => {
  return props.indeterminate || props.modelValue === 'indeterminate'
})

// Detect whether the parent bound v-model (looks for an onUpdate:modelValue
// listener) and whether they passed an initial modelValue prop at all (Vue
// auto-coerces Boolean-union props to `false` when not provided, so a prop
// check alone can't distinguish controlled vs unbound usage).
const instance = getCurrentInstance()
const isControlled = computed(() => Boolean(instance?.vnode?.props?.['onUpdate:modelValue']))
const userPassedModelValue = computed(() => {
  const raw = instance?.vnode?.props
  return Boolean(raw && ('modelValue' in raw || 'model-value' in raw))
})

// Bind model-value only when actually controlled. Otherwise seed Reka's
// internal state via default-value so click toggles work.
const checkboxStateBindings = computed(() => {
  if (isIndeterminate.value) return { 'model-value': 'indeterminate' as const }
  if (isControlled.value) return { 'model-value': props.modelValue }
  if (userPassedModelValue.value) return { 'default-value': Boolean(props.modelValue) }
  return { 'default-value': false }
})

// Build checkbox classes
const checkboxClasses = computed(() => {
  return cn(
    'peer border-input data-[state=checked]:text-primary-foreground data-[state=indeterminate]:text-primary-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shrink-0 rounded-[4px] border shadow-xs transition-all duration-200 outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
    sizeClasses[props.size],
    colorClasses[props.color] || colorClasses.primary,
    hasError.value
    && 'border-destructive data-[state=checked]:!bg-destructive data-[state=checked]:!border-destructive data-[state=indeterminate]:!bg-destructive data-[state=indeterminate]:!border-destructive',
    props.flat && 'shadow-none',
    props.class,
  )
})
</script>

<template>
  <div
    class="flex items-start"
    :class="[densityClasses[density], inline ? 'inline-flex' : 'flex-col']"
  >
    <label
      v-if="label && labelPosition === 'before'"
      :for="id"
      class="mr-2 cursor-pointer text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      :class="[hasError ? 'text-destructive' : '', disabled && 'cursor-not-allowed opacity-50']"
    >
      {{ label }}
    </label>

    <div class="flex items-center">
      <CheckboxRoot
        v-bind="{ 'data-slot': 'checkbox', ...forwarded, ...checkboxStateBindings }"
        :id="id"
        v-slot="slotProps"
        :value="value"
        :disabled="disabled"
        :name="actualName"
        :class="checkboxClasses"
        @update:model-value="(val: boolean | 'indeterminate') => emits('update:modelValue', val)"
      >
        <CheckboxIndicator
          data-uipkge
          data-slot="checkbox-indicator"
          class="grid place-content-center text-current transition-none"
          :force-mount="isIndeterminate || hideIcon"
        >
          <slot v-bind="slotProps">
            <Loader2
              v-if="loading"
              :class="[iconSizes[size], 'animate-spin']"
            />
            <Minus
              v-else-if="isIndeterminate"
              :class="iconSizes[size]"
            />
            <Check
              v-else-if="!hideIcon"
              :class="iconSizes[size]"
            />
          </slot>
        </CheckboxIndicator>
      </CheckboxRoot>

      <label
        v-if="label && labelPosition === 'after'"
        :for="id"
        class="ml-2 cursor-pointer text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        :class="[hasError ? 'text-destructive' : '', disabled && 'cursor-not-allowed opacity-50']"
      >
        {{ label }}
      </label>
    </div>

    <p
      v-if="hint && !hasError"
      class="text-muted-foreground mt-1 text-xs"
    >
      {{ hint }}
    </p>

    <div
      v-if="hasError"
      class="mt-1 flex flex-col gap-0.5"
    >
      <p
        v-if="typeof errorMessages === 'string'"
        class="text-destructive text-xs"
      >
        {{ errorMessages }}
      </p>
      <template v-else>
        <p
          v-for="(msg, i) in errorMessages"
          :key="i"
          class="text-destructive text-xs"
        >
          {{ msg }}
        </p>
      </template>
    </div>
  </div>
</template>
