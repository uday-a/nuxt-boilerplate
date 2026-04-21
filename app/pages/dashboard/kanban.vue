<script setup lang="ts">
import { createInitialColumns } from '@/composables/kanbanData'
import type { KanbanColumn } from '@/composables/useKanban'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Kanban' })

const columns = useState<KanbanColumn[]>('kanban-columns', () => createInitialColumns())
</script>

<template>
  <KanbanBoard
    v-model:columns="columns"
    title="Project board"
    description="Demo board seeded from the registry's kanban-data lib. Swap createInitialColumns() for a real fetcher when wiring to your DB."
  />
</template>
