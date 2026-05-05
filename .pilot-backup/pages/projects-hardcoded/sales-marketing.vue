<script setup lang="ts">
import { Hash, TrendingUp, Target, Megaphone, MailOpen, Users, DollarSign } from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Sales & Marketing · Projects' })

const kpis = [
  { label: 'New ARR (MTD)', value: '$48.2k', delta: '+12.4%', icon: DollarSign, tone: 'text-emerald-600' },
  { label: 'Pipeline value', value: '$312k', delta: '+$28k', icon: Target, tone: 'text-blue-600' },
  { label: 'MQLs this week', value: '127', delta: '-8 vs last', icon: Users, tone: 'text-amber-600' },
  { label: 'Email open rate', value: '34.7%', delta: '+2.1pp', icon: MailOpen, tone: 'text-violet-600' },
]

const funnel = [
  { stage: 'Visitor', count: 24850, conversion: '100%' },
  { stage: 'Signup', count: 1842, conversion: '7.4%' },
  { stage: 'Activated', count: 920, conversion: '50.0%' },
  { stage: 'Qualified lead', count: 312, conversion: '33.9%' },
  { stage: 'Opportunity', count: 84, conversion: '26.9%' },
  { stage: 'Closed won', count: 21, conversion: '25.0%' },
]

const campaigns = [
  { name: 'Q2 onboarding sequence', channel: 'Email', status: 'live', sent: 12480, openRate: 38.2, ctr: 8.4, attributed: '$24.8k' },
  { name: 'Vue/Nuxt sponsorship week', channel: 'Sponsorship', status: 'live', sent: 0, openRate: 0, ctr: 0, attributed: '$8.4k' },
  { name: 'Free tier comparison guide', channel: 'Content', status: 'live', sent: 0, openRate: 0, ctr: 0, attributed: '$12.1k' },
  { name: 'May product update', channel: 'Email', status: 'paused', sent: 14210, openRate: 31.4, ctr: 6.1, attributed: '$3.2k' },
  { name: 'X (Twitter) thread series', channel: 'Social', status: 'live', sent: 0, openRate: 0, ctr: 0, attributed: '$1.8k' },
]

const deals = [
  { account: 'Northwind Industries', amount: '$48k', stage: 'Negotiation', owner: 'Marcus Rivera', close: '2026-05-28' },
  { account: 'Apex Logistics', amount: '$24k', stage: 'Proposal', owner: 'Alice Chen', close: '2026-06-03' },
  { account: 'Sentinel Labs', amount: '$72k', stage: 'Negotiation', owner: 'Marcus Rivera', close: '2026-06-10' },
  { account: 'Crescent Health', amount: '$36k', stage: 'Discovery', owner: 'Eva Johnson', close: '2026-06-24' },
  { account: 'Olympus Robotics', amount: '$120k', stage: 'Negotiation', owner: 'Marcus Rivera', close: '2026-06-30' },
]

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  live: 'default',
  paused: 'secondary',
}
</script>

<template>
  <div class="space-y-6">
    <header class="space-y-2">
      <div class="flex items-center gap-2">
        <Hash class="text-muted-foreground size-4" />
        <h1 class="text-2xl font-semibold tracking-tight">Sales & Marketing</h1>
      </div>
      <p class="text-muted-foreground text-sm">Pipeline, campaign attribution, and conversion-funnel health.</p>
    </header>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card v-for="k in kpis" :key="k.label">
        <CardHeader class="flex flex-row items-start justify-between space-y-0 pb-2">
          <CardDescription class="text-xs uppercase tracking-wider">{{ k.label }}</CardDescription>
          <component :is="k.icon" :class="['size-4', k.tone]" />
        </CardHeader>
        <CardContent>
          <p class="text-2xl font-semibold tabular-nums">{{ k.value }}</p>
          <p class="text-emerald-600 dark:text-emerald-400 text-xs font-medium">{{ k.delta }}</p>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle class="text-base flex items-center gap-2"><TrendingUp class="size-4" /> Conversion funnel</CardTitle>
        <CardDescription>Last 30 days. Each bar scaled to the visitor count at the top.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        <div v-for="f in funnel" :key="f.stage" class="space-y-1.5">
          <div class="flex items-baseline justify-between gap-3">
            <span class="text-sm font-medium">{{ f.stage }}</span>
            <span class="text-muted-foreground text-xs tabular-nums">{{ f.count.toLocaleString() }} <span class="text-foreground">({{ f.conversion }})</span></span>
          </div>
          <div class="bg-muted h-3 overflow-hidden rounded">
            <div class="bg-primary h-full rounded transition-all" :style="{ width: (f.count / 24850 * 100) + '%' }" />
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="text-base flex items-center gap-2"><Megaphone class="size-4" /> Active campaigns</CardTitle>
      </CardHeader>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Campaign</TableHead>
            <TableHead>Channel</TableHead>
            <TableHead>Status</TableHead>
            <TableHead class="text-right">Sent</TableHead>
            <TableHead class="text-right">Open</TableHead>
            <TableHead class="text-right">CTR</TableHead>
            <TableHead class="text-right">Attributed</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="c in campaigns" :key="c.name">
            <TableCell class="font-medium">{{ c.name }}</TableCell>
            <TableCell><Badge variant="outline" class="text-[10px]">{{ c.channel }}</Badge></TableCell>
            <TableCell><Badge :variant="statusVariant[c.status]" class="text-[10px] capitalize">{{ c.status }}</Badge></TableCell>
            <TableCell class="text-right text-xs tabular-nums">{{ c.sent ? c.sent.toLocaleString() : '—' }}</TableCell>
            <TableCell class="text-right text-xs tabular-nums">{{ c.openRate ? `${c.openRate}%` : '—' }}</TableCell>
            <TableCell class="text-right text-xs tabular-nums">{{ c.ctr ? `${c.ctr}%` : '—' }}</TableCell>
            <TableCell class="text-right text-sm font-medium tabular-nums">{{ c.attributed }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">Open opportunities</CardTitle>
        <CardDescription>Pipeline this quarter, sorted by close date.</CardDescription>
      </CardHeader>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Account</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Close date</TableHead>
            <TableHead class="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="d in deals" :key="d.account">
            <TableCell class="font-medium">{{ d.account }}</TableCell>
            <TableCell><Badge variant="outline" class="text-[10px]">{{ d.stage }}</Badge></TableCell>
            <TableCell class="text-xs">{{ d.owner }}</TableCell>
            <TableCell class="text-muted-foreground text-xs tabular-nums">{{ d.close }}</TableCell>
            <TableCell class="text-right tabular-nums">{{ d.amount }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>
  </div>
</template>
