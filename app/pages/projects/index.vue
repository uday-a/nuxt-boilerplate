<script setup lang="ts">
import { Folder, Plus } from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Projects' })

// Placeholder seed — replace with a real fetch (e.g. /api/projects) when wiring backend.
const projects = [
  { id: 'design-engineering', name: 'Design Engineering', description: 'Frontend platform, design system, UX research.' },
  { id: 'sales-marketing', name: 'Sales & Marketing', description: 'GTM ops, campaigns, pipeline analytics.' },
  { id: 'travel', name: 'Travel', description: 'Trip planning, expense tracking, traveler ops.' },
]
</script>

<template>
  <div class="space-y-6">
    <header class="flex items-start justify-between gap-4">
      <div class="space-y-1">
        <h1 class="text-2xl font-semibold tracking-tight">Projects</h1>
        <p class="text-muted-foreground text-sm">Workspaces grouping related work, members, and assets.</p>
      </div>
      <Button size="sm">
        <Plus class="size-4" />
        New project
      </Button>
    </header>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <NuxtLink v-for="p in projects" :key="p.id" :to="`/projects/${p.id}`" class="group">
        <Card class="h-full transition-colors group-hover:border-foreground/20">
          <CardHeader>
            <div class="flex items-center gap-2">
              <Folder class="text-muted-foreground size-4" />
              <CardTitle class="text-base">{{ p.name }}</CardTitle>
            </div>
            <CardDescription>{{ p.description }}</CardDescription>
          </CardHeader>
          <CardContent>
            <span class="text-muted-foreground text-xs">Open project →</span>
          </CardContent>
        </Card>
      </NuxtLink>
    </div>
  </div>
</template>
