<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <svg
    viewBox="0 0 32 32"
    :class="cn('size-full', props.class)"
    aria-hidden="true"
  >
    <rect
      x="0.5"
      y="0.5"
      width="31"
      height="31"
      rx="7"
      class="fill-card stroke-border"
      stroke-width="1"
    />
    <rect
      x="6"
      y="6"
      width="8"
      height="8"
      rx="1.6"
      class="fill-foreground"
    />
    <rect
      x="18"
      y="6"
      width="8"
      height="8"
      rx="1.6"
      class="fill-primary"
    />
    <rect
      x="6"
      y="18"
      width="8"
      height="8"
      rx="1.6"
      class="fill-muted-foreground/35"
    />
    <rect
      x="18"
      y="18"
      width="8"
      height="8"
      rx="1.6"
      class="fill-foreground"
    />
  </svg>
</template>
