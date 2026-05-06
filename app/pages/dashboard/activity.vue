<script setup lang="ts">
import {
  ChevronLeft, ChevronRight, Flame, TrendingUp, MousePointer2,
  Activity as ActivityIcon, Calendar as CalendarIcon, X, Sparkles, BarChart3,
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Activity' })

// Same composable that powers /dashboard/calendar — different visual treatment.
const {
  today, todayKey,
  cursor, monthLabel, gridDays, weekdays,
  rangeBounds, rangeDayCount, isRange, inRange,
  prevMonth, nextMonth, goToToday, clearRange,
  onCellMouseDown, onCellMouseEnter, endDrag,
} = useMonthGrid()

// Deterministic mock activity ("sessions per day"). Weekdays trend higher;
// hashed noise gives variance without persisted data.
function djb2(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) + s.charCodeAt(i)
  return Math.abs(h)
}
function activityFor(key: string): number {
  const d = dateFromKey(key)
  // Future dates are unknown — return 0.
  if (key > todayKey) return 0
  const dow = d.getDay()
  const base = dow === 0 || dow === 6 ? 5 : 20
  const noise = (djb2(key) % 14) - 6
  return Math.max(0, base + noise)
}

// 5-level intensity → tailwind emerald shades
function intensityClass(n: number): string {
  if (n === 0) return 'bg-muted/40'
  if (n < 5) return 'bg-emerald-500/15'
  if (n < 12) return 'bg-emerald-500/35'
  if (n < 20) return 'bg-emerald-500/60'
  return 'bg-emerald-500/85'
}

const monthCells = computed(() =>
  gridDays.value.map(d => ({
    ...d,
    count: activityFor(d.key),
  })),
)

const monthStats = computed(() => {
  const inMonth = monthCells.value.filter(c => c.inMonth)
  const total = inMonth.reduce((acc, c) => acc + c.count, 0)
  const nonZero = inMonth.filter(c => c.count > 0)
  const peak = inMonth.reduce<{ key: string, count: number } | null>(
    (best, c) => (best === null || c.count > best.count ? { key: c.key, count: c.count } : best),
    null,
  )
  const avg = nonZero.length ? Math.round(total / nonZero.length) : 0

  // Streak: walk back from today counting consecutive days with activity > 0
  let streak = 0
  const cursorDate = dateFromKey(todayKey)
  for (let i = 0; i < 365; i++) {
    const d = new Date(cursorDate)
    d.setDate(cursorDate.getDate() - i)
    if (activityFor(isoDate(d)) > 0) streak++
    else break
  }
  return { total, avg, peak, streak }
})

const rangeStats = computed(() => {
  const { lo, hi } = rangeBounds.value
  const cells: { key: string, count: number }[] = []
  const start = dateFromKey(lo)
  const days = rangeDayCount.value
  for (let i = 0; i < days; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i)
    const key = isoDate(d)
    cells.push({ key, count: activityFor(key) })
  }
  const total = cells.reduce((a, c) => a + c.count, 0)
  const active = cells.filter(c => c.count > 0).length
  const avg = days > 0 ? Math.round(total / days) : 0
  return { total, avg, active, cells }
})

function fmtKey(key: string) {
  return dateFromKey(key).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}
</script>

