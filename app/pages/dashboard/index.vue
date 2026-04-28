<script setup lang="ts">
import { computed } from 'vue'
import {
  Users, DollarSign, Zap, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  UserPlus, CreditCard, GitBranch, AlertTriangle, CheckCircle2, MessageSquare, ShieldAlert,
  ArrowRight, Sparkles,
} from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LineChart } from '@/components/ui/charts/line-chart'
import { BarChart } from '@/components/ui/charts/bar-chart'
import { AreaChart } from '@/components/ui/charts/area-chart'
import { FunnelChart } from '@/components/ui/charts/funnel-chart'
import { GaugeChart } from '@/components/ui/charts/gauge-chart'
import { TreemapChart } from '@/components/ui/charts/treemap-chart'
import { CalendarHeatmap } from '@/components/ui/charts/calendar-heatmap'
import { Sparkline } from '@/components/ui/charts/sparkline'
import { PieChart } from '@/components/ui/charts/pie-chart'
import { SectionCard } from '@/components/ui/section-card'
import { DataList, DataListItem } from '@/components/ui/data-list'
import { IconBox } from '@/components/ui/icon-box'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Dashboard' })

// ── Mock data ───────────────────────────────────────────────────────────────

const revenueSeries = [
  { month: 'Nov', revenue: 142000, expenses: 98000 },
  { month: 'Dec', revenue: 168000, expenses: 102000 },
  { month: 'Jan', revenue: 184000, expenses: 108000 },
  { month: 'Feb', revenue: 172000, expenses: 112000 },
  { month: 'Mar', revenue: 198000, expenses: 118000 },
  { month: 'Apr', revenue: 224000, expenses: 124000 },
  { month: 'May', revenue: 248000, expenses: 132000 },
]

const requestsHourly = Array.from({ length: 24 }, (_, h) => ({
  hour: `${String(h).padStart(2, '0')}:00`,
  requests: Math.round(800 + Math.sin((h - 6) / 24 * Math.PI * 2) * 500 + Math.random() * 200),
}))

// Stepwise conversion rates: Sign-ups retains 60% of Visitors,
// Activated 40% of Sign-ups, Paid 30% of Activated, Retained 25% of
// Paid. End-to-end = 0.60 * 0.40 * 0.30 * 0.25 = 1.8% of Visitors.
//
// The two bottom stages (Paid, Retained 30d) carry the same `value` as
// Activated so they render at the same trapezoid width -- a deliberate
// "the funnel reaches a floor" look. `realValue` keeps the actual
// count for the label formatter (see funnelOption below).
const funnel = [
  { name: 'Visitors', value: 24850, realValue: 24850 },
  { name: 'Sign-ups', value: 14910, realValue: 14910 },     // 60% of Visitors
  { name: 'Activated', value: 5964, realValue: 5964 },      // 40% of Sign-ups
  { name: 'Paid', value: 5964, realValue: 1789 },           // 30% of Activated
  { name: 'Retained 30d', value: 5964, realValue: 447 },    // 25% of Paid
]

// Custom funnel series so the bottom-three equal-size effect works
// AND the inline labels show the real count rather than the inflated
// visual value. `sort: 'none'` is important -- with three identical
// values ECharts otherwise reshuffles the order.
const funnelOption = {
  series: [{
    type: 'funnel',
    sort: 'none',
    left: '10%',
    right: '10%',
    top: 10,
    bottom: 24,
    gap: 2,
    label: {
      show: true,
      position: 'inside',
      color: '#fff',
      fontSize: 12,
      fontWeight: 600,
      formatter: (p: any) => `${p.name}\n${(p.data?.realValue ?? p.value).toLocaleString()}`,
    },
    labelLine: { length: 8, lineStyle: { width: 1, type: 'solid' } },
    itemStyle: { borderColor: '#fff', borderWidth: 1 },
    emphasis: { label: { fontSize: 13, fontWeight: 700 } },
    data: funnel,
  }],
}

