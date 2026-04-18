<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { VariantProps } from 'class-variance-authority'
import { computed } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const avatarVariants = cva('relative flex shrink-0 overflow-hidden', {
  variants: {
    size: {
      xs: 'size-4',
      sm: 'size-6',
      default: 'size-8',
      lg: 'size-12',
      xl: 'size-16',
      '2xl': 'size-20',
    },
    rounded: {
      none: 'rounded-none',
      sm: 'rounded-sm',
      default: 'rounded-full',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      '2xl': 'rounded-2xl',
      '3xl': 'rounded-3xl',
      full: 'rounded-full',
    },
    color: {
      default: '',
      primary: 'bg-primary text-primary-foreground',
      secondary: 'bg-secondary text-secondary-foreground',
      destructive: 'bg-destructive text-destructive-foreground',
      success: 'bg-[var(--success)] text-white dark:text-black',
      warning: 'bg-[var(--warning)] text-black',
      info: 'bg-[var(--info)] text-white dark:text-black',
      error: 'bg-destructive text-white dark:text-black',
      muted: 'bg-muted text-muted-foreground',
    },
    variant: {
      default: '',
      outlined: 'border-2 border-current',
      soft: 'bg-opacity-20',
    },
  },
  compoundVariants: [
    { color: 'primary', variant: 'soft', class: 'bg-primary/20 text-primary' },
    { color: 'secondary', variant: 'soft', class: 'bg-secondary/20 text-secondary-foreground' },
    { color: 'destructive', variant: 'soft', class: 'bg-destructive/20 text-destructive' },
    { color: 'success', variant: 'soft', class: 'bg-[var(--success)]/20 text-[var(--success)]' },
    { color: 'warning', variant: 'soft', class: 'bg-[var(--warning)]/20 text-[var(--warning)]' },
    { color: 'info', variant: 'soft', class: 'bg-[var(--info)]/20 text-[var(--info)]' },
    { color: 'error', variant: 'soft', class: 'bg-destructive/20 text-destructive' },
  ],
  defaultVariants: {
    size: 'default',
    rounded: 'default',
    color: 'default',
  },
})

export type AvatarVariants = VariantProps<typeof avatarVariants>

// Inlined unions: SFC compiler can't extract runtime props from
// `AvatarVariants['size']` etc. indexed-access types.
const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes['class']
    size?: 'xs' | 'sm' | 'default' | 'lg' | 'xl' | '2xl'
    rounded?: 'none' | 'sm' | 'default' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
    color?: 'default' | 'primary' | 'secondary' | 'destructive' | 'success' | 'warning' | 'info' | 'error' | 'muted'
    variant?: 'default' | 'outlined' | 'soft'
    tile?: boolean
    disabled?: boolean
    loading?: boolean
  }>(),
  {
    tile: false,
    disabled: false,
    loading: false,
  }
)

const emit = defineEmits<{
  click: [event: MouseEvent]
  error: [event: Event]
  load: [event: Event]
}>()

function handleClick(event: MouseEvent) {
  if (!props.disabled) {
    emit('click', event)
  }
}

function handleError(event: Event) {
  emit('error', event)
}

function handleLoad(event: Event) {
  emit('load', event)
}

const rootClasses = computed(() =>
  cn(
    avatarVariants({ size: props.size, rounded: props.rounded, color: props.color, variant: props.variant }),
    props.tile ? 'rounded-none' : '',
    props.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    props.loading ? 'animate-pulse' : '',
    props.class
  )
)
</script>

<template>
  <span :class="rootClasses" data-uipkge data-slot="avatar" @click="handleClick">
    <slot />
  </span>
</template>
