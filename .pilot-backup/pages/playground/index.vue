<script setup lang="ts">
import { Sparkles, History, Star, Settings as SettingsIcon, ArrowRight, MessageSquare, Zap, Clock, CheckCircle2 } from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Playground' })

const stats = [
  { label: 'Sessions this month', value: '147', delta: '+23%', icon: MessageSquare },
  { label: 'Compute hours', value: '38.2', delta: '+4.1h', icon: Zap },
  { label: 'Avg latency', value: '412ms', delta: '-18ms', icon: Clock },
  { label: 'Success rate', value: '98.7%', delta: '+0.4pp', icon: CheckCircle2 },
]

const pinned = [
  { id: 'p1', title: 'Onboarding email rewriter', model: 'Genesis', updated: '2h ago', preview: 'Rewrite the welcome email to match our latest brand voice. Keep CTA…' },
  { id: 'p2', title: 'Weekly digest generator', model: 'Explorer', updated: 'Yesterday', preview: 'Summarise the last 7 days of issues from the linked project board…' },
  { id: 'p3', title: 'SQL query explainer', model: 'Quantum', updated: '3d ago', preview: 'Given the following SQL, explain the join strategy and likely…' },
  { id: 'p4', title: 'Code review prompt v3', model: 'Genesis', updated: '5d ago', preview: 'You are a staff engineer reviewing a Pull Request. Look for…' },
]

const recent = [
  { id: 'r1', action: 'Ran "Code review prompt v3"', detail: '4,210 tokens, Genesis', time: '14m ago' },
  { id: 'r2', action: 'Starred "SQL query explainer"', detail: 'Added to pins', time: '1h ago' },
  { id: 'r3', action: 'Forked "Weekly digest generator"', detail: 'Copy saved as v2-draft', time: '3h ago' },
  { id: 'r4', action: 'Ran "Onboarding email rewriter"', detail: '892 tokens, Genesis', time: 'Yesterday' },
  { id: 'r5', action: 'Imported prompt from clipboard', detail: 'Untitled-2026-05-13', time: 'Yesterday' },
]
</script>

<template>
  <div class="space-y-6">
    <header class="flex items-end justify-between gap-4">
      <div class="space-y-1">
        <h1 class="text-2xl font-semibold tracking-tight">Playground</h1>
        <p class="text-muted-foreground text-sm">Iterate on prompts, compare models, save what works.</p>
      </div>
      <Button class="gap-2">
        <Sparkles class="size-4" />
        New session
      </Button>
    </header>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card v-for="stat in stats" :key="stat.label">
        <CardHeader class="flex flex-row items-start justify-between space-y-0 pb-2">
          <CardDescription class="text-xs uppercase tracking-wider">{{ stat.label }}</CardDescription>
          <component :is="stat.icon" class="text-muted-foreground size-4" />
        </CardHeader>
        <CardContent>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-semibold tabular-nums">{{ stat.value }}</span>
            <span class="text-emerald-600 dark:text-emerald-400 text-xs font-medium">{{ stat.delta }}</span>
          </div>
        </CardContent>
      </Card>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <Card class="lg:col-span-2">
        <CardHeader class="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle class="text-base flex items-center gap-2"><Star class="text-amber-500 size-4" /> Pinned prompts</CardTitle>
            <CardDescription>Templates you reach for the most.</CardDescription>
          </div>
          <Button variant="ghost" size="sm" class="gap-1 text-xs">
            View all
            <ArrowRight class="size-3" />
          </Button>
        </CardHeader>
        <CardContent class="space-y-3">
          <div v-for="p in pinned" :key="p.id" class="hover:bg-muted/40 group flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors">
            <div class="flex-1 space-y-1">
              <div class="flex items-center gap-2">
                <span class="font-medium text-sm">{{ p.title }}</span>
                <Badge variant="secondary" class="text-[10px]">{{ p.model }}</Badge>
              </div>
              <p class="text-muted-foreground line-clamp-1 text-xs">{{ p.preview }}</p>
            </div>
            <span class="text-muted-foreground/70 shrink-0 text-xs">{{ p.updated }}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="text-base flex items-center gap-2"><History class="size-4" /> Recent activity</CardTitle>
        </CardHeader>
        <CardContent class="space-y-3">
          <div v-for="r in recent" :key="r.id" class="space-y-0.5">
            <p class="text-sm font-medium">{{ r.action }}</p>
            <p class="text-muted-foreground text-xs">{{ r.detail }} · {{ r.time }}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
