<script setup lang="ts">
import { computed } from 'vue'
import type { KanbanColumn } from '@/composables/useKanban'
import { findTaskById, getTaskColumn } from '@/composables/useKanban'

const props = defineProps<{
  subtaskIds: string[]
  columns: KanbanColumn[]
  compact?: boolean
}>()

const subtasks = computed(() => {
  return props.subtaskIds
    .map((id) => {
      const task = findTaskById(props.columns, id)
      const column = getTaskColumn(props.columns, id)
      return task ? { task, column } : null
    })
    .filter(Boolean) as {
    task: NonNullable<ReturnType<typeof findTaskById>>
    column: ReturnType<typeof getTaskColumn>
  }[]
})

const doneCount = computed(() => subtasks.value.filter(s => s.column?.id === 'done').length)
</script>

<template>
  <div v-if="subtasks.length">
    <div class="mb-2 flex items-center justify-between">
      <span
        :class="compact ? 'text-xs' : 'text-sm'"
        class="text-muted-foreground tabular-nums"
      >
        {{ doneCount }}/{{ subtasks.length }} done
      </span>
      <span
        :class="compact ? 'text-xs' : 'text-xs'"
        class="text-muted-foreground tabular-nums"
      >
        {{ subtasks.length > 0 ? Math.round((doneCount / subtasks.length) * 100) : 0 }}%
      </span>
    </div>
    <div class="bg-muted mb-3 h-1.5 overflow-hidden rounded-full">
      <div
        :class="[
          'h-full rounded-full transition-all duration-500',
          doneCount === subtasks.length ? 'bg-success' : 'bg-primary',
        ]"
        :style="{ width: `${subtasks.length > 0 ? Math.round((doneCount / subtasks.length) * 100) : 0}%` }"
      />
    </div>

    <div :class="compact ? 'space-y-0.5' : 'space-y-1'">
      <NuxtLink
        v-for="{ task, column } in subtasks"
        :key="task.id"
        :to="`/dashboard/kanban/${task.id}`"
        :class="[
          'group/subtask flex items-center gap-2 rounded-md transition-colors',
          compact ? 'px-1 py-1' : 'px-1.5 py-1.5',
          'hover:bg-muted/50',
        ]"
      >
        <span :class="['size-1.5 shrink-0 rounded-full', column?.dotColor ?? 'bg-muted-foreground']" />
        <span :class="['shrink-0 font-mono', compact ? 'text-xs' : 'text-xs', 'text-muted-foreground']">
          {{ task.id }}
        </span>
        <span
          :class="[
            'min-w-0 flex-1 truncate',
            compact ? 'text-xs' : 'text-sm',
            column?.id === 'done' ? 'text-muted-foreground line-through' : 'text-foreground',
          ]"
        >
          {{ task.title }}
        </span>
        <span
          :class="[
            'shrink-0 rounded-md px-1.5 py-0.5 font-medium',
            compact ? 'text-xs' : 'text-xs',
            column?.color ?? 'text-muted-foreground',
          ]"
        >
          {{ column?.title ?? 'Unknown' }}
        </span>
      </NuxtLink>
    </div>
  </div>
  <p
    v-else
    :class="compact ? 'text-muted-foreground text-xs' : 'text-muted-foreground text-sm'"
  >
    No subtasks yet.
  </p>
</template>
