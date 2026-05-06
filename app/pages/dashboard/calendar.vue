<script setup lang="ts">
import {
  ChevronLeft, ChevronRight, Plus, Clock, MapPin, Users, Video,
  CheckCircle2, Circle, AlertCircle, Search, CalendarDays, Plane,
  ListFilter, Sparkles, Copy, X, CalendarPlus, ArrowRight, MousePointer2,
  Pencil, Trash2, Eye, CopyPlus,
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import {
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator,
  ContextMenuShortcut, ContextMenuTrigger, ContextMenuLabel,
} from '@/components/ui/context-menu'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Calendar' })

interface CalendarEvent {
  id: string
  title: string
  date: string
  start: string
  end: string
  type: 'meeting' | 'task' | 'reminder' | 'travel'
  description: string
  location?: string
  attendees?: string[]
  status: 'confirmed' | 'tentative' | 'cancelled'
}

const view = ref<'month' | 'week' | 'day'>('month')
const eventOpen = ref(false)
const selectedEvent = ref<CalendarEvent | null>(null)
const search = ref('')

const { data: events, pending: loading } = useFetch<CalendarEvent[]>('/api/mock/events')

// Headless month-grid + range-select state and handlers.
const {
  today, todayKey,
  cursor, monthLabel, gridDays, weekdays,
  rangeAnchor, rangeStart, rangeEnd, rangeBounds, rangeDayCount, isRange, inRange,
  prevMonth, nextMonth, goToToday: goToday, selectWeekOf, clearRange,
  onCellMouseDown, onCellMouseEnter, endDrag,
} = useMonthGrid({ initialDate: '2026-05-16' })

const typeMeta: Record<CalendarEvent['type'], {
  label: string
  icon: any
  chip: string
  bar: string
  dot: string
  glow: string
  text: string
  ring: string
}> = {
  meeting: { label: 'Meeting', icon: Video, chip: 'bg-sky-500/10 text-sky-300 ring-sky-500/20', bar: 'bg-sky-500', dot: 'bg-sky-500', glow: 'bg-sky-500/10', text: 'text-sky-300', ring: 'hover:ring-sky-500/30' },
  task: { label: 'Task', icon: CheckCircle2, chip: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/20', bar: 'bg-emerald-500', dot: 'bg-emerald-500', glow: 'bg-emerald-500/10', text: 'text-emerald-300', ring: 'hover:ring-emerald-500/30' },
  reminder: { label: 'Reminder', icon: AlertCircle, chip: 'bg-amber-500/10 text-amber-300 ring-amber-500/20', bar: 'bg-amber-500', dot: 'bg-amber-500', glow: 'bg-amber-500/10', text: 'text-amber-300', ring: 'hover:ring-amber-500/30' },
  travel: { label: 'Travel', icon: Plane, chip: 'bg-violet-500/10 text-violet-300 ring-violet-500/20', bar: 'bg-violet-500', dot: 'bg-violet-500', glow: 'bg-violet-500/10', text: 'text-violet-300', ring: 'hover:ring-violet-500/30' },
}

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return events.value ?? []
  return (events.value ?? []).filter(e =>
    e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q) || e.location?.toLowerCase().includes(q),
  )
})

const eventsByDate = computed(() => {
  const map = new Map<string, CalendarEvent[]>()
  for (const e of filtered.value) {
    if (!map.has(e.date)) map.set(e.date, [])
    map.get(e.date)!.push(e)
  }
  for (const arr of map.values()) arr.sort((a, b) => a.start.localeCompare(b.start))
  return map
})

const monthCounts = computed(() => {
  const y = cursor.value.getFullYear()
  const m = cursor.value.getMonth()
  const init = { meeting: 0, task: 0, travel: 0, reminder: 0, total: 0 }
  for (const e of (events.value ?? [])) {
    const d = new Date(e.date)
    if (d.getFullYear() === y && d.getMonth() === m) {
      init[e.type]++
      init.total++
    }
  }
  return init
})

