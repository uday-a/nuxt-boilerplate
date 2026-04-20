<script setup lang="ts">
import { Briefcase, CalendarClock, UserCheck, Users } from 'lucide-vue-next'
import { KpiGrid } from '@/components/ui/kpi-grid'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkline, BarChart } from '@/components/ui/charts'
import { Progress } from '@/components/ui/progress'

// Replace these with real data from your API / store / props.
const activeTrend = [110, 111, 113, 114, 115, 115, 116]

const hiresByMonth = [
  { month: 'Dec', count: 4 },
  { month: 'Jan', count: 7 },
  { month: 'Feb', count: 5 },
  { month: 'Mar', count: 9 },
  { month: 'Apr', count: 6 },
  { month: 'May', count: 11 },
]

const departments = [
  { name: 'Engineering', count: 56, pct: 45, color: 'var(--chart-1)' },
  { name: 'Sales', count: 32, pct: 26, color: 'var(--chart-2)' },
  { name: 'Operations', count: 22, pct: 18, color: 'var(--chart-3)' },
  { name: 'Other', count: 14, pct: 11, color: 'var(--chart-4)' },
]
const donutGradient = (() => {
  let acc = 0
  return departments
    .map((d) => {
      const start = acc
      acc += d.pct
      return `${d.color} ${start}% ${acc}%`
    })
    .join(', ')
})()

const leaveTypes = [
  { label: 'Annual leave', used: 8, total: 20, color: 'bg-[var(--chart-1)]' },
  { label: 'Sick leave',   used: 2, total: 10, color: 'bg-[var(--chart-2)]' },
  { label: 'Personal',     used: 5, total: 6,  color: 'bg-[var(--chart-3)]' },
]

const recentHires = [
  { name: 'Maya Tan',    role: 'Senior Engineer', when: '2d ago' },
  { name: 'Diego López', role: 'Sales Lead',      when: '5d ago' },
  { name: 'Aisha Rahman',role: 'Designer',        when: '1w ago' },
]
</script>

<template>
  <KpiGrid :columns="4">
    <!-- Tile 1 — plain KPI (numeric + trend pill) -->
    <Card class="flex flex-col justify-between">
      <CardHeader class="flex flex-row items-center justify-between pb-2">
        <CardTitle class="text-muted-foreground text-xs font-medium tracking-widest uppercase">
          TOTAL EMPLOYEES
        </CardTitle>
        <div class="bg-primary/10 text-primary/70 rounded-lg p-2">
          <Users class="size-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold tracking-tight">124</div>
      </CardContent>
      <div class="flex items-center justify-end gap-1.5 px-6 pb-4 text-xs">
        <span class="inline-flex items-center rounded-full bg-[var(--success)]/10 px-1.5 py-0.5 font-medium text-[var(--success)]">+12</span>
        <span class="text-muted-foreground">this month</span>
      </div>
    </Card>

    <!-- Tile 2 — value + inline sparkline (time-series) -->
    <Card class="flex flex-col justify-between">
      <CardHeader class="flex flex-row items-center justify-between pb-2">
        <CardTitle class="text-muted-foreground text-xs font-medium tracking-widest uppercase">
          ACTIVE
        </CardTitle>
        <div class="bg-primary/10 text-primary/70 rounded-lg p-2">
          <UserCheck class="size-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold tracking-tight">116</div>
        <Sparkline :data="activeTrend" :height="36" class="mt-2" />
      </CardContent>
    </Card>

    <!-- Tile 3 — wider tile with mini bar chart (categorical time-series) -->
    <Card class="md:col-span-2 flex flex-col">
      <CardHeader class="flex flex-row items-center justify-between pb-2">
        <CardTitle class="text-muted-foreground text-xs font-medium tracking-widest uppercase">
          HIRES BY MONTH
        </CardTitle>
        <span class="text-muted-foreground text-xs tabular-nums">42 total</span>
      </CardHeader>
      <CardContent class="pt-0">
        <BarChart
          :data="hiresByMonth"
          x-field="month"
          y-field="count"
          :height="96"
          :option="{
            grid: { left: 28, right: 8, top: 6, bottom: 18 },
            tooltip: { show: false },
            yAxis: { show: false },
            xAxis: { axisTick: { show: false }, axisLine: { show: false } },
          }"
        />
      </CardContent>
    </Card>

    <!-- Tile 4 — conic-gradient donut (composition / categorical share) -->
    <Card class="flex flex-col">
      <CardHeader class="pb-2">
        <CardTitle class="text-muted-foreground text-xs font-medium tracking-widest uppercase">
          BY DEPARTMENT
        </CardTitle>
      </CardHeader>
      <CardContent class="flex items-center gap-4 pt-0">
        <div
          class="relative size-16 shrink-0 rounded-full"
          :style="{ background: `conic-gradient(${donutGradient})` }"
        >
          <div class="bg-card absolute inset-2 rounded-full" />
        </div>
        <ul class="flex-1 space-y-1 text-xs">
          <li v-for="d in departments" :key="d.name" class="flex items-center justify-between">
            <span class="flex items-center gap-1.5">
              <span class="size-2 rounded-sm" :style="{ background: d.color }" />
              {{ d.name }}
            </span>
            <span class="text-muted-foreground tabular-nums">{{ d.count }}</span>
          </li>
        </ul>
      </CardContent>
    </Card>

    <!-- Tile 5 — wider progress-bar stack (capacity / utilisation rows) -->
    <Card class="md:col-span-2 flex flex-col">
      <CardHeader class="flex flex-row items-center justify-between pb-2">
        <CardTitle class="text-muted-foreground text-xs font-medium tracking-widest uppercase">
          LEAVE BALANCE
        </CardTitle>
        <CalendarClock class="text-muted-foreground size-4" />
      </CardHeader>
      <CardContent class="space-y-3 pt-0">
        <div v-for="lt in leaveTypes" :key="lt.label">
          <div class="mb-1 flex items-center justify-between text-xs">
            <span class="font-medium">{{ lt.label }}</span>
            <span class="text-muted-foreground tabular-nums">{{ lt.used }} / {{ lt.total }} days</span>
          </div>
          <Progress :model-value="(lt.used / lt.total) * 100" />
        </div>
      </CardContent>
    </Card>

    <!-- Tile 6 — list (qualitative / event-stream data) -->
    <Card class="flex flex-col">
      <CardHeader class="flex flex-row items-center justify-between pb-2">
        <CardTitle class="text-muted-foreground text-xs font-medium tracking-widest uppercase">
          RECENT HIRES
        </CardTitle>
        <Briefcase class="text-muted-foreground size-4" />
      </CardHeader>
      <CardContent class="pt-0">
        <ul class="space-y-2.5">
          <li v-for="h in recentHires" :key="h.name" class="flex items-center justify-between gap-2">
            <div class="flex min-w-0 flex-col">
              <span class="truncate text-sm font-medium">{{ h.name }}</span>
              <span class="text-muted-foreground truncate text-xs">{{ h.role }}</span>
            </div>
            <span class="text-muted-foreground shrink-0 text-xs">{{ h.when }}</span>
          </li>
        </ul>
      </CardContent>
    </Card>
  </KpiGrid>
</template>
