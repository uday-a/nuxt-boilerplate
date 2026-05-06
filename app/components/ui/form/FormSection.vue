<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  title?: string
  subtitle?: string
  description?: string
  divider?: boolean
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div
    data-uipkge
    data-slot="form-section"
    :class="cn('space-y-3', props.class)"
  >
    <div
      v-if="divider"
      class="border-t pt-4"
    >
      <div
        v-if="title || subtitle"
        class="space-y-1"
      >
        <h4
          v-if="title"
          class="text-sm font-semibold"
        >
          {{ title }}
        </h4>
        <p
          v-if="subtitle"
          class="text-muted-foreground text-xs"
        >
          {{ subtitle }}
        </p>
      </div>
    </div>
    <div
      v-else-if="title || subtitle"
      class="space-y-1"
    >
      <h4
        v-if="title"
        class="text-sm font-semibold"
      >
        {{ title }}
      </h4>
      <p
        v-if="subtitle"
        class="text-muted-foreground text-xs"
      >
        {{ subtitle }}
      </p>
    </div>
    <p
      v-if="description"
      class="text-muted-foreground text-xs"
    >
      {{ description }}
    </p>
    <slot />
  </div>
</template>