// Per-type richer stats: weekly distribution (rows 0–5 of grid), next upcoming event of type
type TypeKey = CalendarEvent['type']
const typeStats = computed(() => {
  const y = cursor.value.getFullYear()
  const m = cursor.value.getMonth()
  const out: Record<TypeKey, { weeks: number[], next: CalendarEvent | null }> = {
    meeting: { weeks: [0, 0, 0, 0, 0, 0], next: null },
    task: { weeks: [0, 0, 0, 0, 0, 0], next: null },
    reminder: { weeks: [0, 0, 0, 0, 0, 0], next: null },
    travel: { weeks: [0, 0, 0, 0, 0, 0], next: null },
  }
  // First-of-month Sunday offset so week index matches the grid
  const firstOffset = new Date(y, m, 1).getDay()
  const inMonthOfType: Record<TypeKey, CalendarEvent[]> = { meeting: [], task: [], reminder: [], travel: [] }

  for (const e of (events.value ?? [])) {
    const d = new Date(e.date)
    if (d.getFullYear() === y && d.getMonth() === m) {
      const week = Math.floor((d.getDate() - 1 + firstOffset) / 7)
      out[e.type].weeks[week]!++
      inMonthOfType[e.type].push(e)
    }
  }
  // Next upcoming per type (anywhere from today onward, not just this month)
  for (const t of Object.keys(out) as TypeKey[]) {
    const sorted = (events.value ?? [])
      .filter(e => e.type === t && e.date >= todayKey)
      .sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start))
    out[t].next = sorted[0] ?? null
  }
  return out
})

function fmtNextDate(key: string) {
  const d = dateFromKey(key)
  if (key === todayKey) return 'Today'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const rangeEvents = computed(() => {
  const { lo, hi } = rangeBounds.value
  return (filtered.value)
    .filter(e => e.date >= lo && e.date <= hi)
    .sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start))
})

const rangeTypeCounts = computed(() => {
  const init = { meeting: 0, task: 0, travel: 0, reminder: 0 }
  for (const e of rangeEvents.value) init[e.type]++
  return init
})

const selectedDayEvents = computed(() => eventsByDate.value.get(rangeStart.value) ?? [])

const upcoming = computed(() =>
  (filtered.value)
    .filter(e => e.date > todayKey)
    .sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start))
    .slice(0, 4),
)

function openEvent(e: CalendarEvent) {
  selectedEvent.value = e
  eventOpen.value = true
}

function copyDate(key: string) {
  navigator?.clipboard?.writeText(key).catch(() => {})
}

function fmtDayLong(key: string) {
  return dateFromKey(key).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}
function fmtDayShort(key: string) {
  return dateFromKey(key).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2)
}

