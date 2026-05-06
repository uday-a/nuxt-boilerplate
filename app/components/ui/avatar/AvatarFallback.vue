<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { VariantProps } from 'class-variance-authority'
import { computed } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const fallbackVariants = cva('flex size-full items-center justify-center rounded-full bg-muted font-medium', {
  variants: {
    size: {
      'xs': 'text-[8px]',
      'sm': 'text-xs',
      'default': 'text-sm',
      'lg': 'text-base',
      'xl': 'text-lg',
      '2xl': 'text-xl',
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
  },
  defaultVariants: {
    size: 'default',
    color: 'default',
  },
})

export type AvatarFallbackVariants = VariantProps<typeof fallbackVariants>

// Inlined unions: SFC compiler can't extract runtime props from
// indexed-access types.
const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes['class']
    size?: 'xs' | 'sm' | 'default' | 'lg' | 'xl' | '2xl'
    color?: 'default' | 'primary' | 'secondary' | 'destructive' | 'success' | 'warning' | 'info' | 'error' | 'muted'
    text?: string
  }>(),
  {
    size: 'default',
    color: 'default',
  },
)

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

function handleClick(event: MouseEvent) {
  emit('click', event)
}

const rootClasses = computed(() => cn(fallbackVariants({ size: props.size, color: props.color }), props.class))
</script>

<template>
  <span
    :class="rootClasses"
    data-uipkge
    data-slot="avatar-fallback"
    @click="handleClick"
  >
    <slot v-if="!text">{{ text }}</slot>
    <slot v-else />
  </span>
</template>