<template>
  <div
    class="flex flex-col gap-5"
    @mouseup="endDrag"
  >
    <!-- Header -->
    <header class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">
                Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage>Activity</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 class="text-2xl font-semibold tracking-tight mt-2">
          Activity
        </h1>
        <p class="text-muted-foreground text-sm">
          Daily session heatmap. Drag or shift-click to summarize a range.
        </p>
      </div>
    </header>

    <!-- KPI strip -->
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div class="relative overflow-hidden rounded-xl border bg-card/40 p-4">
        <div class="flex items-center gap-1.5">
          <ActivityIcon class="size-3.5 text-emerald-400" />
          <p class="text-[10px] uppercase tracking-[0.14em] font-medium text-muted-foreground">
            Total · this month
          </p>
        </div>
        <p class="mt-2 text-3xl font-semibold tabular-nums leading-none">
          {{ monthStats.total.toLocaleString() }}
        </p>
        <p class="mt-1 text-[11px] text-muted-foreground">
          sessions
        </p>
      </div>
      <div class="relative overflow-hidden rounded-xl border bg-card/40 p-4">
        <div class="flex items-center gap-1.5">
          <BarChart3 class="size-3.5 text-sky-400" />
          <p class="text-[10px] uppercase tracking-[0.14em] font-medium text-muted-foreground">
            Avg · active day
          </p>
        </div>
        <p class="mt-2 text-3xl font-semibold tabular-nums leading-none">
          {{ monthStats.avg }}
        </p>
        <p class="mt-1 text-[11px] text-muted-foreground">
          sessions/day
        </p>
      </div>
      <div class="relative overflow-hidden rounded-xl border bg-card/40 p-4">
        <div class="flex items-center gap-1.5">
          <TrendingUp class="size-3.5 text-violet-400" />
          <p class="text-[10px] uppercase tracking-[0.14em] font-medium text-muted-foreground">
            Peak day
          </p>
        </div>
        <p class="mt-2 text-3xl font-semibold tabular-nums leading-none">
          {{ monthStats.peak?.count ?? 0 }}
        </p>
        <p class="mt-1 text-[11px] text-muted-foreground truncate">
          {{ monthStats.peak ? fmtKey(monthStats.peak.key) : '—' }}
        </p>
      </div>
      <div class="relative overflow-hidden rounded-xl border bg-card/40 p-4">
        <div class="flex items-center gap-1.5">
          <Flame class="size-3.5 text-amber-400" />
          <p class="text-[10px] uppercase tracking-[0.14em] font-medium text-muted-foreground">
            Current streak
          </p>
        </div>
        <p class="mt-2 text-3xl font-semibold tabular-nums leading-none">
          {{ monthStats.streak }}
        </p>
        <p class="mt-1 text-[11px] text-muted-foreground">
          day{{ monthStats.streak === 1 ? '' : 's' }} in a row
        </p>
      </div>
    </div>

    <!-- Heatmap card -->
    <div class="rounded-xl border bg-card/40 overflow-hidden">
      <!-- Toolbar -->
      <div class="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/30 px-4 py-2.5">
        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            class="size-7"
            @click="prevMonth"
          >
            <ChevronLeft class="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            class="size-7"
            @click="nextMonth"
          >
            <ChevronRight class="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            class="h-7 text-xs"
            @click="goToToday"
          >
            Today
          </Button>
          <h2 class="text-sm font-semibold ml-2">
            {{ monthLabel }}
          </h2>
        </div>
        <div class="flex items-center gap-3 text-[11px] text-muted-foreground">
          <div
            v-if="isRange"
            class="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-300 ring-1 ring-inset ring-emerald-500/20"
          >
            <MousePointer2 class="size-3" />
            <span>{{ rangeDayCount }} days · {{ rangeStats.total.toLocaleString() }} sessions · avg {{ rangeStats.avg }}</span>
            <button
              class="ml-0.5 hover:text-foreground"
              @click="clearRange"
            >
              <X class="size-3" />
            </button>
          </div>
          <div class="flex items-center gap-1.5">
            <Sparkles class="size-3" />
            <span>{{ monthStats.total.toLocaleString() }} this month</span>
          </div>
        </div>
      </div>

      <!-- Weekday header -->
      <div class="grid grid-cols-7 border-b bg-muted/10 text-[10px] uppercase tracking-wider text-muted-foreground">
        <div
          v-for="w in weekdays"
          :key="w"
          class="px-2 py-2 font-medium"
        >
          {{ w }}
        </div>
      </div>

      <!-- Heatmap grid -->
      <div class="grid grid-cols-7 select-none">
        <button
          v-for="(d, i) in monthCells"
          :key="d.key"
          type="button"
          :class="[
            'group relative isolate flex h-20 items-start justify-between border-b border-r p-1.5 text-left transition-all focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            (i + 1) % 7 === 0 && 'border-r-0',
            i >= 35 && 'border-b-0',
            !d.inMonth && 'opacity-40',
            inRange(d.key) && 'ring-1 ring-inset ring-emerald-500/60 z-10',
          ]"
          :title="`${fmtKey(d.key)} — ${d.count} session${d.count === 1 ? '' : 's'}`"
          @mousedown="onCellMouseDown(d.key, $event)"
          @mouseenter="onCellMouseEnter(d.key)"
        >
          <!-- Intensity fill -->
          <div :class="['pointer-events-none absolute inset-1 rounded-md transition-all group-hover:brightness-125 group-hover:inset-0.5', intensityClass(d.count)]" />
          <!-- Date number -->
          <span
            :class="[
              'relative inline-flex size-5 items-center justify-center rounded-full text-[11px] tabular-nums z-10',
              d.key === todayKey && 'bg-foreground text-background font-semibold ring-2 ring-emerald-400',
              d.key !== todayKey && d.inMonth && 'text-foreground/80',
              !d.inMonth && 'text-foreground/40',
            ]"
          >{{ d.date.getDate() }}</span>
          <!-- Count badge (subtle, top-right) only on hover for active cells -->
          <span
            v-if="d.count > 0 && d.inMonth"
            class="relative z-10 text-[10px] tabular-nums text-foreground/70 opacity-0 transition-opacity group-hover:opacity-100"
          >{{ d.count }}</span>
        </button>
      </div>

      <!-- Legend -->
      <div class="flex flex-wrap items-center gap-3 border-t bg-muted/20 px-4 py-2 text-[10px] text-muted-foreground">
        <CalendarIcon class="size-3" />
        <span>Less</span>
        <span class="h-2.5 w-4 rounded-sm bg-muted/40" />
        <span class="h-2.5 w-4 rounded-sm bg-emerald-500/15" />
        <span class="h-2.5 w-4 rounded-sm bg-emerald-500/35" />
        <span class="h-2.5 w-4 rounded-sm bg-emerald-500/60" />
        <span class="h-2.5 w-4 rounded-sm bg-emerald-500/85" />
        <span>More</span>
        <span class="ml-auto">Tip: drag or shift-click to summarize a range.</span>
      </div>
    </div>

    <!-- Range detail (only when range > 1) -->
    <div
      v-if="isRange"
      class="rounded-xl border bg-gradient-to-br from-emerald-500/10 to-transparent p-4"
    >
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-[10px] uppercase tracking-[0.14em] font-medium text-muted-foreground">
            Selected range
          </p>
          <p class="mt-1 text-base font-semibold">
            {{ fmtKey(rangeBounds.lo) }} → {{ fmtKey(rangeBounds.hi) }}
          </p>
        </div>
        <div class="grid grid-cols-3 gap-3 text-right">
          <div>
            <p class="text-[10px] uppercase tracking-wider text-muted-foreground">
              Days
            </p>
            <p class="text-lg font-semibold tabular-nums">
              {{ rangeDayCount }}
            </p>
          </div>
          <div>
            <p class="text-[10px] uppercase tracking-wider text-muted-foreground">
              Active
            </p>
            <p class="text-lg font-semibold tabular-nums">
              {{ rangeStats.active }}
            </p>
          </div>
          <div>
            <p class="text-[10px] uppercase tracking-wider text-muted-foreground">
              Total
            </p>
            <p class="text-lg font-semibold tabular-nums text-emerald-300">
              {{ rangeStats.total.toLocaleString() }}
            </p>
          </div>
        </div>
      </div>
      <!-- Mini per-day bars across range -->
      <div class="mt-4 flex items-end gap-0.5 h-12">
        <div
          v-for="c in rangeStats.cells"
          :key="c.key"
          :class="['flex-1 rounded-sm transition-colors', c.count === 0 ? 'bg-muted/30' : 'bg-emerald-500/70']"
          :style="{ height: c.count === 0 ? '8%' : `${Math.min(100, 12 + c.count * 4)}%` }"
          :title="`${fmtKey(c.key)} — ${c.count}`"
        />
      </div>
    </div>
  </div>
</template>
