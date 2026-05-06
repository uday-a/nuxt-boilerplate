<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import type { FormStatus } from './types'

const props = defineProps<{
  class?: HTMLAttributes['class']
  status: FormStatus
  message: string
}>()

const statusConfig = {
  error: {
    icon: 'i-radix-icons-cross-circled',
    container: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  warning: {
    icon: 'i-radix-icons-triangle-alert',
    container: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900',
  },
  success: {
    icon: 'i-radix-icons-check-circled',
    container: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900',
  },
}
</script>

<template>
  <div
    v-if="status"
    data-uipkge
    data-slot="form-status"
    :class="cn(
      'flex items-center gap-2 rounded-md border px-3 py-2 text-sm',
      statusConfig[status].container,
      props.class,
    )"
  >
    <span :class="statusConfig[status].icon" />
    <span>{{ message }}</span>
  </div>
</template>
