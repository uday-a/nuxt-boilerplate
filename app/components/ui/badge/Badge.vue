<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { Primitive } from 'reka-ui'
import { cn } from '@/lib/utils'
import { badgeVariants } from './badge.variants'

// Inlined unions: SFC compiler can't extract runtime props from
// `BadgeVariants['variant']` or reka-ui's PrimitiveProps.
const props = defineProps<{
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info'
  class?: HTMLAttributes['class']
  asChild?: boolean
  as?: string | object
}>()

const delegatedProps = reactiveOmit(props, 'class')
</script>

<template>
  <Primitive data-uipkge data-slot="badge" :class="cn(badgeVariants({ variant }), props.class)" v-bind="delegatedProps">
    <slot />
  </Primitive>
</template>
