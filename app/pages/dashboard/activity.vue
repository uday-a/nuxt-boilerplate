<script setup lang="ts">
import {
  ChevronLeft, ChevronRight, Flame, TrendingUp, MousePointer2,
  Activity as ActivityIcon, Calendar as CalendarIcon, X, Sparkles, BarChart3,
  LogIn, FolderPlus, MessageSquare, UserPlus, AlertCircle,
} from '@/lib/icon-pack'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Page, PageHeader, PageHeaderHeading, PageBody } from '@/components/ui/page'
import type { ApiResponse } from '~~/server/utils/response'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
const title = useRouteLabel()
useHead({ title })

const { t, locale } = useI18n()
const { user: sessionUser } = useUserSession()

// ─── Live audit feed ─────────────────────────────────────────────────
// Fetches /api/activity (envelope: check res.ok via useFetch data). When
// rows exist we render the real feed below; when empty (no DB / demo
// session) the mock heatmap stays as the fallback and the page shows
// the shared DemoDataBanner.
interface FeedItem {
  id: number
  userId: number | null
  action: string
  entity: string | null
  entityId: string | null
  metadata: Record<string, unknown> | null
  createdAt: string | Date
  actorEmail: string | null
}

const { data: activityRes, pending: feedPending, error: feedError, refresh: refreshFeed } = await useFetch<ApiResponse<{ items: FeedItem[], total: number }>>('/api/activity')

const feedItems = computed<FeedItem[]>(() =>
  activityRes.value?.ok ? activityRes.value.data.items : [],
)
const hasLive = computed(() => feedItems.value.length > 0)

function feedActionIcon(action: string) {
  if (action.startsWith('auth.')) return LogIn
  if (action.startsWith('projects.')) return FolderPlus
  if (action.startsWith('feedback.')) return MessageSquare
  if (action.startsWith('team.')) return UserPlus
  return ActivityIcon
}

function describeItem(item: FeedItem): string {
  const suffix = item.entity ? ` · ${item.entity}${item.entityId ? ` #${item.entityId}` : ''}` : ''
  return `${item.action}${suffix}`
}

function actorLabel(item: FeedItem): string {
  if (item.actorEmail) {
    const selfEmail = sessionUser.value?.email
    if (selfEmail && item.actorEmail.toLowerCase() === selfEmail.toLowerCase()) return selfEmail
    return item.actorEmail
  }
  return t('settings.activity.feed.deletedUser')
}

function formatFull(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value)
  return date.toLocaleString(locale.value, { dateStyle: 'medium', timeStyle: 'short' })
}

function timeAgo(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value)
  const diffMs = date.getTime() - Date.now()
  const rtf = new Intl.RelativeTimeFormat(locale.value, { numeric: 'auto' })
  const absSec = Math.abs(diffMs) / 1000
  if (absSec < 60) return rtf.format(Math.round(diffMs / 1000), 'second')
  const mins = Math.round(diffMs / 60000)
  if (Math.abs(mins) < 60) return rtf.format(mins, 'minute')
  const hours = Math.round(diffMs / 3600000)
  if (Math.abs(hours) < 24) return rtf.format(hours, 'hour')
  const days = Math.round(diffMs / 86400000)
  if (Math.abs(days) < 30) return rtf.format(days, 'day')
  const months = Math.round(diffMs / 2592000000)
  if (Math.abs(months) < 12) return rtf.format(months, 'month')
  return rtf.format(Math.round(diffMs / 31536000000), 'year')
}

