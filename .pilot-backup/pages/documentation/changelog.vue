<script setup lang="ts">
import { ArrowLeft, Sparkles, ShieldAlert, Bug, Zap } from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Changelog · Docs' })

const releases = [
  {
    date: '2026-05-13',
    version: 'API v1.18',
    headline: 'Streaming citations + Explorer 2.1',
    items: [
      { kind: 'feature', text: 'Explorer 2.1 ships with improved multi-doc citation accuracy (76% → 84%). No API change required.' },
      { kind: 'feature', text: 'New streaming endpoint /complete/stream-citations returns citation spans incrementally as they\'re resolved.' },
      { kind: 'fix', text: 'Tool-use loop now exits cleanly when the model returns an empty tool array instead of looping for max_tokens.' },
      { kind: 'perf', text: 'p50 latency on Quantum dropped from 110ms → 80ms after a kernel-level change.' },
    ],
  },
  {
    date: '2026-04-22',
    version: 'API v1.17',
    headline: 'Genesis 1.8 + tool-use reliability',
    items: [
      { kind: 'feature', text: 'Genesis 1.8 released. Tool-use call reliability up 12% on internal eval. Vision crop accuracy substantially improved.' },
      { kind: 'feature', text: 'New /sessions/:id/branch endpoint forks a session at the current point. Useful for branching agent flows.' },
      { kind: 'security', text: 'Deprecated header X-API-Token in favour of standard Authorization: Bearer. Old header continues to work through 2026-10-31.' },
    ],
  },
  {
    date: '2026-03-04',
    version: 'API v1.16',
    headline: 'Explorer context expansion',
    items: [
      { kind: 'feature', text: 'Genesis context window expanded 64K → 128K. No price change.' },
      { kind: 'feature', text: 'Batch endpoint now accepts up to 256 prompts per call (was 64). Same per-token price.' },
      { kind: 'fix', text: 'Fixed a race condition where simultaneous tool-call retries could double-charge for the second call.' },
    ],
  },
  {
    date: '2026-02-14',
    version: 'API v1.15',
    headline: 'Explorer 2.0: million-token context',
    items: [
      { kind: 'feature', text: 'Explorer 2.0 ships with a 1M-token context window. Major release; pricing updated.' },
      { kind: 'feature', text: 'New "research mode" tool calls let Explorer plan multi-step reading flows over a context bundle.' },
      { kind: 'perf', text: 'Files API now caches bundle parsing for 24h, cutting context-load latency by ~60% on repeat calls.' },
    ],
  },
  {
    date: '2026-01-19',
    version: 'API v1.14',
    headline: 'JSON mode hardening',
    items: [
      { kind: 'fix', text: 'JSON mode now correctly handles backslash escapes inside string values when the temperature is &gt;1.0.' },
      { kind: 'feature', text: 'Genesis cheaper tier introduced (-30% cost) for prompts under 4K tokens.' },
      { kind: 'security', text: 'Rate-limit headers now include a Retry-After value calibrated to your current bucket. Implement exponential backoff using this value rather than a fixed delay.' },
    ],
  },
  {
    date: '2025-12-15',
    version: 'API v1.13',
    headline: 'Quantum context doubled',
    items: [
      { kind: 'feature', text: 'Quantum context window doubled 16K → 32K.' },
      { kind: 'feature', text: 'New "tiny" preset for high-volume classification (Quantum-tiny). 3× cheaper, classification-only.' },
    ],
  },
]

const iconMap: Record<string, any> = { feature: Sparkles, fix: Bug, perf: Zap, security: ShieldAlert }
const colorMap: Record<string, string> = {
  feature: 'text-emerald-600 dark:text-emerald-400',
  fix: 'text-amber-600 dark:text-amber-400',
  perf: 'text-blue-600 dark:text-blue-400',
  security: 'text-rose-600 dark:text-rose-400',
}
</script>

<template>
  <div class="space-y-6">
    <NuxtLink to="/documentation" class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm">
      <ArrowLeft class="size-3" /> All documentation
    </NuxtLink>

    <header class="space-y-2">
      <p class="text-muted-foreground text-xs uppercase tracking-wider">Changelog</p>
      <h1 class="text-3xl font-semibold tracking-tight">Releases</h1>
      <p class="text-muted-foreground text-base">Every API change, every model release, dated. No deprecations land without a six-month notice.</p>
    </header>

    <div class="relative space-y-6 before:absolute before:bottom-0 before:left-3 before:top-3 before:w-px before:bg-border">
      <Card v-for="r in releases" :key="r.date" class="relative ml-10">
        <span class="bg-primary ring-background absolute -left-[2.4rem] top-7 size-3 rounded-full ring-4" />
        <CardHeader>
          <div class="flex items-baseline justify-between gap-4">
            <div class="space-y-1">
              <CardTitle class="text-base">{{ r.headline }}</CardTitle>
              <CardDescription class="flex items-center gap-2 text-xs">
                <Badge variant="outline" class="text-[10px] font-mono">{{ r.version }}</Badge>
                <span class="tabular-nums">{{ r.date }}</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent class="space-y-2.5">
          <div v-for="(item, i) in r.items" :key="i" class="flex items-start gap-3 text-sm">
            <component :is="iconMap[item.kind]" :class="['mt-0.5 size-4 shrink-0', colorMap[item.kind]]" />
            <span class="text-muted-foreground leading-relaxed" v-html="item.text" />
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
