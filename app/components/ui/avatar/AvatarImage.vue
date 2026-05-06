<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes['class']
    src?: string
    alt?: string
    fallback?: string
    loading?: 'eager' | 'lazy'
    referrerpolicy?: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url' | ''
    crossorigin?: 'anonymous' | 'use-credentials'
    onerror?: (event: Event) => void
    onload?: (event: Event) => void
  }>(),
  {
    loading: 'lazy',
  },
)

const emit = defineEmits<{
  error: [event: Event]
  load: [event: Event]
}>()

function handleError(event: Event) {
  emit('error', event)
  if (props.onerror) {
    props.onerror(event)
  }
}

function handleLoad(event: Event) {
  emit('load', event)
  if (props.onload) {
    props.onload(event)
  }
}
</script>

<template>
  <img
    v-if="src"
    :src="src"
    :alt="alt"
    :loading="loading"
    :referrerpolicy="referrerpolicy"
    :crossorigin="crossorigin"
    :class="cn('aspect-square size-full object-cover', props.class)"
    data-uipkge
    data-slot="avatar-image"
    @error="handleError"
    @load="handleLoad"
  >
  <slot v-else />
</template>
