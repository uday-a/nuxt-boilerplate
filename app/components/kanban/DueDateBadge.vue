<script setup lang="ts">
import { computed } from 'vue'
import { CircleAlert, Clock } from '@/lib/icon-pack'
import { getDueStatus, formatDueDate } from '@/composables/useKanban'
import { cn } from '@/lib/utils'

const props = defineProps<{
  dueDate: string
  variant?: 'chip' | 'inline'
  class?: string
}>()

const status = computed(() => getDueStatus(props.dueDate))
const formatted = computed(() => formatDueDate(props.dueDate))

// Urgency must not rely on colour alone: overdue swaps the icon, and both
// states carry a screen-reader label.
const { t } = useI18n()
const icon = computed(() => (status.value === 'overdue' ? CircleAlert : Clock))
const statusLabel = computed(() =>
  status.value === 'overdue' ? t('dashboard.kanban.overdue') : status.value === 'soon' ? t('dashboard.kanban.dueSoon') : '',
)

const chipClasses = computed(() => {
  switch (status.value) {
    case 'overdue':
      return 'bg-destructive/10 text-destructive'
    case 'soon':
      return 'bg-warning/10 text-warning'
    default:
      return 'text-muted-foreground bg-muted'
  }
})

const inlineClasses = computed(() => {
  switch (status.value) {
    case 'overdue':
      return 'text-destructive'
    case 'soon':
      return 'text-warning'
    default:
      return 'text-foreground'
  }
})
</script>

<template>
  <div
    v-if="variant === 'chip'"
    :class="cn('flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium', chipClasses, props.class)"
  >
    <component
      :is="icon"
      class="size-3"
      aria-hidden="true"
    />
    <span
      v-if="statusLabel"
      class="sr-only"
    >{{ statusLabel }}:</span>
    {{ formatted }}
  </div>

  <p
    v-else
    :class="cn('flex items-center gap-1 text-sm leading-tight font-medium', inlineClasses, props.class)"
  >
    <component
      :is="icon"
      class="size-3"
      aria-hidden="true"
    />
    <span
      v-if="statusLabel"
      class="sr-only"
    >{{ statusLabel }}:</span>
    {{ formatted }}
  </p>
</template>
