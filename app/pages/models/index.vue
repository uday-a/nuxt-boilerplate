<script setup lang="ts">
import { Sparkles, Telescope, Atom, Bot, BookOpen, Code, Image, MessageSquare, ArrowRight } from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Models' })

const models = [
  {
    slug: 'genesis',
    name: 'Genesis',
    tagline: 'Workhorse model for everyday tasks.',
    icon: Bot,
    accent: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    context: '128K',
    latency: '~400ms',
    capabilities: ['Text generation', 'Code', 'Tool use', 'Vision'],
    span: 'lg:col-span-2',
    description: 'Balanced speed and quality. Strong at code generation, JSON-structured output, and tool-call planning. Default choice for most workflows.',
  },
  {
    slug: 'explorer',
    name: 'Explorer',
    tagline: 'Long-context reasoning.',
    icon: Telescope,
    accent: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    context: '1M',
    latency: '~1.2s',
    capabilities: ['Long docs', 'Multi-file code', 'Citation', 'Research'],
    span: '',
    description: 'Million-token context window. Built for codebase Q&A, legal document analysis, and multi-source synthesis.',
  },
  {
    slug: 'quantum',
    name: 'Quantum',
    tagline: 'Lightning-fast classifier.',
    icon: Atom,
    accent: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    context: '32K',
    latency: '~80ms',
    capabilities: ['Classification', 'Routing', 'Extraction', 'Embedding'],
    span: '',
    description: 'Optimised for high-throughput, low-latency calls. Ideal for ticket routing, spam filtering, structured data extraction.',
  },
]

const useCases = [
  { icon: Code, label: 'Code generation', model: 'Genesis' },
  { icon: BookOpen, label: 'Document Q&A', model: 'Explorer' },
  { icon: MessageSquare, label: 'Customer support', model: 'Quantum' },
  { icon: Image, label: 'Image description', model: 'Genesis' },
]
</script>

<template>
  <div class="space-y-8">
    <header class="space-y-1">
      <h1 class="text-2xl font-semibold tracking-tight">Models</h1>
      <p class="text-muted-foreground text-sm">Three families, one API. Choose the one whose tradeoffs fit your workload.</p>
    </header>

    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <NuxtLink v-for="m in models" :key="m.slug" :to="`/models/${m.slug}`" :class="['group block', m.span]">
        <Card class="hover:border-foreground/20 h-full transition-colors">
          <CardHeader class="space-y-3">
            <div :class="['flex size-10 items-center justify-center rounded-lg', m.accent]">
              <component :is="m.icon" class="size-5" />
            </div>
            <div class="space-y-1">
              <CardTitle class="text-lg flex items-center justify-between gap-2">
                {{ m.name }}
                <ArrowRight class="text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 size-4 transition-transform" />
              </CardTitle>
              <CardDescription>{{ m.tagline }}</CardDescription>
            </div>
          </CardHeader>
          <CardContent class="space-y-3">
            <p class="text-muted-foreground text-sm leading-relaxed">{{ m.description }}</p>
            <div class="flex items-center gap-4 text-xs">
              <div class="space-y-0.5">
                <p class="text-muted-foreground uppercase tracking-wider text-[10px]">Context</p>
                <p class="font-semibold tabular-nums">{{ m.context }}</p>
              </div>
              <div class="space-y-0.5">
                <p class="text-muted-foreground uppercase tracking-wider text-[10px]">Latency</p>
                <p class="font-semibold tabular-nums">{{ m.latency }}</p>
              </div>
            </div>
            <div class="flex flex-wrap gap-1">
              <Badge v-for="cap in m.capabilities" :key="cap" variant="secondary" class="text-[10px]">{{ cap }}</Badge>
            </div>
          </CardContent>
        </Card>
      </NuxtLink>
    </div>

    <Card>
      <CardHeader>
        <CardTitle class="text-base flex items-center gap-2"><Sparkles class="text-amber-500 size-4" /> Pick by use case</CardTitle>
        <CardDescription>Rule-of-thumb recommendations based on what you're building.</CardDescription>
      </CardHeader>
      <CardContent class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="u in useCases" :key="u.label" class="bg-muted/40 flex items-center gap-3 rounded-lg border p-3">
          <component :is="u.icon" class="text-muted-foreground size-4 shrink-0" />
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium">{{ u.label }}</p>
            <p class="text-muted-foreground text-xs">Use {{ u.model }}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