// Top 8 teams visible, the 5 smallest bundled into "Other" so every
// rect is wide enough for a readable label. Total headcount is
// preserved (124 across 13 teams) -- the "Other" bundle's segment
// count is the truth we want in the chart, not just a count.
const rawSegments = [
  { name: 'Backend', value: 22 },
  { name: 'Frontend', value: 18 },
  { name: 'Inside sales', value: 14 },
  { name: 'Field sales', value: 12 },
  { name: 'Customer success', value: 10 },
  { name: 'Marketing', value: 8 },
  { name: 'Support', value: 8 },
  { name: 'Mobile', value: 8 },
  { name: 'Infra', value: 8 },
  { name: 'Sales ops', value: 6 },
  { name: 'People', value: 4 },
  { name: 'Finance', value: 4 },
  { name: 'Design', value: 2 },
]
const segmentsVisibleCount = 8
const segmentsSorted = [...rawSegments].sort((a, b) => b.value - a.value)
const segments = [
  ...segmentsSorted.slice(0, segmentsVisibleCount),
  {
    name: `Other (${segmentsSorted.length - segmentsVisibleCount})`,
    value: segmentsSorted.slice(segmentsVisibleCount).reduce((s, x) => s + x.value, 0),
  },
]
const totalHeadcount = rawSegments.reduce((s, d) => s + d.value, 0)
const totalTeams = rawSegments.length

// Anchor to a fixed date so SSR + client produce identical strings and
// values (Math.random() / new Date() would diverge between renders and
// trigger a hydration text mismatch). Update this baseline whenever
// the demo data is refreshed.
const calendarAnchor = new Date('2026-05-15T00:00:00Z')
function seeded(i: number): number {
  // Cheap deterministic pseudo-random: keeps the heatmap visually busy
  // without importing a seed library.
  const x = Math.sin(i * 9301 + 49297) * 233280
  return x - Math.floor(x)
}
const calendarData: [string, number][] = Array.from({ length: 365 }, (_, i) => {
  const d = new Date(calendarAnchor)
  d.setUTCDate(calendarAnchor.getUTCDate() - i)
  const iso = d.toISOString().slice(0, 10)
  const dow = d.getUTCDay()
  const base = (dow === 0 || dow === 6) ? 0 : 3
  const recent = i < 60 ? 4 : 0
  return [iso, Math.max(0, Math.round(base + recent + (seeded(i) - 0.3) * 6))]
})
const calendarRange: [string, string] = [
  new Date(calendarAnchor.getTime() - 364 * 86400_000).toISOString().slice(0, 10),
  calendarAnchor.toISOString().slice(0, 10),
]

const topProducts = [
  { name: 'API · Pro tier', mrr: 48200, change: '+12.4%', up: true },
  { name: 'Workspace · Team', mrr: 36400, change: '+8.1%', up: true },
  { name: 'Batch endpoint', mrr: 14800, change: '+22.0%', up: true },
  { name: 'Workspace · Enterprise', mrr: 12200, change: '+3.8%', up: true },
  { name: 'API · Hobby', mrr: 4100, change: '-2.4%', up: false },
]

const alerts = [
  { icon: ShieldAlert, tone: 'text-rose-500', title: 'Quantum rate-limit p99 breached', detail: '3,420/min vs 3,000 cap. 4 customers throttled.', age: '7m ago' },
  { icon: AlertTriangle, tone: 'text-amber-500', title: 'Background workers degraded', detail: 'p95 412ms over last 8m. eu-west region only.', age: '38m ago' },
  { icon: CheckCircle2, tone: 'text-emerald-500', title: 'Deploy succeeded on main', detail: 'commit 4e8a91c — Dashboard reset.', age: '1h ago' },
]

const topCustomers = [
  { name: 'Northwind Industries', plan: 'Enterprise', mrr: 4800, status: 'healthy', avatar: 'NI' },
  { name: 'Sentinel Labs', plan: 'Enterprise', mrr: 3600, status: 'healthy', avatar: 'SL' },
  { name: 'Apex Logistics', plan: 'Pro', mrr: 1200, status: 'at-risk', avatar: 'AL' },
  { name: 'Olympus Robotics', plan: 'Enterprise', mrr: 5200, status: 'healthy', avatar: 'OR' },
  { name: 'Crescent Health', plan: 'Pro', mrr: 1800, status: 'healthy', avatar: 'CH' },
  { name: 'Polaris Software', plan: 'Pro', mrr: 980, status: 'healthy', avatar: 'PS' },
]

