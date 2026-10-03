<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Range } from '@/composables/useDashboardData'
import {
  Users, DollarSign, Zap, Timer, TrendingDown, ArrowUpRight, ArrowDownRight,
  ArrowRight, Sparkles, Table2, RotateCcw, MapPin, Building2, Calendar as CalendarIcon,
  CheckCircle2,
} from '@/lib/icon-pack'
import { Page, PageHeader, PageHeaderHeading, PageBody } from '@/components/ui/page'
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Tour, type TourStep } from '@/components/ui/tour'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RangeCalendar } from '@/components/ui/range-calendar'
import { DateFormatter, getLocalTimeZone } from '@internationalized/date'
import { RawChart } from '@/components/ui/charts/raw-chart'
import { BarChart } from '@/components/ui/charts/bar-chart'
import { FunnelChart } from '@/components/ui/charts/funnel-chart'
import { TreemapChart } from '@/components/ui/charts/treemap-chart'
import { CalendarHeatmap } from '@/components/ui/charts/calendar-heatmap'
import { Sparkline } from '@/components/ui/charts/sparkline'
import { EmptyState } from '@/components/ui/empty-state'
import { chartColors } from '@/components/ui/charts/useChartTheme'
import { SectionCard } from '@/components/ui/section-card'
import { LeafletCircleMarker, LeafletMap, LeafletMarker, LeafletPopup, LeafletTooltip, type LeafletMapRef } from '@/components/ui/leaflet-map'
import { customerRadius, customerRegions, kindDotBg, kindDotClass, markerSizeClass, officeLocations } from '@/lib/locations'
import { formatPct } from '@/lib/funnel'
import { DataList, DataListItem } from '@/components/ui/data-list'
import { IconBox } from '@/components/ui/icon-box'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
const title = useRouteLabel()
useHead({ title })

const { t } = useI18n()

const range = ref<Range>('30d')
const shareColors = ['bg-chart-1', 'bg-chart-2', 'bg-chart-3', 'bg-chart-4', 'bg-chart-5']

// "35k" instead of "35,000" — frees width for the bars.
const compactValueAxis = {
  yAxis: { splitNumber: 4, axisLabel: { formatter: (v: number) => (v >= 1000 ? `${v / 1000}k` : String(v)) } },
}

const severityClass = {
  critical: { node: 'bg-destructive/10 text-destructive', badge: 'bg-destructive/10 text-destructive', label: 'Critical' },
  warning: { node: 'bg-warning/10 text-warning', badge: 'bg-warning/10 text-warning', label: 'Warning' },
  info: { node: 'bg-info/10 text-info', badge: 'bg-info/10 text-info', label: 'Info' },
} as const

// Region map: offices span SF → Sydney, so fitBounds snaps down to zoom 1
// on this wide, short card (the world repeats). Zoom 2 shows it once,
// centred on the band where the offices sit. Whole zoom = no tile seams.
const regionMap = ref<LeafletMapRef | null>(null)
const REGION_VIEW = { center: [20, 14] as [number, number], zoom: 2 }
function fitRegionMap(animate = false) {
  if (animate) regionMap.value?.flyTo({ ...REGION_VIEW, duration: 600 })
  else regionMap.value?.setView(REGION_VIEW)
}

// `locale` for the custom-range date formatter; `t` is already
// destructured above.
const { locale } = useI18n()

// Custom range via a RangeCalendar-in-Popover. Picking both endpoints
// flips the dashboard into the 'custom' range so the same range-aware
// computeds (kpi, revenueSeries, funnel, …) respond; picking a preset
// tab clears the calendar value.
// `DateValue` from @internationalized/date and reka-ui's calendar accept
// the same runtime shapes but TypeScript treats them as different brands.
// `as any` avoids the false-positive without changing behavior.
const customCal = ref<any>(undefined)
const customOpen = ref(false)

const customStartEnd = computed(() => {
  const s = customCal.value?.start
  const e = customCal.value?.end
  if (!s || !e) return null
  return { start: s.toDate(getLocalTimeZone()), end: e.toDate(getLocalTimeZone()) }
})

