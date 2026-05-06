<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const skeletonLoaderVariants = cva('bg-muted animate-pulse rounded', {
  variants: {
    variant: {
      'text': 'h-4 w-full',
      'chip': 'h-8 w-24 rounded-full',
      'chip-icon': 'h-8 w-8 rounded-full',
      'article': '',
      'avatar': 'size-12 rounded-full',
      'avatar-small': 'size-8 rounded-full',
      'avatar-large': 'size-16 rounded-full',
      'heading': 'h-6 w-3/4',
      'heading-medium': 'h-5 w-1/2',
      'heading-small': 'h-4 w-1/3',
      'image': 'aspect-video w-full rounded-lg',
      'image-small': 'h-32 w-32 rounded-lg',
      'image-large': 'h-64 w-full rounded-lg',
      'card': '',
      'card-avatar': '',
      'actions': '',
      'table': 'h-4 w-full',
      'table-row': 'h-12 w-full',
      'button': 'h-10 w-24 rounded-md',
      'button-icon': 'h-10 w-10 rounded-md',
      'badge': 'h-6 w-16 rounded-full',
      'tab': 'h-8 w-24 rounded-md',
      'date-picker': 'h-10 w-full',
      'list-item': 'h-16 w-full',
      'list-item-two-line': 'h-20 w-full',
      'list-item-three-line': 'h-24 w-full',
    },
  },
  defaultVariants: {
    variant: 'text',
  },
})

export type SkeletonLoaderVariants = typeof skeletonLoaderVariants

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes['class']
    variant?: 'text' | 'chip' | 'chip-icon' | 'article' | 'avatar' | 'avatar-small' | 'avatar-large' | 'heading' | 'heading-medium' | 'heading-small' | 'image' | 'image-small' | 'image-large' | 'card' | 'card-avatar' | 'actions' | 'table' | 'table-row' | 'button' | 'button-icon' | 'badge' | 'tab' | 'date-picker' | 'list-item' | 'list-item-two-line' | 'list-item-three-line'
    loading?: boolean
    rows?: number
    boilerplate?: boolean
  }>(),
  {
    variant: 'text',
    loading: true,
    rows: 1,
    boilerplate: false,
  },
)
</script>

<template>
  <div
    data-uipkge
    data-slot="skeleton-loader"
    class="space-y-2"
  >
    <!-- Single item -->
    <template v-if="rows === 1">
      <div
        v-if="loading"
        :class="cn(skeletonLoaderVariants({ variant }), props.class)"
      />
      <slot v-else />
    </template>

    <!-- Multiple rows -->
    <template v-else>
      <template v-if="loading">
        <!-- Article variant with multiple elements -->
        <template v-if="variant === 'article'">
          <div :class="cn(skeletonLoaderVariants({ variant: 'heading' }), 'mb-4')" />
          <div :class="cn(skeletonLoaderVariants({ variant: 'text' }), 'mb-2')" />
          <div :class="cn(skeletonLoaderVariants({ variant: 'text' }), 'mb-2')" />
          <div :class="cn(skeletonLoaderVariants({ variant: 'text' }), 'w-3/4')" />
        </template>

        <!-- Card variant -->
        <template v-else-if="variant === 'card'">
          <div :class="cn(skeletonLoaderVariants({ variant: 'image-large' }), 'mb-4')" />
          <div :class="cn(skeletonLoaderVariants({ variant: 'heading-small' }), 'mb-2')" />
          <div :class="cn(skeletonLoaderVariants({ variant: 'text' }), 'mb-2')" />
          <div :class="cn(skeletonLoaderVariants({ variant: 'text' }), 'w-1/2')" />
        </template>

        <!-- Card avatar variant -->
        <template v-else-if="variant === 'card-avatar'">
          <div class="mb-4 flex items-center gap-4">
            <div :class="cn(skeletonLoaderVariants({ variant: 'avatar-large' }))" />
            <div class="flex-1 space-y-2">
              <div :class="cn(skeletonLoaderVariants({ variant: 'heading-small' }))" />
              <div :class="cn(skeletonLoaderVariants({ variant: 'text' }), 'w-1/2')" />
            </div>
          </div>
        </template>

        <!-- Actions variant -->
        <template v-else-if="variant === 'actions'">
          <div class="flex gap-2">
            <div :class="cn(skeletonLoaderVariants({ variant: 'button' }))" />
            <div :class="cn(skeletonLoaderVariants({ variant: 'button' }))" />
          </div>
        </template>

        <!-- Table variant -->
        <template v-else-if="variant === 'table'">
          <div
            v-for="i in rows"
            :key="i"
            :class="cn(skeletonLoaderVariants({ variant: 'table-row' }), 'mb-2')"
          />
        </template>

        <!-- List item variants -->
        <template v-else-if="variant === 'list-item'">
          <div
            v-for="i in rows"
            :key="i"
            class="mb-2 flex items-center gap-3"
          >
            <div :class="cn(skeletonLoaderVariants({ variant: 'avatar-small' }))" />
            <div class="flex-1">
              <div :class="cn(skeletonLoaderVariants({ variant: 'text' }))" />
            </div>
          </div>
        </template>

        <!-- List item two line -->
        <template v-else-if="variant === 'list-item-two-line'">
          <div
            v-for="i in rows"
            :key="i"
            class="mb-2 flex items-center gap-3"
          >
            <div :class="cn(skeletonLoaderVariants({ variant: 'avatar' }))" />
            <div class="flex-1 space-y-2">
              <div :class="cn(skeletonLoaderVariants({ variant: 'text' }))" />
              <div :class="cn(skeletonLoaderVariants({ variant: 'text' }), 'w-3/4')" />
            </div>
          </div>
        </template>

        <!-- List item three line -->
        <template v-else-if="variant === 'list-item-three-line'">
          <div
            v-for="i in rows"
            :key="i"
            class="mb-2 flex items-start gap-3"
          >
            <div :class="cn(skeletonLoaderVariants({ variant: 'avatar' }))" />
            <div class="flex-1 space-y-2">
              <div :class="cn(skeletonLoaderVariants({ variant: 'text' }))" />
              <div :class="cn(skeletonLoaderVariants({ variant: 'text' }))" />
              <div :class="cn(skeletonLoaderVariants({ variant: 'text' }), 'w-2/3')" />
            </div>
          </div>
        </template>

        <!-- Default: repeat rows -->
        <template v-else>
          <div
            v-for="i in rows"
            :key="i"
            :class="cn(skeletonLoaderVariants({ variant }), 'mb-2')"
          />
        </template>
      </template>
      <slot v-else />
    </template>

    <!-- Boilerplate mode: dim the content -->
    <div
      v-if="boilerplate && !loading"
      class="bg-muted/50 absolute inset-0"
    />
  </div>
</template>