// Strip every bit of chrome (axes, grid, tooltip, legend) so a chart
// fits inside a ~36-44px tall KPI tile without competing with the big
// number above it. CAREFUL: never include a `series` key here -- the
// chart wrappers spread the option prop at the END of their computed
// option object, so a stub series would clobber the data-bound series
// and you'd see an empty chart. Series-shape tweaks would belong in
// the chart components themselves, not in consumer options.
const miniChrome = {
  grid: { left: 0, right: 0, top: 2, bottom: 2, containLabel: false },
  xAxis: { show: false, axisLine: { show: false }, axisLabel: { show: false }, axisTick: { show: false }, splitLine: { show: false } },
  yAxis: { show: false, axisLine: { show: false }, axisLabel: { show: false }, axisTick: { show: false }, splitLine: { show: false } },
  tooltip: { show: false },
  legend: { show: false },
}

const activeUsersDaily = [8400, 9200, 9800, 10400, 11200, 11800, 12847]
const requestsTrend = [1800, 2100, 2300, 2200, 2400, 2350, 2484]
const conversionTrend = [5.8, 6.1, 6.4, 6.8, 7.0, 7.2, 7.4]
const latencyTrend = [380, 395, 410, 402, 418, 405, 412]
const churnRetentionPie = [
  { name: 'Retained', value: 98.2 },
  { name: 'Churned', value: 1.8 },
]

const totalMrr = computed(() => topProducts.reduce((s, p) => s + p.mrr, 0))
const formatK = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)

const statusTone: Record<string, string> = {
  healthy: 'bg-emerald-500',
  'at-risk': 'bg-amber-500',
  churned: 'bg-rose-500',
}
</script>