const customSpan = computed(() => {
  if (!customStartEnd.value) return null
  // WHY (Rule71): the label carries the year so "Sep 5 – Sep 12" is never
  // ambiguous across year boundaries.
  const df = new DateFormatter(locale.value, { month: 'short', day: 'numeric', year: 'numeric' })
  const { start, end } = customStartEnd.value
  return t('dashboard.range.customLabel', { start: df.format(start), end: df.format(end) })
})

// Subtitle label: picked dates when a custom range is active,
// otherwise the preset label from the composable.
const displayLabel = computed(() =>
  range.value === 'custom' && customSpan.value ? customSpan.value : rangeLabel.value,
)

watch(customCal, (v) => {
  if (v?.start && v?.end) {
    range.value = 'custom'
    customOpen.value = false
  }
})

watch(range, (v) => {
  if (v !== 'custom') customCal.value = undefined
})

const {
  revenueComboOption, revenueSeries, requestsBlock, funnel, funnelSummary, funnelOption, segments,
  totalHeadcount, totalDepartments, calendarData, calendarRange, calendarColorRange,
  calendarOption, gaugeOption, quotaMeta,
  topProducts, alerts, topCustomers, activities, totalMrr,
  totalDeploys, asOfLabel, statusTone, formatK, kpi, rangeLabel,
} = useDashboardData(range)

// Range totals for the revenue card footer.
const revenueTotals = computed(() => {
  const pts = revenueSeries.value
  const revenue = pts.reduce((t, p) => t + p.revenue, 0)
  const expenses = pts.reduce((t, p) => t + p.expenses, 0)
  return { revenue, expenses, net: revenue - expenses }
})

// First-run tour. Opens once per browser (localStorage flag, read in
// onMounted so SSR never renders it open). The Tour measures targets
// with window APIs, so it mounts inside <ClientOnly>.
const TOUR_STORAGE_KEY = 'uipkge-dashboard-tour-dismissed'

const tourOpen = ref(false)
const tourStep = ref(0)
const dontShowAgain = ref(true)

const tourSteps = computed<TourStep[]>(() => {
  const nav = {
    prevButtonText: t('dashboard.tour.back'),
    nextButtonText: t('dashboard.tour.next'),
    finishButtonText: t('dashboard.tour.finish'),
  }
  return [
    {
      target: '[data-tour="kpis"]',
      title: t('dashboard.tour.steps.kpis.title'),
      description: t('dashboard.tour.steps.kpis.description'),
      ...nav,
    },
    {
      target: '[data-tour="charts"]',
      title: t('dashboard.tour.steps.charts.title'),
      description: t('dashboard.tour.steps.charts.description'),
      ...nav,
    },
    {
      target: '[data-tour="table-link"]',
      title: t('dashboard.tour.steps.table.title'),
      description: t('dashboard.tour.steps.table.description'),
      ...nav,
    },
    {
      target: '[data-tour="palette"]',
      title: t('dashboard.tour.steps.palette.title'),
      description: t('dashboard.tour.steps.palette.description'),
      ...nav,
    },
    {
      target: '[data-tour="theme"]',
      title: t('dashboard.tour.steps.theme.title'),
      description: t('dashboard.tour.steps.theme.description'),
      ...nav,
    },
    {
      target: '[data-tour="sidebar-nav"]',
      title: t('dashboard.tour.steps.sidebar.title'),
      description: t('dashboard.tour.steps.sidebar.description'),
      ...nav,
    },
    {
      target: '[data-tour="profile"]',
      title: t('dashboard.tour.steps.profile.title'),
      description: t('dashboard.tour.steps.profile.description'),
      ...nav,
    },
    {
      target: '[data-tour="github"]',
      title: t('dashboard.tour.steps.github.title'),
      description: t('dashboard.tour.steps.github.description'),
      action: { label: t('dashboard.tour.steps.github.action'), href: 'https://github.com/uday-a/nuxt-boilerplate' },
      ...nav,
    },
  ]
})

function persistTourDismissed() {
  try {
    localStorage.setItem(TOUR_STORAGE_KEY, '1')
  }
  catch {
    // Private mode / blocked storage — tour just shows again next visit.
  }
}

// Finish always dismisses for good; skip (X / Escape) only persists
// when "Don't show again" is checked.
function onTourFinish() {
  persistTourDismissed()
  tourOpen.value = false
}

