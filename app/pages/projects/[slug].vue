<script setup lang="ts">
import { Folder, AlertCircle, Loader2, Trash2 } from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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

const route = useRoute()
const router = useRouter()
const slug = computed(() => String(route.params.slug))

const { data: getRes, pending, refresh, error: fetchErr } = await useFetch<ApiResponse<{ project: Project }>>(() => `/api/projects/${slug.value}`)

const project = computed<Project | null>(() =>
  getRes.value?.ok ? getRes.value.data.project : null,
)
const loadError = computed(() => fetchErr.value?.message ?? (getRes.value && !getRes.value.ok ? getRes.value.error.message : null))

useHead(() => ({ title: `${project.value?.name ?? slug.value} · Projects` }))

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
  if (!confirm(`Delete "${project.value.name}"? This cannot be undone.`)) return
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
  <div class="space-y-6">
    <div
      v-if="loadError"
      class="border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
    >
      <AlertCircle class="size-4" />
      {{ loadError }}
    </div>

    <div
      v-else-if="pending"
      class="text-muted-foreground text-sm"
    >
      Loading…
    </div>

    <template v-else-if="project">
      <header class="space-y-2">
        <div class="flex items-center gap-2">
          <Folder class="text-muted-foreground size-4" />
          <h1 class="text-2xl font-semibold tracking-tight">
            {{ project.name }}
          </h1>
        </div>
        <p class="text-muted-foreground text-sm">
          Project · <code>{{ project.slug }}</code> · created {{ new Date(project.createdAt).toLocaleDateString() }}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle class="text-base">
            Details
          </CardTitle>
          <CardDescription>Edit the project metadata. Slug is immutable after creation.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid gap-1.5">
            <Label for="p-name">Name</Label>
            <Input
              id="p-name"
              v-model="form.name"
            />
          </div>
          <div class="grid gap-1.5">
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
          >
            <AlertCircle class="size-4" />
            {{ saveError }}
          </div>
          <div class="flex justify-between">
            <Button
              variant="ghost"
              :disabled="deleteState === 'deleting'"
              class="text-destructive hover:text-destructive"
              @click="remove"
            >
              <Trash2 class="size-4" />
              Delete project
            </Button>
            <Button
              :disabled="saveState === 'saving' || !form.name"
              @click="save"
            >
              <Loader2
                v-if="saveState === 'saving'"
                class="size-4 animate-spin"
              />
              Save changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </template>
  </div>
</template>
