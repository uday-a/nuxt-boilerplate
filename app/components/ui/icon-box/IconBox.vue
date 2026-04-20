<script setup lang="ts">
import type { Component } from 'vue'
import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<{
    icon: Component
    variant?: 'primary' | 'muted' | 'custom'
    shape?: 'rounded' | 'circle'
    size?: 'sm' | 'md' | 'lg'
    class?: string
    iconClass?: string
  }>(),
  {
    variant: 'primary',
    shape: 'rounded',
    size: 'md',
  }
)

const variantClasses: Record<string, string> = {
  primary: 'bg-primary/10 text-primary',
  muted: 'bg-muted text-muted-foreground',
  custom: '',
}

const shapeClasses: Record<string, string> = {
  rounded: 'rounded-lg',
  circle: 'rounded-full',
}

const sizeClasses: Record<string, string> = {
  sm: 'p-1.5',
  md: 'p-2',
  lg: 'p-3',
}

const iconSizes: Record<string, string> = {
  sm: 'size-3.5',
  md: 'size-4',
  lg: 'size-6',
}
</script>

<template>
  <div :class="cn('shrink-0', variantClasses[variant], shapeClasses[shape], sizeClasses[size], props.class)">
    <component :is="icon" :class="cn(iconSizes[size], props.iconClass)" />
  </div>
</template>
