<script setup lang="ts">
import { Folder, Plus, Loader2, AlertCircle } from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { ApiResponse } from '~~/server/utils/response'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Projects' })

interface Project {
  id: number
  slug: string
  name: string
  description: string | null
  ownerId: number
  createdAt: string | Date
  updatedAt: string | Date
}

const { data: listRes, pending, refresh, error: listError } = await useFetch<ApiResponse<{ projects: Project[] }>>('/api/projects')

const projects = computed<Project[]>(() =>
  listRes.value?.ok ? listRes.value.data.projects : [],
)
const fetchError = computed(() => listError.value?.message ?? (listRes.value && !listRes.value.ok ? listRes.value.error.message : null))

// Create-project dialog state.
const open = ref(false)
const form = reactive({ slug: '', name: '', description: '' })
const submitState = ref<'idle' | 'submitting' | 'error'>('idle')
const submitError = ref<string | null>(null)

// Auto-derive a slug from the name so vibe-coders rarely have to think
// about it. Stops auto-deriving the moment they type into the slug field
// themselves so we don't trample explicit edits.
const slugTouched = ref(false)
watch(() => form.name, (next) => {
  if (slugTouched.value) return
  form.slug = next
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
})

async function createProject() {
  submitState.value = 'submitting'
  submitError.value = null
  const res = await $fetch<ApiResponse<{ project: Project }>>('/api/projects', {
    method: 'POST',
    body: { slug: form.slug, name: form.name, description: form.description || undefined },
  }).catch((err) => {
    const data = (err as { data?: { error?: { message?: string } } }).data
    return { ok: false, error: { code: 'INTERNAL', message: data?.error?.message ?? 'Failed to create project' } } as const
  })

  if (!res.ok) {
    submitError.value = res.error.message
    submitState.value = 'error'
    return
  }

  // Reset, close, refetch the list.
  Object.assign(form, { slug: '', name: '', description: '' })
  slugTouched.value = false
  submitState.value = 'idle'
  open.value = false
  await refresh()
}
</script>

<template>
  <div class="space-y-6">
    <header class="flex items-start justify-between gap-4">
      <div class="space-y-1">
        <h1 class="text-2xl font-semibold tracking-tight">
          Projects
        </h1>
        <p class="text-muted-foreground text-sm">
          Workspaces grouping related work, members, and assets.
        </p>
      </div>
      <Dialog v-model:open="open">
        <DialogTrigger as-child>
          <Button size="sm">
            <Plus class="size-4" />
            New project
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New project</DialogTitle>
            <DialogDescription>Slug becomes part of the URL: /projects/&lt;slug&gt;.</DialogDescription>
          </DialogHeader>
          <div class="space-y-3">
            <div class="grid gap-1.5">
              <Label for="np-name">Name</Label>
              <Input
                id="np-name"
                v-model="form.name"
                placeholder="My new project"
              />
            </div>
            <div class="grid gap-1.5">
              <Label for="np-slug">Slug</Label>
              <Input
                id="np-slug"
                v-model="form.slug"
                placeholder="my-new-project"
                @input="slugTouched = true"
              />
              <p class="text-muted-foreground text-xs">
                Lowercase letters, numbers, hyphens. Must be unique.
              </p>
            </div>
            <div class="grid gap-1.5">
              <Label for="np-desc">Description (optional)</Label>
              <Textarea
                id="np-desc"
                v-model="form.description"
                rows="3"
              />
            </div>
            <div
              v-if="submitError"
              class="text-destructive flex items-center gap-2 text-sm"
            >
              <AlertCircle class="size-4" />
              {{ submitError }}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              :disabled="submitState === 'submitting'"
              @click="open = false"
            >
              Cancel
            </Button>
            <Button
              :disabled="submitState === 'submitting' || !form.name || !form.slug"
              @click="createProject"
            >
              <Loader2
                v-if="submitState === 'submitting'"
                class="size-4 animate-spin"
              />
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>

    <div
      v-if="fetchError"
      class="border-destructive/30 bg-destructive/10 text-destructive flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
    >
      <AlertCircle class="size-4" />
      {{ fetchError }}
    </div>

    <div
      v-else-if="pending"
      class="text-muted-foreground text-sm"
    >
      Loading projects…
    </div>

    <div
      v-else-if="!projects.length"
      class="text-muted-foreground text-sm"
    >
      No projects yet. Create one to get started.
    </div>

    <div
      v-else
      class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <NuxtLink
        v-for="p in projects"
        :key="p.id"
        :to="`/projects/${p.slug}`"
        class="group"
      >
        <Card class="h-full transition-colors group-hover:border-foreground/20">
          <CardHeader>
            <div class="flex items-center gap-2">
              <Folder class="text-muted-foreground size-4" />
              <CardTitle class="text-base">
                {{ p.name }}
              </CardTitle>
            </div>
            <CardDescription>{{ p.description ?? '—' }}</CardDescription>
          </CardHeader>
          <CardContent>
            <span class="text-muted-foreground text-xs">Open project →</span>
          </CardContent>
        </Card>
      </NuxtLink>
    </div>
  </div>
</template>
