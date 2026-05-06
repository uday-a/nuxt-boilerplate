<script setup lang="ts">
import { Folder } from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const route = useRoute()
const id = computed(() => String(route.params.id))

// Replace with a real fetch keyed on `id` when wiring backend.
const name = computed(() =>
  id.value.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
)

useHead(() => ({ title: `${name.value} · Projects` }))
</script>

<template>
  <div class="space-y-6">
    <header class="space-y-2">
      <div class="flex items-center gap-2">
        <Folder class="text-muted-foreground size-4" />
        <h1 class="text-2xl font-semibold tracking-tight">
          {{ name }}
        </h1>
      </div>
      <p class="text-muted-foreground text-sm">
        Project workspace · id <code>{{ id }}</code>
      </p>
    </header>

    <div class="grid gap-4 lg:grid-cols-3">
      <Card class="lg:col-span-2">
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>Summary, recent activity, key metrics.</CardDescription>
        </CardHeader>
        <CardContent class="text-muted-foreground text-sm">
          Empty state. Wire project data from <code>/api/projects/{{ id }}</code> when ready.
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardContent class="text-muted-foreground text-sm">
          No members yet.
        </CardContent>
      </Card>
    </div>
  </div>
</template>
