<script setup lang="ts">
import { computed } from 'vue'
import { Clock } from 'lucide-vue-next'
import { getDueStatus, formatDueDate } from '@/composables/useKanban'
import { cn } from '@/lib/utils'

const props = defineProps<{
  dueDate: string
  variant?: 'chip' | 'inline'
  class?: string
}>()

const status = computed(() => getDueStatus(props.dueDate))
const formatted = computed(() => formatDueDate(props.dueDate))

const chipClasses = computed(() => {
  switch (status.value) {
    case 'overdue':
      return 'bg-red-500/10 text-red-600 dark:text-red-400'
    case 'soon':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
    default:
      return 'text-muted-foreground bg-muted'
  }
})

const inlineClasses = computed(() => {
  switch (status.value) {
    case 'overdue':
      return 'text-red-500'
    case 'soon':
      return 'text-amber-500'
    default:
      return 'text-foreground'
  }
})
</script>

<template>
  <div
    v-if="variant === 'chip'"
    :class="cn('flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium', chipClasses, props.class)"
  >
    <Clock class="size-3" />
    {{ formatted }}
  </div>

  <p
    v-else
    :class="cn('flex items-center gap-1 text-[13px] leading-tight font-medium', inlineClasses, props.class)"
  >
    <Clock class="size-3" />
    {{ formatted }}
  </p>
</template>
