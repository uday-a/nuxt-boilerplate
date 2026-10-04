<script setup lang="ts">
// /dashboard/kanban and /dashboard/kanban/<task id> are one page: the id
// deep-links that task's sheet. A static key keeps the board mounted when
// the id changes (no remount, scroll lock and state stay put).
// Seeded from createInitialColumns(); replace it with a real fetcher when wiring to your DB.
import { createInitialColumns } from '@/composables/kanbanData'
import type { KanbanColumn } from '@/composables/useKanban'

definePageMeta({
  layout: 'dashboard',
  key: 'dashboard-kanban',
  middleware: [
    'auth',
    // Last breadcrumb = task title on the detail URL. Set in middleware so
    // it lands before the layout renders (SSR and client agree).
    (to) => {
      const columns = useState<KanbanColumn[]>('kanban-columns', () => createInitialColumns())
      const id = to.params.id ? String(to.params.id) : null
      useState<string | null>('page-crumb').value = id ? (columns.value.flatMap(c => c.tasks).find(x => x.id === id)?.title ?? null) : null
    },
  ],
})

const route = useRoute()
const { t } = useI18n()
const columns = useState<KanbanColumn[]>('kanban-columns', () => createInitialColumns())

const taskId = computed(() => (route.params.id ? String(route.params.id) : null))
const task = computed(() => (taskId.value ? columns.value.flatMap(c => c.tasks).find(x => x.id === taskId.value) : undefined))
const notFound = () => createError({ statusCode: 404, statusMessage: 'Task not found', fatal: true })
if (taskId.value && !task.value) throw notFound()
watch(taskId, (id) => {
  if (id && !task.value) showError(notFound())
})

const boardTitle = computed(() => t('nav.items.kanban'))
useHead({ title: () => task.value?.title ?? boardTitle.value })
// Leaving the board: drop the task crumb (set by the middleware above).
const pageCrumb = useState<string | null>('page-crumb', () => null)
onUnmounted(() => {
  pageCrumb.value = null
})
</script>

<template>
  <KanbanBoard
    v-model:columns="columns"
    :open-task-id="taskId"
    :title="boardTitle"
    description="Track product work across releases, bugs, docs and customer onboarding."
    @update:open-task-id="navigateTo('/dashboard/kanban')"
  />
</template>