<template>
  <div class="space-y-4">
    <!-- Header row: title + range tabs + CTA -->
    <header class="flex items-end justify-between gap-4">
      <div class="space-y-1">
        <h1 class="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p class="text-muted-foreground text-sm">Real-time overview of revenue, traffic, and operations.</p>
      </div>
      <div class="flex items-center gap-2">
        <Tabs default-value="30d">
          <TabsList class="h-8">
            <TabsTrigger value="24h" class="h-6 text-xs">24h</TabsTrigger>
            <TabsTrigger value="7d" class="h-6 text-xs">7d</TabsTrigger>
            <TabsTrigger value="30d" class="h-6 text-xs">30d</TabsTrigger>
            <TabsTrigger value="qtd" class="h-6 text-xs">QTD</TabsTrigger>
            <TabsTrigger value="ytd" class="h-6 text-xs">YTD</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button size="sm" class="gap-1.5"><Sparkles class="size-3.5" />Insights</Button>
      </div>
    </header>

    <!-- KPI strip: 6 tiles, each with a different mini-chart shape so the
         row reads as variety instead of "six identical sparklines". -->
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <!-- MRR: smooth line sparkline (revenue trend) -->
      <Card>
        <CardHeader class="pb-2"><CardDescription class="text-[10px] uppercase tracking-wider flex items-center justify-between">MRR <DollarSign class="size-3 text-emerald-600" /></CardDescription></CardHeader>
        <CardContent class="pb-3">
          <div class="flex items-baseline gap-1.5"><span class="text-xl font-semibold tabular-nums">${{ formatK(totalMrr) }}</span><span class="text-emerald-600 text-[11px] font-medium">+12.4%</span></div>
          <Sparkline :data="revenueSeries.map(d => d.revenue)" :height="36" class="mt-1.5" />
        </CardContent>
      </Card>

      <!-- Active users: mini bar chart (count over time) -->
      <Card>
        <CardHeader class="pb-2"><CardDescription class="text-[10px] uppercase tracking-wider flex items-center justify-between">Active users <Users class="size-3 text-blue-600" /></CardDescription></CardHeader>
        <CardContent class="pb-3">
          <div class="flex items-baseline gap-1.5"><span class="text-xl font-semibold tabular-nums">12,847</span><span class="text-emerald-600 text-[11px] font-medium">+8.1%</span></div>
          <BarChart :data="activeUsersDaily.map((v, i) => ({ x: i, y: v }))" :height="36" :option="miniChrome" class="mt-1.5" />
        </CardContent>
      </Card>

      <!-- Requests / min: filled area (volume) -->
      <Card>
        <CardHeader class="pb-2"><CardDescription class="text-[10px] uppercase tracking-wider flex items-center justify-between">Requests / min <Zap class="size-3 text-amber-600" /></CardDescription></CardHeader>
        <CardContent class="pb-3">
          <div class="flex items-baseline gap-1.5"><span class="text-xl font-semibold tabular-nums">2,484</span><span class="text-emerald-600 text-[11px] font-medium">+4.2%</span></div>
          <AreaChart :data="requestsTrend.map((v, i) => ({ x: i, y: v }))" :height="36" :option="miniChrome" class="mt-1.5" />
        </CardContent>
      </Card>

      <!-- Conversion: mini BarChart (weekly conversion %) -->
      <Card>
        <CardHeader class="pb-2"><CardDescription class="text-[10px] uppercase tracking-wider flex items-center justify-between">Conversion <TrendingUp class="size-3 text-violet-600" /></CardDescription></CardHeader>
        <CardContent class="pb-3">
          <div class="flex items-baseline gap-1.5"><span class="text-xl font-semibold tabular-nums">7.4%</span><span class="text-emerald-600 text-[11px] font-medium">+0.6pp</span></div>
          <BarChart :data="conversionTrend.map((v, i) => ({ x: i, y: v }))" :height="36" :option="miniChrome" class="mt-1.5" />
        </CardContent>
      </Card>

      <!-- Avg latency: AreaChart with rose tint (visual cue for "rising is bad") -->
      <Card>
        <CardHeader class="pb-2"><CardDescription class="text-[10px] uppercase tracking-wider flex items-center justify-between">Avg latency <Zap class="size-3 text-rose-600" /></CardDescription></CardHeader>
        <CardContent class="pb-3">
          <div class="flex items-baseline gap-1.5"><span class="text-xl font-semibold tabular-nums">412ms</span><span class="text-rose-600 text-[11px] font-medium">+18ms</span></div>
          <AreaChart :data="latencyTrend.map((v, i) => ({ x: i, y: v }))" :height="36" :option="miniChrome" class="mt-1.5" />
        </CardContent>
      </Card>

      <!-- Churn: horizontal Progress bar (% of accounts churning this month) -->
      <Card>
        <CardHeader class="pb-2"><CardDescription class="text-[10px] uppercase tracking-wider flex items-center justify-between">Churn <TrendingDown class="size-3 text-emerald-600" /></CardDescription></CardHeader>
        <CardContent class="space-y-2 pb-3">
          <div class="flex items-baseline gap-1.5"><span class="text-xl font-semibold tabular-nums">1.8%</span><span class="text-emerald-600 text-[11px] font-medium">-0.3pp</span></div>
          <div class="space-y-1 pt-1">
            <Progress :model-value="98.2" class="h-1.5" />
            <div class="flex justify-between text-[9px] text-muted-foreground tabular-nums">
              <span>Retained 98.2%</span>
              <span>Target 99%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Charts row 1: revenue line (wide) + funnel + gauge -->
    <div class="grid gap-3 lg:grid-cols-6">
      <Card class="lg:col-span-2">
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-3">
          <div>
            <CardTitle class="text-sm">Revenue vs expenses</CardTitle>
            <CardDescription class="text-xs">Last 7 months · in USD</CardDescription>
          </div>
          <Badge variant="outline" class="text-[10px]">May +12.4%</Badge>
        </CardHeader>
        <CardContent class="pb-3">
          <LineChart :data="revenueSeries" x-field="month" :y-field="['revenue', 'expenses']" :height="300" />
        </CardContent>
      </Card>
      <Card class="lg:col-span-2">
        <CardHeader class="pb-3">
          <CardTitle class="text-sm">Conversion funnel</CardTitle>
          <CardDescription class="text-xs">Last 30 days · 1.8% end-to-end (60% → 40% → 30% → 25%)</CardDescription>
        </CardHeader>
        <CardContent class="pb-3">
          <FunnelChart :data="funnel" :height="300" :option="funnelOption" />
        </CardContent>
      </Card>
      <Card class="lg:col-span-2">
        <CardHeader class="pb-3">
          <CardTitle class="text-sm">Quota</CardTitle>
          <CardDescription class="text-xs">API · monthly</CardDescription>
        </CardHeader>
        <CardContent class="pb-2">
          <GaugeChart :value="68" unit="%" :height="300" />
        </CardContent>
      </Card>
    </div>

    <!-- Charts row 2: bar chart + treemap + alerts list -->
    <div class="grid gap-3 lg:grid-cols-6">
      <Card class="lg:col-span-2">
        <CardHeader class="pb-3">
          <CardTitle class="text-sm">Requests by hour</CardTitle>
          <CardDescription class="text-xs">Today · UTC</CardDescription>
        </CardHeader>
        <CardContent class="pb-3">
          <BarChart :data="requestsHourly" x-field="hour" y-field="requests" :height="200" />
        </CardContent>
      </Card>
      <Card class="lg:col-span-2">
        <CardHeader class="pb-3">
          <CardTitle class="text-sm">Headcount by team</CardTitle>
          <CardDescription class="text-xs">{{ totalHeadcount }} people across {{ totalTeams }} teams · top {{ segmentsVisibleCount }} shown</CardDescription>
        </CardHeader>
        <CardContent class="pb-3">
          <TreemapChart :data="segments" :height="200" />
        </CardContent>
      </Card>
      <Card class="lg:col-span-2">
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-3">
          <div><CardTitle class="text-sm">Active alerts</CardTitle><CardDescription class="text-xs">3 open · 12 resolved today</CardDescription></div>
          <Button variant="ghost" size="sm" class="text-xs gap-1 h-7">All<ArrowRight class="size-3" /></Button>
        </CardHeader>
        <CardContent class="space-y-2.5 pb-3">
          <div v-for="(a, i) in alerts" :key="i" class="flex items-start gap-2.5 border-l-2 border-muted pl-2.5">
            <component :is="a.icon" :class="['mt-0.5 size-3.5 shrink-0', a.tone]" />
            <div class="min-w-0 flex-1 space-y-0.5">
              <p class="truncate text-[13px] font-medium">{{ a.title }}</p>
              <p class="text-muted-foreground line-clamp-1 text-[11px]">{{ a.detail }}</p>
              <p class="text-muted-foreground/70 text-[10px]">{{ a.age }}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Calendar heatmap (full width, dense) -->
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle class="text-sm">Deploy activity · last 365 days</CardTitle>
          <CardDescription class="text-xs">{{ calendarData.reduce((s, [, v]) => s + v, 0).toLocaleString() }} deploys · longest streak 18 days</CardDescription>
        </div>
        <div class="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span>Less</span>
          <div class="flex gap-0.5">
            <span class="size-2.5 rounded-sm bg-muted" />
            <span class="size-2.5 rounded-sm bg-amber-200" />
            <span class="size-2.5 rounded-sm bg-amber-400" />
            <span class="size-2.5 rounded-sm bg-amber-600" />
            <span class="size-2.5 rounded-sm bg-amber-800" />
          </div>
          <span>More</span>
        </div>
      </CardHeader>
      <CardContent class="pb-3">
        <CalendarHeatmap :data="calendarData" :range="calendarRange" :height="160" />
      </CardContent>
    </Card>

    <!-- Bottom row: top products table + customer list + recent activity -->
    <div class="grid gap-3 lg:grid-cols-6">
      <Card class="lg:col-span-2">
        <CardHeader class="pb-3">
          <CardTitle class="text-sm">Top products by MRR</CardTitle>
          <CardDescription class="text-xs">5 products · ${{ formatK(totalMrr) }} total</CardDescription>
        </CardHeader>
        <CardContent class="space-y-3 pb-3">
          <div v-for="p in topProducts" :key="p.name" class="space-y-1">
            <div class="flex items-baseline justify-between gap-3">
              <span class="truncate text-[13px] font-medium">{{ p.name }}</span>
              <div class="flex items-baseline gap-1.5">
                <span class="text-[13px] tabular-nums">${{ formatK(p.mrr) }}</span>
                <span :class="['text-[10px] font-medium', p.up ? 'text-emerald-600' : 'text-rose-600']">
                  <component :is="p.up ? ArrowUpRight : ArrowDownRight" class="inline size-3" />{{ p.change }}
                </span>
              </div>
            </div>
            <Progress :model-value="(p.mrr / totalMrr) * 100" class="h-1" />
          </div>
        </CardContent>
      </Card>

      <Card class="lg:col-span-2">
        <CardHeader class="pb-3">
          <CardTitle class="text-sm">Top customers</CardTitle>
          <CardDescription class="text-xs">By MRR · 6 of 142 accounts</CardDescription>
        </CardHeader>
        <CardContent class="divide-y pb-1">
          <div v-for="c in topCustomers" :key="c.name" class="flex items-center gap-2.5 py-2 first:pt-0 last:pb-0">
            <Avatar class="size-7"><AvatarFallback class="bg-primary/10 text-primary text-[10px] font-semibold">{{ c.avatar }}</AvatarFallback></Avatar>
            <div class="min-w-0 flex-1">
              <p class="truncate text-[13px] font-medium">{{ c.name }}</p>
              <p class="text-muted-foreground text-[10px]">{{ c.plan }} · <span :class="['inline-block size-1.5 rounded-full', statusTone[c.status]]" /> {{ c.status }}</p>
            </div>
            <span class="text-[12px] tabular-nums whitespace-nowrap">${{ formatK(c.mrr) }}</span>
          </div>
        </CardContent>
      </Card>

      <SectionCard title="Recent activity" description="Live feed across products" class="lg:col-span-2">
        <DataList>
          <DataListItem>
            <div class="flex items-center gap-2.5">
              <IconBox :icon="UserPlus" variant="muted" icon-class="text-emerald-500" />
              <div><p class="text-[13px] font-medium">Olive Park accepted invite</p><p class="text-muted-foreground text-[11px]">Joined Acme Inc as Member</p></div>
            </div>
            <span class="text-muted-foreground ml-3 text-[11px] whitespace-nowrap">2m ago</span>
          </DataListItem>
          <DataListItem>
            <div class="flex items-center gap-2.5">
              <IconBox :icon="CreditCard" variant="muted" icon-class="text-primary" />
              <div><p class="text-[13px] font-medium">Northwind paid INV-2031</p><p class="text-muted-foreground text-[11px]">$2,400 via Visa ··4242</p></div>
            </div>
            <span class="text-muted-foreground ml-3 text-[11px] whitespace-nowrap">47m ago</span>
          </DataListItem>
          <DataListItem>
            <div class="flex items-center gap-2.5">
              <IconBox :icon="GitBranch" variant="muted" icon-class="text-blue-500" />
              <div><p class="text-[13px] font-medium">Deploy succeeded on main</p><p class="text-muted-foreground text-[11px]">commit 4e8a91c — Dashboard reset</p></div>
            </div>
            <span class="text-muted-foreground ml-3 text-[11px] whitespace-nowrap">1h ago</span>
          </DataListItem>
          <DataListItem>
            <div class="flex items-center gap-2.5">
              <IconBox :icon="AlertTriangle" variant="muted" icon-class="text-amber-500" />
              <div><p class="text-[13px] font-medium">Background workers degraded</p><p class="text-muted-foreground text-[11px]">p95 412ms over last 8m</p></div>
            </div>
            <span class="text-muted-foreground ml-3 text-[11px] whitespace-nowrap">3h ago</span>
          </DataListItem>
          <DataListItem>
            <div class="flex items-center gap-2.5">
              <IconBox :icon="MessageSquare" variant="muted" icon-class="text-violet-500" />
              <div><p class="text-[13px] font-medium">Sentinel Labs left feedback</p><p class="text-muted-foreground text-[11px]">"Streaming citations are a game-changer"</p></div>
            </div>
            <span class="text-muted-foreground ml-3 text-[11px] whitespace-nowrap">5h ago</span>
          </DataListItem>
          <DataListItem>
            <div class="flex items-center gap-2.5">
              <IconBox :icon="CheckCircle2" variant="muted" icon-class="text-emerald-500" />
              <div><p class="text-[13px] font-medium">Daily report sent to ops@acme.com</p><p class="text-muted-foreground text-[11px]">37 tasks closed, 12 opened</p></div>
            </div>
            <span class="text-muted-foreground ml-3 text-[11px] whitespace-nowrap">Yesterday</span>
          </DataListItem>
        </DataList>
      </SectionCard>
    </div>
  </div>
</template>
