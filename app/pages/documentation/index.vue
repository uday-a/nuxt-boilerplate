<script setup lang="ts">
import { BookOpen, Rocket, GraduationCap, FileClock, ArrowRight, Search } from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Documentation' })

const sections = [
  { slug: 'introduction', icon: BookOpen, title: 'Introduction', description: 'What this is, why it exists, who it\'s for.', count: 6 },
  { slug: 'get-started', icon: Rocket, title: 'Get started', description: 'Install, configure, and ship your first integration in 10 minutes.', count: 8 },
  { slug: 'tutorials', icon: GraduationCap, title: 'Tutorials', description: 'Step-by-step walkthroughs for common use cases.', count: 14 },
  { slug: 'changelog', icon: FileClock, title: 'Changelog', description: 'Every model release, every API change, dated and signed.', count: 47 },
]

const recent = [
  { slug: 'tutorials/streaming-with-suspense', title: 'Streaming responses with Vue Suspense', section: 'Tutorials', updated: '2026-05-13' },
  { slug: 'get-started/installation', title: 'Installation', section: 'Get started', updated: '2026-05-12' },
  { slug: 'changelog/2026-05', title: 'May 2026 release notes', section: 'Changelog', updated: '2026-05-09' },
  { slug: 'introduction/concepts', title: 'Core concepts: sessions, contexts, tools', section: 'Introduction', updated: '2026-05-07' },
  { slug: 'tutorials/tool-use-multi-step', title: 'Multi-step tool use with confirmation gates', section: 'Tutorials', updated: '2026-05-05' },
]
</script>

<template>
  <div class="space-y-8">
    <header class="space-y-3">
      <div class="space-y-1">
        <h1 class="text-2xl font-semibold tracking-tight">Documentation</h1>
        <p class="text-muted-foreground text-sm">Everything you need to integrate, deploy, and operate the platform.</p>
      </div>
      <div class="relative max-w-xl">
        <Search class="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input placeholder="Search 75 pages…" class="h-10 pl-10" />
      </div>
    </header>

    <div class="grid gap-4 sm:grid-cols-2">
      <NuxtLink v-for="s in sections" :key="s.slug" :to="`/documentation/${s.slug}`" class="group block">
        <Card class="hover:border-foreground/20 h-full transition-colors">
          <CardHeader>
            <div class="flex items-start justify-between gap-3">
              <div class="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
                <component :is="s.icon" class="size-5" />
              </div>
              <Badge variant="secondary" class="text-[10px]">{{ s.count }} pages</Badge>
            </div>
            <CardTitle class="text-base flex items-center justify-between gap-2 pt-3">
              {{ s.title }}
              <ArrowRight class="text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 size-4 transition-transform" />
            </CardTitle>
            <CardDescription>{{ s.description }}</CardDescription>
          </CardHeader>
        </Card>
      </NuxtLink>
    </div>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">Recently updated</CardTitle>
        <CardDescription>Five most-recently-edited pages across all sections.</CardDescription>
      </CardHeader>
      <CardContent class="divide-y">
        <NuxtLink v-for="r in recent" :key="r.slug" :to="`/documentation/${r.slug.split('/')[0]}`" class="hover:bg-muted/40 -mx-2 flex items-center justify-between gap-4 rounded px-2 py-2.5 transition-colors">
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium">{{ r.title }}</p>
            <p class="text-muted-foreground text-xs">{{ r.section }}</p>
          </div>
          <span class="text-muted-foreground shrink-0 text-xs tabular-nums">{{ r.updated }}</span>
        </NuxtLink>
      </CardContent>
    </Card>
  </div>
</template>
