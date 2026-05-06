<script setup lang="ts">
import { AlertTriangle, ChevronRight } from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Limits · Settings' })

const quotas = [
  { name: 'Genesis API calls', used: 248_120, limit: 600_000, period: 'this month', risk: 'low' },
  { name: 'Explorer API calls', used: 71_300, limit: 200_000, period: 'this month', risk: 'low' },
  { name: 'Quantum API calls', used: 1_840_000, limit: 3_000_000, period: 'this month', risk: 'medium' },
  { name: 'Batch endpoint requests', used: 2_140, limit: 5_000, period: 'this month', risk: 'low' },
  { name: 'File bundles (active)', used: 47, limit: 50, period: 'workspace total', risk: 'high' },
  { name: 'Compute hours', used: 127.4, limit: 250, period: 'this month', risk: 'medium' },
  { name: 'Storage', used: 38.2, limit: 100, period: 'workspace total', risk: 'low' },
  { name: 'Team seats', used: 8, limit: 25, period: 'workspace total', risk: 'low' },
]

const rateLimits = [
  { endpoint: '/complete', tier: 'Pro', perMinute: 600, burst: 100 },
  { endpoint: '/complete/stream', tier: 'Pro', perMinute: 600, burst: 100 },
  { endpoint: '/complete (Explorer)', tier: 'Pro', perMinute: 200, burst: 50 },
  { endpoint: '/complete (Quantum)', tier: 'Pro', perMinute: 3000, burst: 500 },
  { endpoint: '/batch', tier: 'Pro', perMinute: 10, burst: 5 },
  { endpoint: '/files/upload', tier: 'Pro', perMinute: 60, burst: 20 },
]

const pct = (used: number, limit: number) => Math.min(100, Math.round((used / limit) * 100))
const fmt = (n: number) => n >= 1000 ? n.toLocaleString() : String(n)

const riskClass: Record<string, string> = {
  low: 'bg-primary',
  medium: 'bg-amber-500',
  high: 'bg-rose-500',
}
</script>

<template>
  <div class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-semibold tracking-tight">
        Limits
      </h1>
      <p class="text-muted-foreground text-sm">
        Quotas and rate limits for your workspace. Anything in red needs attention.
      </p>
    </header>

    <Card class="border-rose-500/30 bg-rose-500/5">
      <CardContent class="flex items-start gap-3 py-4">
        <AlertTriangle class="text-rose-500 mt-0.5 size-5 shrink-0" />
        <div class="flex-1 space-y-1">
          <p class="text-sm font-semibold">
            File bundles approaching limit
          </p>
          <p class="text-muted-foreground text-xs">
            47 of 50 active bundles. Archive unused bundles or upgrade to remove the cap.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
        >
          Manage bundles
        </Button>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">
          Quotas
        </CardTitle>
        <CardDescription>Monthly quotas reset on the 1st. Workspace-total quotas don't reset.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-5">
        <div
          v-for="q in quotas"
          :key="q.name"
          class="space-y-2"
        >
          <div class="flex items-baseline justify-between gap-3">
            <div class="flex items-baseline gap-2">
              <span class="text-sm font-medium">{{ q.name }}</span>
              <span class="text-muted-foreground text-xs">{{ q.period }}</span>
            </div>
            <span class="text-muted-foreground text-xs tabular-nums">{{ fmt(q.used) }} / {{ fmt(q.limit) }} <span class="font-medium text-foreground">({{ pct(q.used, q.limit) }}%)</span></span>
          </div>
          <div class="bg-muted h-2 overflow-hidden rounded-full">
            <div
              :class="['h-full rounded-full transition-all', riskClass[q.risk]]"
              :style="{ width: pct(q.used, q.limit) + '%' }"
            />
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">
          Rate limits
        </CardTitle>
        <CardDescription>Per-API-key limits. Multiple keys multiply your effective ceiling.</CardDescription>
      </CardHeader>
      <CardContent class="divide-y">
        <div
          v-for="r in rateLimits"
          :key="r.endpoint"
          class="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
        >
          <div class="space-y-0.5">
            <p class="font-mono text-sm">
              {{ r.endpoint }}
            </p>
            <p class="text-muted-foreground text-xs">
              {{ r.tier }} tier
            </p>
          </div>
          <div class="text-right">
            <p class="text-sm font-medium tabular-nums">
              {{ r.perMinute.toLocaleString() }} <span class="text-muted-foreground font-normal">/ min</span>
            </p>
            <p class="text-muted-foreground text-xs tabular-nums">
              Burst: {{ r.burst }}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card class="hover:bg-muted/40 cursor-pointer transition-colors">
      <CardContent class="flex items-center justify-between gap-4 py-4">
        <div>
          <p class="text-sm font-semibold">
            Need higher limits?
          </p>
          <p class="text-muted-foreground text-xs">
            Enterprise tier lifts all caps and adds dedicated capacity in your region.
          </p>
        </div>
        <ChevronRight class="text-muted-foreground size-4" />
      </CardContent>
    </Card>
  </div>
</template>