// Same composable that powers /dashboard/calendar — different visual treatment.
const {
  todayKey,
  monthLabel, gridDays, weekdays,
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

// 5-level intensity → one chart-2 opacity ramp (legend reuses it)
const intensityRamp = ['bg-muted/40', 'bg-chart-2/15', 'bg-chart-2/35', 'bg-chart-2/60', 'bg-chart-2/90'] as const
function intensityClass(n: number): string {
  if (n === 0) return intensityRamp[0]
  if (n < 5) return intensityRamp[1]
  if (n < 12) return intensityRamp[2]
  if (n < 20) return intensityRamp[3]
  return intensityRamp[4]
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
  const { lo } = rangeBounds.value
  const cells: { key: string, count: number }[] = []
  const start = dateFromKey(lo)
  const days = rangeDayCount.value
  for (let i = 0; i < days; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
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
  <Page @mouseup="endDrag">
    <PageHeader>
      <PageHeaderHeading
        :title="title"
        description="Daily session heatmap. Drag or shift-click to summarize a range."
      />
    </PageHeader>

    <PageBody class="space-y-4">
      <DemoDataBanner v-if="!hasLive" />

      <!-- KPI strip -->
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          label="Total this month"
          :value="monthStats.total.toLocaleString()"
          caption="sessions"
          :icon="ActivityIcon"
        />
        <StatTile
          label="Avg per active day"
          :value="String(monthStats.avg)"
          caption="sessions/day"
          :icon="BarChart3"
        />
        <StatTile
          label="Peak day"
          :value="String(monthStats.peak?.count ?? 0)"
          :caption="monthStats.peak ? fmtKey(monthStats.peak.key) : '—'"
          :icon="TrendingUp"
        />
        <StatTile
          label="Current streak"
          :value="String(monthStats.streak)"
          :caption="`day${monthStats.streak === 1 ? '' : 's'} in a row`"
          :icon="Flame"
        />
      </div>

      <!-- Heatmap card -->
      <Card>
        <!-- Toolbar -->
        <div class="flex flex-wrap items-center justify-between gap-4 border-b px-4 py-2">
          <div class="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              class="size-8"
              aria-label="Previous month"
              @click="prevMonth"
            >
              <ChevronLeft class="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              class="size-8"
              aria-label="Next month"
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
            <h2 class="ml-2 text-sm font-semibold">
              {{ monthLabel }}
            </h2>
          </div>
          <div class="text-muted-foreground flex items-center gap-4 text-xs">
            <div
              v-if="isRange"
              class="bg-primary/10 text-primary ring-primary/20 flex items-center gap-1.5 rounded-full px-2 py-0.5 ring-1 ring-inset"
            >
              <MousePointer2
                class="size-3.5"
                aria-hidden="true"
              />
              <span class="tabular-nums">{{ rangeDayCount }} days · {{ rangeStats.total.toLocaleString() }} sessions · avg {{ rangeStats.avg }}</span>
              <button
                type="button"
                class="hover:text-foreground ml-0.5"
                aria-label="Clear range"
                @click="clearRange"
              >
                <X class="size-3.5" />
              </button>
            </div>
            <div class="flex items-center gap-1.5">
              <Sparkles
                class="size-3.5"
                aria-hidden="true"
              />
              <span class="tabular-nums">{{ monthStats.total.toLocaleString() }} this month</span>
            </div>
          </div>
        </div>

        <!-- Weekday header -->
        <div class="bg-muted/10 text-muted-foreground grid grid-cols-7 border-b text-xs font-medium tracking-wider uppercase">
          <div
            v-for="w in weekdays"
            :key="w"
            class="p-2"
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
              'group focus-visible:ring-ring relative isolate flex h-20 items-start justify-between border-r border-b p-1.5 text-left transition-all focus-visible:z-10 focus-visible:ring-2 focus-visible:outline-none',
              (i + 1) % 7 === 0 && 'border-r-0',
              i >= 35 && 'border-b-0',
              !d.inMonth && 'opacity-40',
              inRange(d.key) && 'ring-primary/60 z-10 ring-1 ring-inset',
            ]"
            :title="`${fmtKey(d.key)}: ${d.count} session${d.count === 1 ? '' : 's'}`"
            @mousedown="onCellMouseDown(d.key, $event)"
            @mouseenter="onCellMouseEnter(d.key)"
          >
            <!-- Intensity fill -->
            <div :class="['pointer-events-none absolute inset-1 rounded-md transition-all group-hover:inset-0.5', intensityClass(d.count)]" />
            <!-- Date number -->
            <span
              :class="[
                'relative z-10 inline-flex size-6 items-center justify-center rounded-full text-xs tabular-nums',
                d.key === todayKey ? 'bg-primary text-primary-foreground font-semibold' : 'text-foreground',
              ]"
            >{{ d.date.getDate() }}</span>
            <!-- Count badge, revealed on hover for active cells -->
            <!-- WHY (Rule95): focus-within joins hover so keyboard/touch
                 users get the count too -- hover alone hides it from them. -->
            <span
              v-if="d.count > 0 && d.inMonth"
              class="text-foreground relative z-10 text-xs tabular-nums opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
            >{{ d.count }}</span>
          </button>
        </div>

        <!-- Legend -->
        <div class="bg-muted/20 text-muted-foreground flex flex-wrap items-center gap-2 border-t px-4 py-2 text-xs">
          <CalendarIcon
            class="size-3.5"
            aria-hidden="true"
          />
          <span>Less</span>
          <span
            v-for="cls in intensityRamp"
            :key="cls"
            :class="['h-2.5 w-4 rounded-sm', cls]"
          />
          <span>More</span>
          <span class="ml-auto">Drag or shift-click to summarize a range.</span>
        </div>
      </Card>

      <!-- Range detail (only when range > 1) -->
      <Card
        v-if="isRange"
        class="p-4"
      >
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Selected range
            </p>
            <p class="mt-1 text-base font-semibold">
              {{ fmtKey(rangeBounds.lo) }} → {{ fmtKey(rangeBounds.hi) }}
            </p>
          </div>
          <div class="grid grid-cols-3 gap-4 text-right">
            <div>
              <p class="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Days
              </p>
              <!-- WHY (Rule27): KPI values sit on text-2xl so the range
                   summary matches the tile hierarchy. -->
              <p class="text-2xl font-semibold tracking-tight tabular-nums">
                {{ rangeDayCount }}
              </p>
            </div>
            <div>
              <p class="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Active
              </p>
              <p class="text-2xl font-semibold tracking-tight tabular-nums">
                {{ rangeStats.active }}
              </p>
            </div>
            <div>
              <p class="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Total
              </p>
              <p class="text-2xl font-semibold tracking-tight tabular-nums">
                {{ rangeStats.total.toLocaleString() }}
              </p>
            </div>
          </div>
        </div>
        <!-- Mini per-day bars across range -->
        <div class="mt-4 flex h-12 items-end gap-0.5">
          <div
            v-for="c in rangeStats.cells"
            :key="c.key"
            :class="['flex-1 rounded-sm transition-colors', c.count === 0 ? 'bg-muted/40' : 'bg-chart-2']"
            :style="{ height: c.count === 0 ? '8%' : `${Math.min(100, 12 + c.count * 4)}%` }"
            :title="`${fmtKey(c.key)}: ${c.count} sessions`"
          />
        </div>
      </Card>

      <!-- Live events (audit log) -->
      <Card>
        <CardHeader class="border-b">
          <CardTitle
            as="h2"
            class="text-base"
          >
            {{ t('settings.activity.feed.title') }}
          </CardTitle>
        </CardHeader>
        <div
          v-if="feedPending"
          class="text-muted-foreground px-4 py-3 text-sm"
        >
          {{ t('settings.activity.states.loading') }}
        </div>
        <EmptyState
          v-else-if="feedError || (activityRes && !activityRes.ok)"
          :icon="AlertCircle"
          role="alert"
          :title="t('settings.activity.states.error')"
          class="py-4"
        >
          <Button
            variant="outline"
            size="sm"
            class="mt-4"
            @click="refreshFeed()"
          >
            {{ t('settings.activity.states.retry') }}
          </Button>
        </EmptyState>
        <ul
          v-else-if="hasLive"
          class="divide-y"
        >
          <li
            v-for="item in feedItems"
            :key="item.id"
            class="flex items-center gap-2 px-4 py-2"
          >
            <component
              :is="feedActionIcon(item.action)"
              class="text-muted-foreground size-4 shrink-0"
              aria-hidden="true"
            />
            <div class="min-w-0 flex-1">
              <p
                class="truncate text-sm font-medium"
                :title="describeItem(item)"
              >
                {{ describeItem(item) }}
              </p>
              <p
                class="text-muted-foreground truncate text-xs"
                :title="actorLabel(item)"
              >
                {{ actorLabel(item) }}
              </p>
            </div>
            <time
              :title="formatFull(item.createdAt)"
              class="text-muted-foreground shrink-0 text-xs tabular-nums"
            >
              {{ timeAgo(item.createdAt) }}
            </time>
          </li>
        </ul>
        <p
          v-else
          class="text-muted-foreground px-4 py-3 text-sm"
        >
          {{ t('settings.activity.states.empty') }}
        </p>
      </Card>
    </PageBody>
  </Page>
</template>
