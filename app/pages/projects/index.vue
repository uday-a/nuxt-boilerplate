<script setup lang="ts">
import { AlertCircle, CircleDot, FolderPlus, Loader2, Plus } from '@/lib/icon-pack'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Page, PageHeader, PageHeaderHeading, PageBody } from '@/components/ui/page'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { ApiResponse } from '~~/server/utils/response'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
const title = useRouteLabel()
useHead({ title })

const { t, locale } = useI18n()

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

// Members, status and open-task counts aren't in the projects API yet, so
// each card gets deterministic sample values keyed by project id. Swap this
// for real fields once the API returns them.
const SAMPLE_MEMBERS = ['Emma Clarke', 'James Porter', 'Olivia Brooks', 'Daniel Hughes', 'Sophie Turner', 'Liam Foster']
const SAMPLE_STATUS = [
  { label: 'On track', variant: 'success' },
  { label: 'At risk', variant: 'warning' },
  { label: 'On hold', variant: 'secondary' },
] as const

function initials(name: string) {
  return name.split(' ').map(part => part[0]).join('')
}

function sampleMeta(id: number) {
  const memberCount = 2 + (id % 4)
  const members = Array.from({ length: memberCount }, (_, i) => SAMPLE_MEMBERS[(id + i) % SAMPLE_MEMBERS.length]!)
  return {
    members,
    status: SAMPLE_STATUS[id % SAMPLE_STATUS.length]!,
    openTasks: 3 + ((id * 7) % 18),
  }
}

function timeAgo(value: string | Date) {
  const diffMs = new Date(value).getTime() - Date.now()
  const rtf = new Intl.RelativeTimeFormat(locale.value, { numeric: 'auto' })
  const days = Math.round(diffMs / 86400000)
  if (Math.abs(days) < 1) return rtf.format(Math.round(diffMs / 3600000), 'hour')
  if (Math.abs(days) < 30) return rtf.format(days, 'day')
  return rtf.format(Math.round(days / 30), 'month')
}

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
  <Page>
    <PageHeader>
      <PageHeaderHeading
        :title="title"
        description="Group related work, the people on it and what's still open."
      />
      <template #actions>
        <Dialog v-model:open="open">
          <DialogTrigger as-child>
            <Button size="sm">
              <Plus
                class="size-4"
                aria-hidden="true"
              />
              New project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New project</DialogTitle>
              <DialogDescription>Group related work and the people working on it.</DialogDescription>
            </DialogHeader>
            <DialogBody class="space-y-4 py-1">
              <div class="grid gap-2">
                <Label for="np-name">Name</Label>
                <Input
                  id="np-name"
                  v-model="form.name"
                  placeholder="My new project"
                />
              </div>
              <div class="grid gap-2">
                <Label for="np-slug">URL name</Label>
                <Input
                  id="np-slug"
                  v-model="form.slug"
                  placeholder="my-new-project"
                  @input="slugTouched = true"
                />
                <p class="text-muted-foreground text-xs">
                  Used in the project URL. Lowercase letters, numbers and hyphens.
                </p>
              </div>
              <div class="grid gap-2">
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
                <AlertCircle
                  class="size-4 shrink-0"
                  aria-hidden="true"
                />
                {{ submitError }}
              </div>
            </DialogBody>
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
      </template>
    </PageHeader>

    <PageBody class="space-y-4">
      <EmptyState
        v-if="fetchError"
        :icon="AlertCircle"
        role="alert"
        title="Couldn't load projects"
        description="Something went wrong on our side. Try again in a moment."
      >
        <Button
          size="sm"
          variant="outline"
          class="mt-4"
          @click="refresh()"
        >
          Retry
        </Button>
      </EmptyState>

      <div
        v-else-if="pending"
        class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        aria-busy="true"
      >
        <Skeleton
          v-for="n in 3"
          :key="n"
          class="h-52 rounded-xl"
        />
      </div>

      <EmptyState
        v-else-if="!projects.length"
        :icon="FolderPlus"
        :title="t('projects.empty.title')"
        :description="t('projects.empty.description')"
      >
        <Button
          size="sm"
          class="mt-4"
          @click="open = true"
        >
          <Plus
            class="size-4"
            aria-hidden="true"
          />
          {{ t('projects.empty.action') }}
        </Button>
      </EmptyState>

      <template v-else>
        <DemoDataBanner message="Members, status and open tasks are sample values." />
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <NuxtLink
            v-for="p in projects"
            :key="p.id"
            :to="`/projects/${p.slug}`"
            class="group focus-visible:ring-ring/50 rounded-xl outline-none focus-visible:ring-[3px]"
          >
            <Card class="group-hover:border-primary/40 flex h-full flex-col transition-colors">
              <CardHeader>
                <CardTitle class="text-base">
                  {{ p.name }}
                </CardTitle>
                <CardDescription class="line-clamp-2">
                  {{ p.description || 'No description yet.' }}
                </CardDescription>
                <CardAction>
                  <Badge :variant="sampleMeta(p.id).status.variant">
                    {{ sampleMeta(p.id).status.label }}
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardContent class="mt-auto">
                <div class="flex items-center justify-between gap-2">
                  <div class="flex -space-x-2">
                    <Avatar
                      v-for="member in sampleMeta(p.id).members"
                      :key="member"
                      class="ring-card size-8 ring-2"
                      :title="member"
                    >
                      <AvatarFallback class="bg-muted text-muted-foreground text-xs">
                        {{ initials(member) }}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <span class="text-muted-foreground inline-flex items-center gap-1.5 text-xs tabular-nums">
                    <CircleDot
                      class="size-3.5"
                      aria-hidden="true"
                    />
                    {{ sampleMeta(p.id).openTasks }} open
                  </span>
                </div>
              </CardContent>
              <CardFooter class="text-muted-foreground border-t pt-4 text-xs">
                <span>Updated <time :datetime="new Date(p.updatedAt).toISOString()">{{ timeAgo(p.updatedAt) }}</time></span>
              </CardFooter>
            </Card>
          </NuxtLink>

          <button
            type="button"
            class="text-muted-foreground hover:border-primary/40 hover:text-foreground focus-visible:ring-ring/50 flex min-h-52 flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-sm transition-colors outline-none focus-visible:ring-[3px]"
            @click="open = true"
          >
            <FolderPlus
              class="size-5"
              aria-hidden="true"
            />
            New project
          </button>
        </div>
      </template>
    </PageBody>
  </Page>
</template>
