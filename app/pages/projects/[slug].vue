<script setup lang="ts">
import { AlertCircle, Loader2, Trash2 } from '@/lib/icon-pack'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { EmptyState } from '@/components/ui/empty-state'
import { Page, PageHeader, PageHeaderHeading, PageBody } from '@/components/ui/page'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { ApiResponse } from '~~/server/utils/response'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

interface Project {
  id: number
  slug: string
  name: string
  description: string | null
  ownerId: number
  createdAt: string | Date
  updatedAt: string | Date
}

const { locale } = useI18n()
const route = useRoute()
const router = useRouter()
const slug = computed(() => String(route.params.slug))

const { data: getRes, pending, refresh, error: fetchErr } = await useFetch<ApiResponse<{ project: Project }>>(() => `/api/projects/${slug.value}`)

const project = computed<Project | null>(() =>
  getRes.value?.ok ? getRes.value.data.project : null,
)
const loadError = computed(() => fetchErr.value?.message ?? (getRes.value && !getRes.value.ok ? getRes.value.error.message : null))

// Detail pages have no nav label of their own; the H1 and tab title use the
// project's name (falling back to the route label while it loads).
const routeLabel = useRouteLabel()
const title = computed(() => project.value?.name ?? routeLabel.value)
useHead({ title })

// Edit form. Initialized from server data each time it arrives.
const form = reactive({ name: '', description: '' })
watchEffect(() => {
  if (project.value) {
    form.name = project.value.name
    form.description = project.value.description ?? ''
  }
})

const saveState = ref<'idle' | 'saving' | 'error'>('idle')
const saveError = ref<string | null>(null)
const deleteState = ref<'idle' | 'deleting'>('idle')
// Designed confirm dialog instead of window.confirm(), matching delete-user.
const confirmDelete = ref(false)

async function save() {
  if (!project.value) return
  saveState.value = 'saving'
  saveError.value = null
  const res = await $fetch<ApiResponse<{ project: Project }>>(`/api/projects/${slug.value}`, {
    method: 'PUT',
    body: { name: form.name, description: form.description || null },
  }).catch((err) => {
    const data = (err as { data?: { error?: { message?: string } } }).data
    return { ok: false, error: { code: 'INTERNAL', message: data?.error?.message ?? 'Failed to save' } } as const
  })
  if (!res.ok) {
    saveError.value = res.error.message
    saveState.value = 'error'
    return
  }
  saveState.value = 'idle'
  await refresh()
}

async function remove() {
  if (!project.value) return
  confirmDelete.value = false
  deleteState.value = 'deleting'
  const res = await $fetch<ApiResponse<{ deleted: boolean }>>(`/api/projects/${slug.value}`, {
    method: 'DELETE',
  }).catch((err) => {
    const data = (err as { data?: { error?: { message?: string } } }).data
    return { ok: false, error: { code: 'INTERNAL', message: data?.error?.message ?? 'Failed to delete' } } as const
  })
  deleteState.value = 'idle'
  if (res.ok) {
    await router.push('/projects')
  }
  else {
    saveError.value = res.error.message
  }
}
</script>

<template>
  <Page>
    <PageHeader>
      <PageHeaderHeading
        :title="title"
        :description="project ? `Created ${new Date(project.createdAt).toLocaleDateString(locale)}` : undefined"
      />
    </PageHeader>

    <PageBody class="max-w-3xl space-y-4">
      <EmptyState
        v-if="loadError"
        :icon="AlertCircle"
        role="alert"
        title="Couldn't load this project"
        description="It may have been deleted, or something went wrong on our side."
      >
        <div class="mt-4 flex justify-center gap-2">
          <Button
            size="sm"
            variant="outline"
            @click="refresh()"
          >
            Retry
          </Button>
          <Button
            size="sm"
            variant="ghost"
            as-child
          >
            <NuxtLink to="/projects">Back to projects</NuxtLink>
          </Button>
        </div>
      </EmptyState>

      <Skeleton
        v-else-if="pending"
        class="h-72 rounded-xl"
        aria-busy="true"
      />

      <Card v-else-if="project">
        <CardHeader>
          <CardTitle class="text-base">
            Details
          </CardTitle>
          <CardDescription>Rename the project or update its description.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid gap-2">
            <Label for="p-name">Name</Label>
            <Input
              id="p-name"
              v-model="form.name"
            />
          </div>
          <div class="grid gap-2">
            <Label for="p-desc">Description</Label>
            <Textarea
              id="p-desc"
              v-model="form.description"
              rows="4"
            />
          </div>
          <div
            v-if="saveError"
            class="text-destructive flex items-center gap-2 text-sm"
            role="alert"
          >
            <AlertCircle
              class="size-4 shrink-0"
              aria-hidden="true"
            />
            {{ saveError }}
          </div>
          <div class="flex justify-between">
            <Button
              variant="ghost"
              :disabled="deleteState === 'deleting'"
              class="text-destructive hover:text-destructive"
              @click="confirmDelete = true"
            >
              <Trash2
                class="size-4"
                aria-hidden="true"
              />
              Delete project
            </Button>
            <Button
              :disabled="saveState === 'saving' || !form.name"
              @click="save"
            >
              <Loader2
                v-if="saveState === 'saving'"
                class="size-4 animate-spin"
                aria-hidden="true"
              />
              Save changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageBody>

    <!-- Delete confirmation -->
    <Dialog v-model:open="confirmDelete">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete “{{ project?.name }}”?</DialogTitle>
          <DialogDescription>The project and its settings are removed for everyone. This can’t be undone.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            @click="confirmDelete = false"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            @click="remove"
          >
            <Trash2
              class="size-4"
              aria-hidden="true"
            />
            Delete project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </Page>
</template>
