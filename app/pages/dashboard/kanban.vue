<script setup lang="ts">
// Seeded from createInitialColumns(); replace it with a real fetcher when wiring to your DB.
import { createInitialColumns } from '@/composables/kanbanData'
import type { KanbanColumn } from '@/composables/useKanban'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
const title = useRouteLabel()
useHead({ title })

const columns = useState<KanbanColumn[]>('kanban-columns', () => createInitialColumns())
</script>

<template>
  <KanbanBoard
    v-model:columns="columns"
    :title="title"
    description="Track product work across releases, bugs, docs and customer onboarding."
  />
</template>
