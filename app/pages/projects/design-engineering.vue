<script setup lang="ts">
import { Hash, GitCommit, GitPullRequest, AlertCircle, Users, Clock, ArrowUpRight, Sparkles } from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Design Engineering · Projects' })

const kpis = [
  { label: 'Open PRs', value: '14', trend: '-3 vs last week', icon: GitPullRequest, tone: 'text-emerald-600' },
  { label: 'Issues this sprint', value: '37', trend: '+4 vs last sprint', icon: AlertCircle, tone: 'text-amber-600' },
  { label: 'Commits this week', value: '186', trend: '+12%', icon: GitCommit, tone: 'text-blue-600' },
  { label: 'Sprint velocity', value: '42 pts', trend: '+7 pts', icon: Sparkles, tone: 'text-violet-600' },
]

const sprint = { name: 'Sprint 24', start: '2026-05-05', end: '2026-05-19', completed: 28, total: 42 }

const team = [
  { name: 'Alice Chen', role: 'Lead designer', avail: 'available', color: 'bg-orange-500/15 text-orange-600 dark:text-orange-400' },
  { name: 'Marcus Rivera', role: 'Senior engineer', avail: 'available', color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400' },
  { name: 'Eva Johnson', role: 'Engineer', avail: 'in meeting', color: 'bg-rose-500/15 text-rose-600 dark:text-rose-400' },
  { name: 'David Kim', role: 'Engineer', avail: 'available', color: 'bg-violet-500/15 text-violet-600 dark:text-violet-400' },
  { name: 'Frank Lee', role: 'QA', avail: 'PTO', color: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400' },
]

const recentPrs = [
  { id: '#1284', title: 'Migrate auth middleware to compliance-ready token storage', author: 'Marcus Rivera', status: 'review-requested', age: '2h' },
  { id: '#1283', title: 'Sparkline tooltips show full-precision values on hover', author: 'Alice Chen', status: 'merged', age: '5h' },
  { id: '#1282', title: 'Add dark-mode override for high-contrast accessibility', author: 'David Kim', status: 'review-requested', age: '1d' },
  { id: '#1280', title: 'Replace fetch wrapper with native AbortSignal', author: 'Eva Johnson', status: 'changes-requested', age: '1d' },
  { id: '#1278', title: 'Bump Vite to 7.3, ESM-only deps need updating', author: 'Marcus Rivera', status: 'merged', age: '2d' },
  { id: '#1277', title: 'Component library: KpiGrid columns prop accepts 5+', author: 'Alice Chen', status: 'merged', age: '2d' },
]

const recentActivity = [
  { who: 'Alice Chen', what: 'merged', target: '#1283', detail: 'Sparkline tooltips show full-precision values on hover', time: '5h ago' },
  { who: 'Marcus Rivera', what: 'opened', target: '#1284', detail: 'Migrate auth middleware to compliance-ready token storage', time: '2h ago' },
  { who: 'David Kim', what: 'commented on', target: '#1282', detail: 'Maybe we should land the WCAG AAA tokens as a separate PR?', time: '6h ago' },
  { who: 'Eva Johnson', what: 'pushed 4 commits to', target: 'feature/abort-signal', detail: 'WIP: native AbortSignal in API wrapper', time: '1d ago' },
]

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  merged: 'secondary',
  'review-requested': 'default',
  'changes-requested': 'destructive',
}

const initials = (n: string) => n.split(' ').map((p) => p[0]).join('').toUpperCase()
const sprintPct = Math.round((sprint.completed / sprint.total) * 100)
</script>

<template>
  <div class="space-y-6">
    <header class="space-y-2">
      <div class="flex items-center gap-2">
        <Hash class="text-muted-foreground size-4" />
        <h1 class="text-2xl font-semibold tracking-tight">Design Engineering</h1>
      </div>
      <p class="text-muted-foreground text-sm">Component library, design system tokens, and front-end platform work.</p>
    </header>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card v-for="k in kpis" :key="k.label">
        <CardHeader class="flex flex-row items-start justify-between space-y-0 pb-2">
          <CardDescription class="text-xs uppercase tracking-wider">{{ k.label }}</CardDescription>
          <component :is="k.icon" :class="['size-4', k.tone]" />
        </CardHeader>
        <CardContent>
          <p class="text-2xl font-semibold tabular-nums">{{ k.value }}</p>
          <p class="text-muted-foreground text-xs">{{ k.trend }}</p>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle class="text-base flex items-center justify-between">
          <span>{{ sprint.name }}</span>
          <span class="text-muted-foreground text-xs font-normal tabular-nums">{{ sprint.start }} → {{ sprint.end }}</span>
        </CardTitle>
        <CardDescription>{{ sprint.completed }} of {{ sprint.total }} story points completed ({{ sprintPct }}%).</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="bg-muted h-2.5 overflow-hidden rounded-full">
          <div class="bg-emerald-500 h-full rounded-full transition-all" :style="{ width: sprintPct + '%' }" />
        </div>
      </CardContent>
    </Card>

    <div class="grid gap-6 lg:grid-cols-3">
      <Card class="lg:col-span-2">
        <CardHeader class="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle class="text-base">Recent pull requests</CardTitle>
            <CardDescription>Last 6 PRs across this project.</CardDescription>
          </div>
          <Button variant="ghost" size="sm" class="gap-1 text-xs">All PRs<ArrowUpRight class="size-3" /></Button>
        </CardHeader>
        <CardContent class="divide-y">
          <div v-for="pr in recentPrs" :key="pr.id" class="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
            <div class="min-w-0 flex-1 space-y-1">
              <div class="flex items-center gap-2">
                <span class="text-muted-foreground font-mono text-xs">{{ pr.id }}</span>
                <Badge :variant="statusVariant[pr.status]" class="text-[10px] capitalize">{{ pr.status.replace('-', ' ') }}</Badge>
              </div>
              <p class="text-sm font-medium leading-snug">{{ pr.title }}</p>
              <p class="text-muted-foreground text-xs">by {{ pr.author }} · {{ pr.age }} ago</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="text-base flex items-center gap-2"><Users class="size-4" /> Team</CardTitle>
        </CardHeader>
        <CardContent class="divide-y">
          <div v-for="m in team" :key="m.name" class="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <Avatar class="size-8"><AvatarFallback :class="['text-[10px] font-semibold', m.color]">{{ initials(m.name) }}</AvatarFallback></Avatar>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium">{{ m.name }}</p>
              <p class="text-muted-foreground text-xs">{{ m.role }}</p>
            </div>
            <span :class="['text-xs', m.avail === 'available' ? 'text-emerald-600' : m.avail === 'PTO' ? 'text-rose-600' : 'text-muted-foreground']">{{ m.avail }}</span>
          </div>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle class="text-base flex items-center gap-2"><Clock class="size-4" /> Activity</CardTitle>
      </CardHeader>
      <CardContent class="space-y-3">
        <div v-for="(a, i) in recentActivity" :key="i" class="border-l-2 border-muted pl-3">
          <p class="text-sm">
            <span class="font-medium">{{ a.who }}</span>
            <span class="text-muted-foreground"> {{ a.what }} </span>
            <span class="text-foreground font-medium">{{ a.target }}</span>
          </p>
          <p class="text-muted-foreground line-clamp-1 text-xs">{{ a.detail }}</p>
          <p class="text-muted-foreground/70 text-xs">{{ a.time }}</p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