function onTourClose() {
  if (dontShowAgain.value) persistTourDismissed()
  tourOpen.value = false
}

function replayTour() {
  tourStep.value = 0
  dontShowAgain.value = true
  tourOpen.value = true
}

onMounted(() => {
  try {
    if (!localStorage.getItem(TOUR_STORAGE_KEY)) tourOpen.value = true
  }
  catch {
    // Storage unreadable — leave the tour closed rather than nagging.
  }
})
</script>

<template>
  <Page>
    <PageHeader>
      <PageHeaderHeading
        :title="title"
        description="Real-time overview of revenue, traffic, and operations."
      />
      <template #actions>
        <div class="flex flex-wrap items-center gap-2 sm:justify-end">
          <Tabs
            v-model="range"
            class="w-auto"
          >
            <TabsList class="h-8 w-auto">
              <TabsTrigger
                value="24h"
                size="sm"
              >
                24h
              </TabsTrigger>
              <TabsTrigger
                value="7d"
                size="sm"
              >
                7d
              </TabsTrigger>
              <TabsTrigger
                value="30d"
                size="sm"
              >
                30d
              </TabsTrigger>
              <TabsTrigger
                value="qtd"
                size="sm"
              >
                QTD
              </TabsTrigger>
              <TabsTrigger
                value="ytd"
                size="sm"
              >
                YTD
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Popover v-model:open="customOpen">
            <PopoverTrigger as-child>
              <Button
                :variant="range === 'custom' ? 'secondary' : 'outline'"
                size="sm"
                class="gap-1.5"
              >
                <CalendarIcon
                  class="size-4"
                  aria-hidden="true"
                />{{ range === 'custom' && customSpan ? customSpan : t('dashboard.range.custom') }}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              class="w-auto p-0"
            >
              <RangeCalendar v-model="customCal" />
            </PopoverContent>
          </Popover>
          <Button
            size="sm"
            class="gap-1.5"
          >
            <Sparkles
              class="size-4"
              aria-hidden="true"
            />Insights
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            class="text-muted-foreground"
            :title="t('dashboard.tour.replay')"
            :aria-label="t('dashboard.tour.replay')"
            @click="replayTour"
          >
            <RotateCcw
              class="size-4"
              aria-hidden="true"
            />
          </Button>
        </div>
      </template>
    </PageHeader>

    <PageBody class="@container space-y-4">
      <!-- WHY (Rule98): visible freshness stamp. The demo anchor is fixed
           (see useDashboardData asOfLabel) so SSR + client agree. -->
      <p class="text-muted-foreground text-xs">
        {{ t('dashboard.asOf', { date: asOfLabel }) }}
      </p>
      <!-- KPI strip: 5 tiles, each with a trend-only Sparkline (Rule59).
           Minis are shape, not scale -- Sparkline is zero-based. -->
      <div
        data-tour="kpis"
        class="grid grid-cols-2 gap-3 sm:gap-4 @2xl:grid-cols-3 @5xl:grid-cols-5"
      >
        <StatTile
          label="MRR"
          :value="`$${formatK(totalMrr)}`"
          :delta="kpi.mrr.delta"
          :icon="DollarSign"
          :definition="t('dashboard.kpiDefs.mrr')"
        >
          <Sparkline
            :data="kpi.spark.revenue"
            :height="36"
            variant="area"
            label="MRR trend sparkline"
            class="mt-2"
          />
        </StatTile>

        <StatTile
          label="Active users"
          value="12,847"
          :delta="kpi.users.delta"
          :icon="Users"
          :definition="t('dashboard.kpiDefs.users')"
        >
          <Sparkline
            :data="kpi.spark.users"
            :height="36"
            variant="bars"
            :color="chartColors[0]"
            label="Active users trend bar chart"
            class="mt-2"
          />
        </StatTile>

        <StatTile
          label="Requests / min"
          value="2,484"
          :delta="kpi.rpm.delta"
          :icon="Zap"
          :definition="t('dashboard.kpiDefs.rpm')"
        >
          <Sparkline
            :data="kpi.spark.requests"
            :height="36"
            variant="line"
            :color="chartColors[0]"
            label="Requests per minute trend line"
            class="mt-2"
          />
        </StatTile>

        <!-- Avg latency: rising is bad, so delta tone is negative. -->
        <StatTile
          label="Avg latency"
          value="412ms"
          :delta="kpi.latency.delta"
          delta-tone="negative"
          :icon="Timer"
          :definition="t('dashboard.kpiDefs.latency')"
        >
          <Sparkline
            :data="kpi.spark.latency"
            :height="36"
            variant="dots"
            label="Average latency trend line with sampled points"
            class="mt-2"
          />
        </StatTile>

        <!-- Churn: down is good, so delta stays positive even though it's
             a negative number. -->
        <StatTile
          class="col-span-2 @5xl:col-span-1"
          label="Churn"
          value="1.8%"
          :delta="kpi.churn.delta"
          :icon="TrendingDown"
          :definition="t('dashboard.kpiDefs.churn')"
        >
          <div class="space-y-1.5 pt-2">
            <Progress
              :model-value="98.2"
              class="h-1.5"
            />
            <div class="flex justify-between text-xs text-muted-foreground tabular-nums">
              <span>Retained 98.2%</span>
              <span>Target 99%</span>
            </div>
          </div>
        </StatTile>
      </div>

      <!-- Row 1: revenue + active alerts + quota gauge (critical items above the fold) -->
      <div
        data-tour="charts"
        class="grid gap-4 @4xl:grid-cols-3"
      >
        <Card class="flex flex-col">
          <CardHeader>
            <CardTitle class="text-base font-semibold">
              Revenue vs expenses
            </CardTitle>
            <CardDescription>
              {{ displayLabel }} · in USD
            </CardDescription>
            <CardAction>
              <Badge
                variant="outline"
              >
                MRR {{ kpi.mrr.delta }}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <RawChart
              :option="revenueComboOption"
              :height="300"
              label="Revenue versus expenses chart"
            />
          </CardContent>
          <CardFooter class="mt-auto">
            <dl class="grid w-full grid-cols-3 gap-2 border-t pt-3 text-center">
              <div>
                <dt class="text-muted-foreground text-xs">
                  Revenue
                </dt>
                <dd class="text-sm font-medium tabular-nums">
                  ${{ formatK(revenueTotals.revenue) }}
                </dd>
              </div>
              <div>
                <dt class="text-muted-foreground text-xs">
                  Expenses
                </dt>
                <dd class="text-sm font-medium tabular-nums">
                  ${{ formatK(revenueTotals.expenses) }}
                </dd>
              </div>
              <div>
                <dt class="text-muted-foreground text-xs">
                  Net
                </dt>
                <dd class="text-sm font-medium tabular-nums">
                  ${{ formatK(revenueTotals.net) }}
                </dd>
              </div>
            </dl>
          </CardFooter>
        </Card>
        <Card class="flex flex-col">
          <CardHeader>
            <CardTitle class="text-base font-semibold">
              Conversion funnel
            </CardTitle>
            <CardDescription>
              {{ displayLabel }} · {{ formatPct(funnelSummary.endToEnd) }} end-to-end
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FunnelChart
              :data="funnel"
              :height="300"
              :option="funnelOption"
            />
          </CardContent>
        </Card>
        <Card class="flex flex-col">
          <CardHeader>
            <CardTitle class="text-base font-semibold">
              Quota
            </CardTitle>
            <CardDescription>
              API · monthly
            </CardDescription>
            <CardAction>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger as-child>
                    <Badge
                      variant="outline"
                      tabindex="0"
                      class="text-muted-foreground px-1.5"
                    >
                      <CalendarIcon aria-hidden="true" />
                      <span class="sr-only">{{ t('dashboard.range.staticNote') }}</span>
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent class="text-xs">
                    {{ t('dashboard.range.staticNote') }}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardAction>
          </CardHeader>
          <CardContent class="flex flex-1 flex-col gap-4">
            <RawChart
              :option="gaugeOption"
              :height="220"
              label="API quota usage gauge"
            />
            <dl class="grid grid-cols-3 gap-2 border-t pt-4 text-center">
              <div>
                <dt class="text-muted-foreground text-xs">
                  Used
                </dt>
                <dd class="text-sm font-medium tabular-nums">
                  {{ formatK(quotaMeta.used) }}<span class="text-muted-foreground block text-xs font-normal">{{ t('dashboard.quota.unit') }}</span>
                </dd>
              </div>
              <div>
                <dt class="text-muted-foreground text-xs">
                  Left
                </dt>
                <dd class="text-sm font-medium tabular-nums">
                  {{ formatK(quotaMeta.remaining) }}<span class="text-muted-foreground block text-xs font-normal">{{ t('dashboard.quota.unit') }}</span>
                </dd>
              </div>
              <div>
                <dt class="text-muted-foreground text-xs">
                  Resets
                </dt>
                <dd class="text-sm font-medium tabular-nums">
                  {{ quotaMeta.renews }}
                </dd>
              </div>
            </dl>
          </CardContent>
          <CardFooter class="mt-auto">
            <Button
              variant="ghost"
              size="sm"
              as-child
              class="text-muted-foreground w-full gap-1 text-xs"
            >
              <NuxtLink to="/settings/billing">
                Need more quota? View plans<ArrowRight
                  class="size-3.5"
                  aria-hidden="true"
                />
              </NuxtLink>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <!-- Charts row 2: bar chart + treemap + alerts list -->
      <div class="grid gap-4 @4xl:grid-cols-3">
        <!-- Chart cards stretch to the row (the alerts timeline sets its
             height), so the charts fill the card instead of a fixed 200px. -->
        <Card class="flex flex-col">
          <CardHeader>
            <CardTitle class="text-base font-semibold">
              {{ requestsBlock.title }}
            </CardTitle>
            <CardDescription>
              {{ requestsBlock.subtitle }}
            </CardDescription>
          </CardHeader>
          <CardContent class="min-h-[200px] flex-1">
            <BarChart
              :data="requestsBlock.data"
              x-field="x"
              y-field="y"
              height="100%"
              unit="requests"
              :option="compactValueAxis"
              :label="requestsBlock.title"
            />
          </CardContent>
        </Card>
        <Card class="flex flex-col">
          <CardHeader>
            <CardTitle class="text-base font-semibold">
              Headcount by department
            </CardTitle>
            <CardDescription>
              {{ totalHeadcount.toLocaleString() }} people across {{ totalDepartments }} departments
            </CardDescription>
            <CardAction>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger as-child>
                    <Badge
                      variant="outline"
                      tabindex="0"
                      class="text-muted-foreground px-1.5"
                    >
                      <CalendarIcon aria-hidden="true" />
                      <span class="sr-only">{{ t('dashboard.range.staticNote') }}</span>
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent class="text-xs">
                    {{ t('dashboard.range.staticNote') }}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardAction>
          </CardHeader>
          <CardContent class="min-h-[200px] flex-1">
            <TreemapChart
              :data="segments"
              height="100%"
              label="Headcount by department treemap"
            />
          </CardContent>
        </Card>
        <Card class="flex flex-col">
          <CardHeader class="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle class="text-base font-semibold">
                Active alerts
              </CardTitle>
              <CardDescription>
                5 open · 12 resolved today
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              class="text-xs gap-1 h-8"
            >
              All<ArrowRight
                class="size-3.5"
                aria-hidden="true"
              />
            </Button>
          </CardHeader>
          <CardContent class="flex flex-1 flex-col pb-4">
            <!-- Timeline: one continuous rail, a severity node per alert. -->
            <!-- WHY (Rule81): trivial failed-state branch -- an empty alert
                 list renders an EmptyState instead of a blank card. -->
            <ol
              v-if="alerts.length"
              class="flex flex-1 flex-col justify-between"
            >
              <li
                v-for="(a, i) in alerts"
                :key="i"
                class="relative flex gap-3 pb-4 last:pb-0"
              >
                <span
                  v-if="i < alerts.length - 1"
                  class="bg-border absolute top-8 bottom-0 left-4 w-px -translate-x-1/2"
                  aria-hidden="true"
                />
                <span :class="['ring-card relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full ring-4', severityClass[a.severity].node]">
                  <component
                    :is="a.icon"
                    class="size-4"
                    aria-hidden="true"
                  />
                </span>
                <div class="min-w-0 flex-1 pt-0.5">
                  <div
                    class="truncate text-sm font-medium"
                    :title="a.title"
                  >
                    {{ a.title }}
                  </div>
                  <div class="text-muted-foreground line-clamp-1 text-xs">
                    {{ a.detail }}
                  </div>
                  <div class="mt-1.5 flex items-center gap-2">
                    <span :class="['rounded-sm px-1.5 py-0.5 text-xs font-medium', severityClass[a.severity].badge]">
                      {{ severityClass[a.severity].label }}
                    </span>
                    <span class="text-muted-foreground min-w-0 truncate text-xs">{{ a.source }}</span>
                    <span class="text-muted-foreground ml-auto shrink-0 text-xs tabular-nums">{{ a.age }}</span>
                  </div>
                </div>
              </li>
            </ol>
            <EmptyState
              v-else
              :icon="CheckCircle2"
              :title="t('dashboard.alerts.emptyTitle')"
              :description="t('dashboard.alerts.emptyDescription')"
            />
          </CardContent>
        </Card>
      </div>

      <!-- Customers by region: muted world map embedded in a scrollable page,
           so wheel zoom stays off and the wheel scrolls the page. -->
      <Card>
        <CardHeader>
          <CardTitle class="text-base font-semibold">
            {{ t('dashboard.locations.widgetTitle') }}
          </CardTitle>
          <CardDescription>
            {{ t('dashboard.locations.widgetDescription') }}
          </CardDescription>
          <CardAction>
            <Badge
              variant="outline"
              class="tabular-nums"
            >
              <Building2 aria-hidden="true" />
              {{ t('dashboard.locations.officeCount', officeLocations.length) }}
            </Badge>
          </CardAction>
        </CardHeader>
        <!-- Map fills the card edge to edge (no inner frame), like locations. -->
        <CardContent class="p-0">
          <div class="relative isolate">
            <LeafletMap
              ref="regionMap"
              variant="muted"
              :center="[-20, 20]"
              :zoom="2"
              :min-zoom="1"
              :scroll-wheel-zoom="false"
              :navigation="false"
              class="h-[360px] w-full overflow-hidden"
              @created="fitRegionMap()"
            >
              <LeafletCircleMarker
                v-for="c in customerRegions"
                :key="c.id"
                :center="c.lngLat"
                :radius="customerRadius(c.arr) * 0.8"
                :color="chartColors[1]"
                :fill-color="chartColors[1]"
                :fill-opacity="0.25"
                :weight="1.5"
              >
                <LeafletTooltip direction="top">
                  <span class="text-xs"><span class="font-medium">{{ c.city }}</span> · {{ t('dashboard.locations.accounts', { n: c.accounts }) }}</span>
                </LeafletTooltip>
              </LeafletCircleMarker>
              <LeafletMarker
                v-for="(office, i) in officeLocations"
                :key="office.id"
                :lng-lat="office.lngLat"
                anchor="center"
              >
                <!-- WHY (Rule90): 200ms marker pop-in, and the HQ pulse is
                     gated with motion-safe so reduced-motion gets a static dot. -->
                <span
                  class="animate-in fade-in-0 zoom-in-50 fill-mode-both relative flex items-center justify-center duration-200"
                  :style="{ animationDelay: `${i * 70}ms` }"
                >
                  <span
                    v-if="office.kind === 'hq'"
                    :class="['absolute inset-0 rounded-full opacity-40 motion-safe:animate-ping', kindDotBg(office.kind)]"
                    aria-hidden="true"
                  />
                  <span :class="['outline-background relative block rounded-full ring-4 outline-2 transition-transform duration-200 hover:scale-125', markerSizeClass(office.headcount), kindDotClass(office.kind)]" />
                </span>
                <LeafletPopup
                  :offset="[0, -10]"
                  :min-width="240"
                >
                  <OfficePopup
                    :office="office"
                  />
                </LeafletPopup>
              </LeafletMarker>
            </LeafletMap>
            <MapControls
              @zoom-in="regionMap?.zoomIn()"
              @zoom-out="regionMap?.zoomOut()"
              @reset="regionMap?.getMap()?.closePopup(); fitRegionMap(true)"
            />
          </div>
        </CardContent>
        <CardFooter class="justify-end pt-4">
          <Button
            variant="ghost"
            size="sm"
            as-child
            class="text-muted-foreground gap-1.5 text-xs"
          >
            <NuxtLink to="/dashboard/locations">
              <MapPin
                class="size-3.5"
                aria-hidden="true"
              />
              {{ t('dashboard.locations.viewAll') }}
              <ArrowRight
                class="size-3.5"
                aria-hidden="true"
              />
            </NuxtLink>
          </Button>
        </CardFooter>
      </Card>

      <!-- Calendar heatmap (full width, dense) -->
      <Card>
        <CardHeader>
          <CardTitle class="text-base font-semibold">
            Deploy activity · last 365 days
          </CardTitle>
          <CardDescription>
            {{ totalDeploys.toLocaleString() }} deploys · longest streak 18 days · {{ t('dashboard.heatmap.asOf', { date: asOfLabel }) }}
          </CardDescription>
          <CardAction class="text-muted-foreground flex flex-wrap items-center justify-end gap-2 text-xs">
            <Badge variant="outline">
              {{ t('dashboard.range.staticNote') }}
            </Badge>
            <span>Less</span>
            <div class="flex gap-0.5">
              <span class="bg-chart-1/10 size-2.5 rounded-sm" />
              <span class="bg-chart-1/35 size-2.5 rounded-sm" />
              <span class="bg-chart-1/65 size-2.5 rounded-sm" />
              <span class="bg-chart-1 size-2.5 rounded-sm" />
            </div>
            <span>More</span>
          </CardAction>
        </CardHeader>
        <CardContent>
          <CalendarHeatmap
            :data="calendarData"
            :range="calendarRange"
            :color-range="calendarColorRange"
            :option="calendarOption"
            :height="160"
            label="Deploy activity heatmap for the last 365 days"
          />
        </CardContent>
      </Card>

      <!-- Bottom row: top products + customer list + recent activity -->
      <div class="grid gap-4 @4xl:grid-cols-3">
        <Card class="flex flex-col">
          <CardHeader>
            <CardTitle class="text-base font-semibold">
              Top products by MRR
            </CardTitle>
            <CardDescription>
              5 products · ${{ formatK(totalMrr) }} total
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-3">
            <div
              v-for="p in topProducts"
              :key="p.name"
              class="space-y-1"
            >
              <div class="flex items-baseline justify-between gap-3">
                <span
                  class="truncate text-sm"
                  :title="p.name"
                >{{ p.name }}</span>
                <div class="flex items-baseline gap-1.5">
                  <span class="text-sm font-semibold tabular-nums">${{ formatK(p.mrr) }}</span>
                  <span :class="['text-xs font-medium', p.up ? 'text-success' : 'text-destructive']">
                    <component
                      :is="p.up ? ArrowUpRight : ArrowDownRight"
                      class="inline size-3.5"
                      aria-hidden="true"
                    />{{ p.change }}
                  </span>
                </div>
              </div>
              <Progress
                :model-value="(p.mrr / totalMrr) * 100"
                class="h-1.5"
              />
            </div>
            <!-- Share of MRR: one stacked bar, same order and colours as the list. -->
            <div class="space-y-2 border-t pt-3">
              <div class="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Share of MRR
              </div>
              <div class="flex h-2 overflow-hidden rounded-full">
                <div
                  v-for="(p, i) in topProducts"
                  :key="p.name"
                  :class="['h-full', shareColors[i % shareColors.length]]"
                  :style="{ width: `${(p.mrr / totalMrr) * 100}%` }"
                />
              </div>
              <div class="text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 text-xs">
                <span
                  v-for="(p, i) in topProducts"
                  :key="p.name"
                  class="flex items-center gap-1.5"
                >
                  <span :class="['size-2 rounded-full', shareColors[i % shareColors.length]]" />
                  {{ p.name }} <span class="tabular-nums">{{ Math.round((p.mrr / totalMrr) * 100) }}%</span>
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter class="mt-auto">
            <Button
              variant="ghost"
              size="sm"
              as-child
              class="text-muted-foreground w-full gap-1 text-xs"
            >
              <NuxtLink to="/settings/billing">
                View plans<ArrowRight
                  class="size-3.5"
                  aria-hidden="true"
                />
              </NuxtLink>
            </Button>
          </CardFooter>
        </Card>

        <Card class="flex flex-col">
          <CardHeader>
            <CardTitle class="text-base font-semibold">
              Top customers
            </CardTitle>
            <CardDescription>
              By MRR · 6 of 142 accounts
            </CardDescription>
          </CardHeader>
          <CardContent class="divide-y">
            <div
              v-for="c in topCustomers"
              :key="c.name"
              class="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
            >
              <Avatar class="size-8">
                <AvatarFallback class="bg-muted text-muted-foreground text-xs font-medium">
                  {{ c.avatar }}
                </AvatarFallback>
              </Avatar>
              <div class="min-w-0 flex-1">
                <p
                  class="truncate text-sm font-medium"
                  :title="c.name"
                >
                  {{ c.name }}
                </p>
                <p class="text-muted-foreground text-xs">
                  {{ c.plan }} · <span :class="['inline-block size-1.5 rounded-full', statusTone[c.status]]" /> {{ c.status }}
                </p>
              </div>
              <span class="text-sm font-semibold tabular-nums whitespace-nowrap">${{ formatK(c.mrr) }}</span>
            </div>
          </CardContent>
          <CardFooter class="mt-auto">
            <Button
              variant="ghost"
              size="sm"
              as-child
              class="text-muted-foreground w-full gap-1 text-xs"
            >
              <NuxtLink to="/dashboard/data-table">
                View all customers<ArrowRight
                  class="size-3.5"
                  aria-hidden="true"
                />
              </NuxtLink>
            </Button>
          </CardFooter>
        </Card>

        <SectionCard
          title="Recent activity"
          description="Live feed across products"
        >
          <DataList>
            <DataListItem
              v-for="(item, i) in activities.slice(0, 5)"
              :key="i"
            >
              <div class="flex items-center gap-3">
                <IconBox
                  :icon="item.icon"
                  variant="muted"
                  :icon-class="item.iconClass"
                />
                <div>
                  <p class="text-sm font-medium">
                    {{ item.title }}
                  </p>
                  <p class="text-muted-foreground text-xs">
                    {{ item.detail }}
                  </p>
                </div>
              </div>
              <span class="text-muted-foreground ml-3 text-xs tabular-nums whitespace-nowrap">{{ item.age }}</span>
            </DataListItem>
          </DataList>
          <Button
            variant="ghost"
            size="sm"
            as-child
            class="text-muted-foreground mt-auto w-full gap-1 text-xs"
          >
            <NuxtLink to="/settings/activity">
              View all activity<ArrowRight
                class="size-3.5"
                aria-hidden="true"
              />
            </NuxtLink>
          </Button>
        </SectionCard>
      </div>

      <!-- Full data-table entry point (also a tour target). -->
      <div
        data-tour="table-link"
        class="flex justify-center"
      >
        <Button
          variant="ghost"
          size="sm"
          as-child
          class="text-muted-foreground gap-1.5 text-xs"
        >
          <NuxtLink to="/dashboard/data-table">
            <Table2
              class="size-3.5"
              aria-hidden="true"
            />
            {{ t('dashboard.tableLink.label') }}
            <ArrowRight
              class="size-3.5"
              aria-hidden="true"
            />
          </NuxtLink>
        </Button>
      </div>
    </PageBody>

    <ClientOnly>
      <Tour
        v-model:open="tourOpen"
        v-model:current="tourStep"
        :steps="tourSteps"
        @finish="onTourFinish"
        @close="onTourClose"
      />
      <div
        v-if="tourOpen"
        class="bg-popover text-popover-foreground fixed right-4 bottom-4 z-[1002] flex items-center gap-2 rounded-lg border px-3 py-2 shadow-lg"
      >
        <Checkbox
          id="tour-dont-show"
          v-model="dontShowAgain"
        />
        <Label
          for="tour-dont-show"
          class="cursor-pointer text-xs font-normal"
        >
          {{ t('dashboard.tour.dontShowAgain') }}
        </Label>
      </div>
    </ClientOnly>
  </Page>
</template>