// Helper: classes for cell based on range position
function cellRangeClass(key: string, inMonth: boolean) {
  const { lo, hi } = rangeBounds.value
  if (!inRange(key)) return inMonth ? 'bg-background hover:bg-accent/40' : 'bg-muted/20 hover:bg-muted/30'
  if (key === lo && key === hi) return 'bg-accent/30 ring-1 ring-inset ring-primary/60'
  // edges + middle of range
  let cls = 'bg-primary/10 hover:bg-primary/15'
  if (key === lo) cls += ' ring-1 ring-inset ring-primary/60'
  if (key === hi) cls += ' ring-1 ring-inset ring-primary/60'
  return cls
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
            <BreadcrumbPage>Calendar</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 class="text-2xl font-semibold tracking-tight mt-2">
          Calendar
        </h1>
        <p class="text-muted-foreground text-sm">
          Schedule, meetings, and deadlines. Drag or shift-click to select a range.
        </p>
      </div>
      <div class="flex items-center gap-2">
        <div class="relative">
          <Search class="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            v-model="search"
            placeholder="Search events…"
            class="h-8 w-56 pl-8 text-xs"
          />
        </div>
        <Select v-model="view">
          <SelectTrigger class="h-8 w-24 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">
              Month
            </SelectItem>
            <SelectItem value="week">
              Week
            </SelectItem>
            <SelectItem value="day">
              Day
            </SelectItem>
          </SelectContent>
        </Select>
        <Button
          size="sm"
          class="gap-1.5"
        >
          <Plus class="size-3.5" />
          New event
        </Button>
      </div>
    </header>

    <!-- Stats strip -->
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <button
        v-for="(meta, type) in typeMeta"
        :key="type"
        type="button"
        :class="['group relative isolate flex flex-col overflow-hidden rounded-xl border bg-card/40 p-4 text-left ring-1 ring-inset ring-transparent backdrop-blur transition-all hover:-translate-y-px hover:bg-card hover:shadow-lg', meta.ring]"
        @click="search = meta.label.toLowerCase() === search.toLowerCase() ? '' : meta.label.toLowerCase()"
      >
        <!-- Watermark icon -->
        <component
          :is="meta.icon"
          :class="['pointer-events-none absolute -right-4 -top-4 size-24 opacity-[0.06] transition-opacity group-hover:opacity-[0.12]', meta.text]"
        />
        <!-- Soft glow blob -->
        <div :class="['pointer-events-none absolute -right-12 -bottom-12 size-32 rounded-full blur-2xl', meta.glow]" />

        <!-- Header -->
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-1.5">
            <span :class="['size-1.5 rounded-full', meta.dot]" />
            <p class="text-muted-foreground text-[10px] uppercase tracking-[0.14em] font-medium">
              {{ meta.label }}
            </p>
          </div>
          <div :class="['flex size-7 items-center justify-center rounded-md ring-1 ring-inset', meta.chip]">
            <component
              :is="meta.icon"
              class="size-3.5"
            />
          </div>
        </div>

        <!-- Number -->
        <div class="mt-2 flex items-baseline gap-1.5">
          <p class="text-3xl font-semibold tabular-nums leading-none">
            {{ monthCounts[type] }}
          </p>
          <p class="text-muted-foreground text-[10px] uppercase tracking-wider">
            this month
          </p>
        </div>

        <!-- Weekly distribution bars -->
        <div class="mt-3 flex items-end gap-1 h-6">
          <span
            v-for="(n, i) in typeStats[type].weeks.slice(0, 6)"
            :key="i"
            :class="[
              'flex-1 rounded-sm transition-colors',
              n > 0 ? meta.bar : 'bg-muted/40',
              n > 0 && 'opacity-70 group-hover:opacity-100',
            ]"
            :style="{ height: n > 0 ? `${Math.min(100, 30 + n * 35)}%` : '20%' }"
            :title="`Week ${i + 1}: ${n} ${meta.label.toLowerCase()}${n === 1 ? '' : 's'}`"
          />
        </div>

        <!-- Next -->
        <div class="mt-3 border-t border-border/50 pt-2 min-h-[2.25rem]">
          <template v-if="typeStats[type].next">
            <p class="text-[10px] uppercase tracking-wider text-muted-foreground">
              Next · <span :class="meta.text">{{ fmtNextDate(typeStats[type].next!.date) }}</span>
            </p>
            <p class="truncate text-xs font-medium mt-0.5">
              {{ typeStats[type].next!.title }}
            </p>
          </template>
          <template v-else>
            <p class="text-[10px] uppercase tracking-wider text-muted-foreground">
              No upcoming
            </p>
            <p class="text-xs text-muted-foreground/70 mt-0.5">
              All clear
            </p>
          </template>
        </div>
      </button>
    </div>

    <!-- Main: calendar + side rail -->
    <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <!-- Month grid -->
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
              @click="goToday"
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
              class="flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-primary ring-1 ring-inset ring-primary/20"
            >
              <MousePointer2 class="size-3" />
              <span>{{ rangeDayCount }} days · {{ rangeEvents.length }} events</span>
              <button
                class="ml-0.5 hover:text-foreground"
                @click="clearRange"
              >
                <X class="size-3" />
              </button>
            </div>
            <div class="flex items-center gap-1.5">
              <Sparkles class="size-3" />
              <span>{{ monthCounts.total }} event{{ monthCounts.total === 1 ? '' : 's' }} this month</span>
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

        <!-- Cells -->
        <div class="grid grid-cols-7 select-none">
          <template v-if="loading">
            <div
              v-for="i in 35"
              :key="i"
              class="h-24 border-b border-r p-1.5 last:border-r-0"
            >
              <Skeleton class="h-3 w-6" />
              <Skeleton class="mt-2 h-3 w-full" />
            </div>
          </template>
          <template v-else>
            <ContextMenu
              v-for="(d, i) in gridDays"
              :key="d.key"
            >
              <ContextMenuTrigger as-child>
                <button
                  type="button"
                  :class="[
                    'group relative flex h-24 flex-col gap-1 border-b border-r p-1.5 text-left transition-colors focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    (i + 1) % 7 === 0 && 'border-r-0',
                    i >= 35 && 'border-b-0',
                    cellRangeClass(d.key, d.inMonth),
                    !d.inMonth && !inRange(d.key) && 'text-muted-foreground/60',
                  ]"
                  @mousedown="onCellMouseDown(d.key, $event)"
                  @mouseenter="onCellMouseEnter(d.key)"
                >
                  <div class="flex items-center justify-between">
                    <span
                      :class="[
                        'inline-flex size-5 items-center justify-center rounded-full text-[11px] tabular-nums',
                        d.key === todayKey && 'bg-primary text-primary-foreground font-semibold',
                        d.key !== todayKey && d.inMonth && 'text-foreground',
                        !d.inMonth && 'text-muted-foreground/60',
                      ]"
                    >{{ d.date.getDate() }}</span>
                    <span
                      v-if="(eventsByDate.get(d.key)?.length ?? 0) > 0"
                      class="text-[9px] tabular-nums text-muted-foreground"
                    >
                      {{ eventsByDate.get(d.key)!.length }}
                    </span>
                  </div>
                  <div class="flex flex-col gap-0.5">
                    <ContextMenu
                      v-for="e in (eventsByDate.get(d.key) ?? []).slice(0, 2)"
                      :key="e.id"
                    >
                      <ContextMenuTrigger as-child>
                        <span
                          :class="['flex items-center gap-1 truncate rounded px-1 py-0.5 text-[10px] ring-1 ring-inset cursor-pointer', typeMeta[e.type].chip]"
                          @mousedown.stop
                          @click.stop="openEvent(e)"
                          @contextmenu.stop
                        >
                          <span class="tabular-nums opacity-70">{{ e.start }}</span>
                          <span class="truncate">{{ e.title }}</span>
                        </span>
                      </ContextMenuTrigger>
                      <ContextMenuContent class="w-52">
                        <ContextMenuLabel class="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <span :class="['size-1.5 rounded-full', typeMeta[e.type].dot]" />
                          <span class="truncate">{{ e.title }}</span>
                        </ContextMenuLabel>
                        <ContextMenuSeparator />
                        <ContextMenuItem
                          class="gap-2"
                          @select="openEvent(e)"
                        >
                          <Eye class="size-3.5" /> View details
                          <ContextMenuShortcut>↵</ContextMenuShortcut>
                        </ContextMenuItem>
                        <ContextMenuItem class="gap-2">
                          <Pencil class="size-3.5" /> Edit
                        </ContextMenuItem>
                        <ContextMenuItem class="gap-2">
                          <CopyPlus class="size-3.5" /> Duplicate
                        </ContextMenuItem>
                        <ContextMenuItem
                          class="gap-2"
                          @select="copyDate(e.date)"
                        >
                          <Copy class="size-3.5" /> Copy date
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem class="gap-2 text-destructive focus:text-destructive">
                          <Trash2 class="size-3.5" /> Cancel event
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                    <span
                      v-if="(eventsByDate.get(d.key)?.length ?? 0) > 2"
                      class="px-1 text-[10px] text-muted-foreground"
                    >
                      +{{ eventsByDate.get(d.key)!.length - 2 }} more
                    </span>
                  </div>
                </button>
              </ContextMenuTrigger>
              <ContextMenuContent class="w-56">
                <ContextMenuLabel class="text-[11px] text-muted-foreground">
                  {{ fmtDayLong(d.key) }}
                </ContextMenuLabel>
                <ContextMenuSeparator />
                <ContextMenuItem class="gap-2">
                  <CalendarPlus class="size-3.5" /> New event
                  <ContextMenuShortcut>N</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem
                  class="gap-2"
                  @select="selectWeekOf(d.key)"
                >
                  <CalendarDays class="size-3.5" /> Select this week
                </ContextMenuItem>
                <ContextMenuItem
                  class="gap-2"
                  :disabled="(eventsByDate.get(d.key)?.length ?? 0) === 0"
                  @select="rangeAnchor = d.key; rangeStart = d.key; rangeEnd = d.key"
                >
                  <Eye class="size-3.5" /> View day · {{ eventsByDate.get(d.key)?.length ?? 0 }} event{{ (eventsByDate.get(d.key)?.length ?? 0) === 1 ? '' : 's' }}
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem
                  class="gap-2"
                  @select="copyDate(d.key)"
                >
                  <Copy class="size-3.5" /> Copy date <ContextMenuShortcut class="tabular-nums">
                    {{ d.key }}
                  </ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem
                  class="gap-2"
                  @select="goToday"
                >
                  <ArrowRight class="size-3.5" /> Go to today
                </ContextMenuItem>
                <ContextMenuItem
                  v-if="isRange"
                  class="gap-2 text-destructive focus:text-destructive"
                  @select="clearRange"
                >
                  <X class="size-3.5" /> Clear range
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </template>
        </div>

        <!-- Legend -->
        <div class="flex flex-wrap items-center gap-3 border-t bg-muted/20 px-4 py-2 text-[10px] text-muted-foreground">
          <ListFilter class="size-3" />
          <div
            v-for="(meta, key) in typeMeta"
            :key="key"
            class="flex items-center gap-1.5"
          >
            <span :class="['size-2 rounded-full', meta.dot]" />
            {{ meta.label }}
          </div>
          <span class="ml-auto text-[10px]">Tip: drag or shift-click to range. Right-click for actions.</span>
        </div>
      </div>

      <!-- Side rail -->
      <aside class="flex flex-col gap-4">
        <!-- Selected day (single) OR range summary -->
        <div
          v-if="!isRange"
          class="rounded-xl border bg-card/40 overflow-hidden"
        >
          <div class="border-b bg-muted/30 px-4 py-3">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {{ rangeStart === todayKey ? 'Today' : 'Selected' }}
                </p>
                <p class="mt-0.5 text-sm font-semibold">
                  {{ fmtDayLong(rangeStart) }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Events
                </p>
                <p class="text-sm font-semibold tabular-nums">
                  {{ selectedDayEvents.length }}
                </p>
              </div>
            </div>
          </div>
          <div class="max-h-[420px] overflow-y-auto p-3">
            <template v-if="loading">
              <div
                v-for="i in 3"
                :key="i"
                class="mb-2 space-y-2 rounded-lg border p-3"
              >
                <Skeleton class="h-3 w-32" />
                <Skeleton class="h-2 w-20" />
              </div>
            </template>
            <template v-else-if="selectedDayEvents.length === 0">
              <div class="flex flex-col items-center justify-center gap-2 py-8 text-center">
                <div class="flex size-10 items-center justify-center rounded-full bg-muted">
                  <CalendarDays class="size-5 text-muted-foreground" />
                </div>
                <p class="text-sm font-medium">
                  Nothing scheduled
                </p>
                <p class="text-xs text-muted-foreground">
                  Click a date or add a new event.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  class="mt-1 gap-1.5 h-7 text-xs"
                >
                  <Plus class="size-3" /> New event
                </Button>
              </div>
            </template>
            <template v-else>
              <ContextMenu
                v-for="e in selectedDayEvents"
                :key="e.id"
              >
                <ContextMenuTrigger as-child>
                  <div
                    class="group relative flex cursor-pointer gap-3 rounded-lg p-2.5 transition-colors hover:bg-accent/50"
                    @click="openEvent(e)"
                  >
                    <div :class="['w-0.5 shrink-0 rounded-full', typeMeta[e.type].bar]" />
                    <div class="min-w-0 flex-1 space-y-1">
                      <div class="flex items-start justify-between gap-2">
                        <p class="text-sm font-medium leading-tight">
                          {{ e.title }}
                        </p>
                        <span :class="['shrink-0 rounded px-1.5 py-0.5 text-[9px] uppercase tracking-wider ring-1 ring-inset', typeMeta[e.type].chip]">
                          {{ typeMeta[e.type].label }}
                        </span>
                      </div>
                      <div class="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
                        <span class="inline-flex items-center gap-1"><Clock class="size-3" />{{ e.start }}–{{ e.end }}</span>
                        <span
                          v-if="e.location"
                          class="inline-flex items-center gap-1"
                        ><MapPin class="size-3" />{{ e.location }}</span>
                      </div>
                      <div
                        v-if="e.attendees?.length"
                        class="flex items-center -space-x-1.5 pt-0.5"
                      >
                        <Avatar
                          v-for="(a, i) in e.attendees.slice(0, 4)"
                          :key="i"
                          class="size-5 border-2 border-background"
                        >
                          <AvatarFallback class="text-[8px] bg-primary/10 text-primary">
                            {{ initials(a) }}
                          </AvatarFallback>
                        </Avatar>
                        <span
                          v-if="e.attendees.length > 4"
                          class="pl-2 text-[10px] text-muted-foreground"
                        >+{{ e.attendees.length - 4 }}</span>
                      </div>
                    </div>
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent class="w-48">
                  <ContextMenuLabel class="text-[11px] text-muted-foreground truncate">
                    {{ e.title }}
                  </ContextMenuLabel>
                  <ContextMenuSeparator />
                  <ContextMenuItem
                    class="gap-2"
                    @select="openEvent(e)"
                  >
                    <Eye class="size-3.5" /> View details
                  </ContextMenuItem>
                  <ContextMenuItem class="gap-2">
                    <Pencil class="size-3.5" /> Edit
                  </ContextMenuItem>
                  <ContextMenuItem class="gap-2">
                    <CopyPlus class="size-3.5" /> Duplicate
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem class="gap-2 text-destructive focus:text-destructive">
                    <Trash2 class="size-3.5" /> Cancel event
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            </template>
          </div>
        </div>

        <!-- Range summary -->
        <div
          v-else
          class="rounded-xl border bg-card/40 overflow-hidden"
        >
          <div class="border-b bg-gradient-to-r from-primary/10 to-transparent px-4 py-3">
            <div class="flex items-center justify-between gap-3">
              <div class="min-w-0">
                <p class="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Range · {{ rangeDayCount }} days
                </p>
                <p class="mt-0.5 truncate text-sm font-semibold">
                  {{ fmtDayShort(rangeBounds.lo) }} → {{ fmtDayShort(rangeBounds.hi) }}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                class="size-7"
                @click="clearRange"
              >
                <X class="size-3.5" />
              </Button>
            </div>
            <div class="mt-3 grid grid-cols-4 gap-2">
              <div
                v-for="(meta, t) in typeMeta"
                :key="t"
                class="rounded-md border bg-background/40 px-2 py-1.5"
              >
                <div class="flex items-center gap-1 text-[9px] uppercase tracking-wider text-muted-foreground">
                  <span :class="['size-1.5 rounded-full', meta.dot]" />
                  {{ meta.label }}
                </div>
                <p class="mt-0.5 text-sm font-semibold tabular-nums">
                  {{ rangeTypeCounts[t] }}
                </p>
              </div>
            </div>
          </div>
          <div class="max-h-[420px] overflow-y-auto">
            <template v-if="rangeEvents.length === 0">
              <p class="px-4 py-8 text-center text-xs text-muted-foreground">
                No events in range.
              </p>
            </template>
            <template v-else>
              <div
                v-for="e in rangeEvents"
                :key="e.id"
                class="flex cursor-pointer items-start gap-3 border-b px-3 py-2.5 transition-colors last:border-b-0 hover:bg-accent/40"
                @click="openEvent(e)"
              >
                <div class="flex w-10 shrink-0 flex-col items-center rounded-md border bg-background/60 px-1 py-1 text-center">
                  <span class="text-[8px] uppercase text-muted-foreground">{{ new Date(e.date).toLocaleDateString('en-US', { month: 'short' }) }}</span>
                  <span class="text-sm font-semibold leading-none tabular-nums">{{ new Date(e.date).getDate() }}</span>
                </div>
                <div :class="['w-0.5 self-stretch shrink-0 rounded-full', typeMeta[e.type].bar]" />
                <div class="min-w-0 flex-1">
                  <p class="truncate text-xs font-medium">
                    {{ e.title }}
                  </p>
                  <p class="text-[11px] text-muted-foreground tabular-nums mt-0.5">
                    {{ e.start }}–{{ e.end }}<span v-if="e.location"> · {{ e.location }}</span>
                  </p>
                </div>
                <span :class="['shrink-0 rounded px-1.5 py-0.5 text-[9px] uppercase tracking-wider ring-1 ring-inset', typeMeta[e.type].chip]">
                  {{ typeMeta[e.type].label }}
                </span>
              </div>
            </template>
          </div>
        </div>

        <!-- Upcoming -->
        <div class="rounded-xl border bg-card/40 overflow-hidden">
          <div class="border-b bg-muted/30 px-4 py-2.5">
            <p class="text-sm font-semibold">
              Up next
            </p>
            <p class="text-[11px] text-muted-foreground">
              After today
            </p>
          </div>
          <div class="divide-y">
            <template v-if="loading">
              <div
                v-for="i in 3"
                :key="i"
                class="flex items-center gap-3 p-3"
              >
                <Skeleton class="size-9 rounded-md" />
                <div class="flex-1 space-y-1">
                  <Skeleton class="h-3 w-32" />
                  <Skeleton class="h-2 w-20" />
                </div>
              </div>
            </template>
            <template v-else-if="upcoming.length === 0">
              <p class="px-4 py-6 text-center text-xs text-muted-foreground">
                Nothing on the horizon.
              </p>
            </template>
            <template v-else>
              <button
                v-for="e in upcoming"
                :key="e.id"
                type="button"
                class="group flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-accent/40"
                @click="openEvent(e)"
              >
                <div class="flex size-10 shrink-0 flex-col items-center justify-center rounded-md border bg-background text-center">
                  <span class="text-[9px] uppercase text-muted-foreground">{{ new Date(e.date).toLocaleDateString('en-US', { month: 'short' }) }}</span>
                  <span class="text-sm font-semibold leading-none tabular-nums">{{ new Date(e.date).getDate() }}</span>
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-1.5">
                    <span :class="['size-1.5 rounded-full', typeMeta[e.type].dot]" />
                    <p class="truncate text-xs font-medium">
                      {{ e.title }}
                    </p>
                  </div>
                  <p class="text-[11px] text-muted-foreground tabular-nums mt-0.5">
                    {{ e.start }}–{{ e.end }}<span v-if="e.location"> · {{ e.location }}</span>
                  </p>
                </div>
              </button>
            </template>
          </div>
        </div>
      </aside>
    </div>

    <!-- Event Detail Dialog -->
    <Dialog v-model:open="eventOpen">
      <DialogContent
        v-if="selectedEvent"
        class="sm:max-w-md"
      >
        <DialogHeader>
          <div class="flex items-center gap-2">
            <div :class="['flex size-8 items-center justify-center rounded-md ring-1 ring-inset', typeMeta[selectedEvent.type].chip]">
              <component
                :is="typeMeta[selectedEvent.type].icon"
                class="size-4"
              />
            </div>
            <div>
              <DialogTitle class="text-base">
                {{ selectedEvent.title }}
              </DialogTitle>
              <DialogDescription class="text-xs">
                {{ typeMeta[selectedEvent.type].label }} · {{ selectedEvent.status }}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div class="space-y-3 py-2">
          <p class="text-sm text-muted-foreground">
            {{ selectedEvent.description }}
          </p>
          <Separator />
          <div class="grid gap-2 text-sm">
            <div class="flex items-center gap-2">
              <Clock class="size-4 text-muted-foreground" />
              <span>{{ selectedEvent.date }} · {{ selectedEvent.start }} – {{ selectedEvent.end }}</span>
            </div>
            <div
              v-if="selectedEvent.location"
              class="flex items-center gap-2"
            >
              <MapPin class="size-4 text-muted-foreground" />
              <span>{{ selectedEvent.location }}</span>
            </div>
            <div
              v-if="selectedEvent.attendees?.length"
              class="flex items-start gap-2"
            >
              <Users class="size-4 text-muted-foreground mt-0.5" />
              <div class="flex flex-wrap items-center gap-1.5">
                <div
                  v-for="a in selectedEvent.attendees"
                  :key="a"
                  class="flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-xs"
                >
                  <Avatar class="size-4">
                    <AvatarFallback class="text-[8px] bg-primary/10 text-primary">
                      {{ initials(a) }}
                    </AvatarFallback>
                  </Avatar>
                  <span>{{ a }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="destructive"
          >
            Cancel event
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
