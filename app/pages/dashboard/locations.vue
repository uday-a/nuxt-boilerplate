<script setup lang="ts">
import { Briefcase, Building2, Clock, Globe2, MapPin, Search, TrendingUp, Users } from '@/lib/icon-pack'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmptyState } from '@/components/ui/empty-state'
import { Page, PageHeader, PageHeaderHeading, PageBody } from '@/components/ui/page'
import { LeafletCircleMarker, LeafletMap, LeafletMarker, LeafletPolyline, LeafletPopup, LeafletTooltip, type LeafletMapRef } from '@/components/ui/leaflet-map'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { formatNumber } from '@/lib/utils'
import { chartColors, chartTextColor } from '@/components/ui/charts/useChartTheme'
import {
  kindBadgeVariant,
  kindDotBg,
  kindDotClass,
  arcPath,
  customerRadius,
  customerRegions,
  markerSizeClass,
  officeBounds,
  officeLocations,
  timeInZone,
  utcOffsetLabel,
  type OfficeKind,
} from '@/lib/locations'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
const { t } = useI18n()
const title = useRouteLabel()
useHead({ title })

const search = ref('')
const kindFilter = ref<'all' | OfficeKind>('all')

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return officeLocations.filter((office) => {
    if (kindFilter.value !== 'all' && office.kind !== kindFilter.value) return false
    if (!q) return true
    return office.city.toLowerCase().includes(q) || office.country.toLowerCase().includes(q)
  })
})

const officeCount = computed(() => filtered.value.length)
const countryCount = computed(() => new Set(filtered.value.map(o => o.country)).size)
// WHY (Rule69): the stats follow the same FILTERED list as the map + list --
// a kind/search slice that leaves the totals on "all offices" lies.
const totalHeadcount = computed(() => filtered.value.reduce((sum, o) => sum + o.headcount, 0))
const openRoles = computed(() => filtered.value.reduce((sum, o) => sum + o.openRoles, 0))
// Headcount-weighted year-on-year growth across the filtered offices.
const growth = computed(() => totalHeadcount.value === 0 ? 0 : Math.round(filtered.value.reduce((sum, o) => sum + o.growth * o.headcount, 0) / totalHeadcount.value))
const hq = officeLocations.find(o => o.kind === 'hq')!
const kindCounts = computed(() => ({
  hq: filtered.value.filter(o => o.kind === 'hq').length,
  hub: filtered.value.filter(o => o.kind === 'hub').length,
  office: filtered.value.filter(o => o.kind === 'office').length,
}))
const newestOffice = computed(() => [...filtered.value].sort((a, b) => b.opened - a.opened)[0])
// Distinct current offsets (London and Dublin share one), not zone names.
const timezoneCount = computed(() => new Set(filtered.value.map(o => (o.timezone ? utcOffsetLabel(o.timezone) : ''))).size)

// Map layers: offices, customer concentration, or both.
const layer = ref<'offices' | 'customers' | 'both'>('offices')
const showOffices = computed(() => layer.value !== 'customers')
const showCustomers = computed(() => layer.value !== 'offices')

// Region rollup for the breakdown card.
const REGION_OF: Record<string, 'americas' | 'emea' | 'apac'> = {
  'United States': 'americas', 'Canada': 'americas', 'Brazil': 'americas',
  'United Kingdom': 'emea', 'Ireland': 'emea', 'Germany': 'emea',
  'India': 'apac', 'Singapore': 'apac', 'Japan': 'apac', 'Australia': 'apac',
}
const regions = computed(() => (['americas', 'emea', 'apac'] as const).map((key, i) => {
  const offices = filtered.value.filter(o => REGION_OF[o.country] === key)
  const headcount = offices.reduce((sum, o) => sum + o.headcount, 0)
  return {
    key,
    bar: ['bg-chart-1', 'bg-chart-2', 'bg-chart-3'][i]!,
    offices: offices.length,
    headcount,
    openRoles: offices.reduce((sum, o) => sum + o.openRoles, 0),
    share: totalHeadcount.value === 0 ? 0 : Math.round((headcount / totalHeadcount.value) * 100),
  }
}))
const largestRegion = computed(() => [...regions.value].sort((a, b) => b.headcount - a.headcount)[0]!)
// Hiring intensity: open roles relative to current headcount.
const hiringRegion = computed(() => [...regions.value].sort((a, b) => b.openRoles / b.headcount - a.openRoles / a.headcount)[0]!)
const topCustomers = computed(() => [...customerRegions].sort((a, b) => b.arr - a.arr).slice(0, 7))
const maxArr = computed(() => topCustomers.value[0]?.arr ?? 1)
const formatArr = (k: number) => (k >= 1000 ? `$${(k / 1000).toFixed(1)}M` : `$${k}k`)

// Local time per office. Client-only (null during SSR) so hydration matches;
// ticks once a minute.
const now = ref<Date | null>(null)
let clock: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  now.value = new Date()
  clock = setInterval(() => (now.value = new Date()), 60_000)
})
onBeforeUnmount(() => clearInterval(clock))
function localTime(tz?: string): string | null {
  return now.value && tz ? timeInZone(tz, now.value) : null
}

// Camera control: list clicks fly the map and open the marker's popup.
// Marker instances are collected via @ready (popups bind declaratively,
// so openPopup() on the raw marker is the way to open one on demand).
const mapRef = ref<LeafletMapRef | null>(null)
const markerById = new Map<string, { openPopup: () => void }>()
const selectedId = ref<string | null>(null)

// Reset: clear the selection, close any popup, re-frame every office.
function resetView() {
  selectedId.value = null
  mapRef.value?.getMap()?.closePopup()
  fitToOffices()
}

function onMarkerReady(id: string, marker: { openPopup: () => void }) {
  markerById.set(id, marker)
}

function selectOffice(id: string) {
  selectedId.value = id
  const office = officeLocations.find(o => o.id === id)
  if (!office) return
  mapRef.value?.flyTo({ center: office.lngLat, zoom: Math.max(mapRef.value?.getMap()?.getZoom() ?? 4, 4), duration: 700 })
  markerById.get(id)?.openPopup()
}

// Frame every visible office. fitBounds also snaps to whole zoom levels,
// which avoids the tile seams fractional zooms leave behind.
function fitToOffices(animate = true) {
  const bounds = officeBounds(filtered.value)
  if (bounds) mapRef.value?.fitBounds(bounds, { padding: [48, 48], maxZoom: 5, animate })
}
watch(filtered, () => fitToOffices())

function onMarkerClick(id: string) {
  selectedId.value = id
  document.getElementById(`location-${id}`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
}
</script>

<template>
  <Page>
    <PageHeader>
      <PageHeaderHeading
        :title="title"
        :description="t('dashboard.locations.description')"
      />
    </PageHeader>

    <PageBody class="space-y-4">
      <!-- Stats row -->
      <div class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatTile
          :label="t('dashboard.locations.stats.offices')"
          :value="String(officeCount)"
          :caption="t('dashboard.locations.stats.officesCaption', kindCounts)"
          :icon="Building2"
        >
          <template #footer>
            <span v-if="newestOffice">
              {{ t('dashboard.locations.stats.newest', { city: newestOffice.city, year: newestOffice.opened }) }}
            </span>
          </template>
        </StatTile>
        <StatTile
          :label="t('dashboard.locations.stats.countries')"
          :value="String(countryCount)"
          :caption="t('dashboard.locations.stats.countriesCaption', { n: regions.length })"
          :icon="Globe2"
        >
          <template #footer>
            {{ t('dashboard.locations.stats.timezones', { n: timezoneCount }) }}
          </template>
        </StatTile>
        <StatTile
          :label="t('dashboard.locations.stats.headcount')"
          :value="formatNumber(totalHeadcount)"
          :delta="`+${growth}%`"
          :caption="t('dashboard.locations.stats.growthCaption')"
          :icon="Users"
        />
        <StatTile
          :label="t('dashboard.locations.stats.openRoles')"
          :value="String(openRoles)"
          :caption="t('dashboard.locations.stats.openRolesCaption', { n: filtered.filter(o => o.openRoles > 0).length })"
          :icon="Briefcase"
        />
      </div>

      <!-- List + map: side by side only from xl, with a 2:3 split, so city
           names never truncate in the list rail. -->
      <div class="grid gap-4 xl:grid-cols-5">
        <!-- Location list -->
        <Card class="xl:col-span-2">
          <CardHeader>
            <div class="flex flex-col gap-2 sm:flex-row">
              <Input
                v-model="search"
                :placeholder="t('dashboard.locations.search.placeholder')"
                :prefix-icon="Search"
                allow-clear
                class="flex-1"
              />
              <Select v-model="kindFilter">
                <SelectTrigger class="w-full sm:w-32">
                  <SelectValue :placeholder="t('dashboard.locations.filter.label')" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {{ t('dashboard.locations.filter.all') }}
                  </SelectItem>
                  <SelectItem value="hq">
                    {{ t('dashboard.locations.kind.hq') }}
                  </SelectItem>
                  <SelectItem value="hub">
                    {{ t('dashboard.locations.kind.hub') }}
                  </SelectItem>
                  <SelectItem value="office">
                    {{ t('dashboard.locations.kind.office') }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ul
              v-if="filtered.length"
              class="max-h-[456px] space-y-2 overflow-y-auto pr-1"
            >
              <li
                v-for="office in filtered"
                :id="`location-${office.id}`"
                :key="office.id"
              >
                <button
                  type="button"
                  :aria-pressed="selectedId === office.id"
                  :class="[
                    'flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors',
                    selectedId === office.id
                      ? 'border-primary/40 bg-primary/5 ring-1 ring-primary'
                      : 'border-border/70 hover:border-border hover:bg-muted/50',
                  ]"
                  @click="selectOffice(office.id)"
                >
                  <span :class="['block size-2 shrink-0 rounded-full', kindDotBg(office.kind)]" />
                  <span class="min-w-0 flex-1">
                    <span class="flex items-center gap-1.5">
                      <span class="truncate text-sm font-medium">{{ office.city }}</span>
                      <Badge :variant="kindBadgeVariant(office.kind)">
                        {{ t(`dashboard.locations.kind.${office.kind}`) }}
                      </Badge>
                    </span>
                    <span class="text-muted-foreground flex items-center gap-1.5 truncate text-xs">
                      {{ office.country }}
                      <template v-if="localTime(office.timezone)">
                        <span aria-hidden="true">·</span>
                        <Clock
                          class="size-3.5 shrink-0"
                          aria-hidden="true"
                        />
                        <span class="tabular-nums">{{ localTime(office.timezone) }}</span>
                      </template>
                    </span>
                  </span>
                  <span class="shrink-0 text-right">
                    <span class="block text-sm font-semibold tabular-nums">{{ formatNumber(office.headcount) }}</span>
                    <span class="text-muted-foreground block text-xs tabular-nums">
                      <!-- WHY (Rules 37/40): growth pairs color with a shape
                           so direction never rides on green alone. -->
                      <span class="text-success inline-flex items-center gap-0.5">
                        <TrendingUp
                          class="size-3"
                          aria-hidden="true"
                        />+{{ office.growth }}%
                      </span> · {{ t('dashboard.locations.openRolesShort', { n: office.openRoles }) }}
                    </span>
                  </span>
                </button>
              </li>
            </ul>
            <EmptyState
              v-else
              :icon="MapPin"
              :title="t('dashboard.locations.empty.title')"
              :description="t('dashboard.locations.empty.description')"
            />
          </CardContent>
        </Card>

        <!-- Large map: fills its card (no inner frame) -->
        <Card class="relative isolate p-0 xl:col-span-3">
          <LeafletMap
            ref="mapRef"
            variant="muted"
            :center="[-20, 20]"
            :zoom="2"
            :min-zoom="1"
            :scroll-wheel-zoom="true"
            :navigation="false"
            class="h-[560px] w-full"
            @created="fitToOffices(false)"
          >
            <!-- HQ links: thin dashed lines to every office -->
            <template v-if="showOffices">
              <LeafletPolyline
                v-for="office in filtered.filter(o => o.kind !== 'hq')"
                :key="`link-${office.id}`"
                :lng-lat-path="arcPath(hq.lngLat, office.lngLat)"
                :color="chartTextColor"
                :weight="1"
                :opacity="selectedId === office.id ? 0.9 : 0.35"
                dash-array="3 5"
              />
            </template>
            <!-- Customer concentration: circle area tracks ARR -->
            <template v-if="showCustomers">
              <LeafletCircleMarker
                v-for="c in customerRegions"
                :key="c.id"
                :center="c.lngLat"
                :radius="customerRadius(c.arr)"
                :color="chartColors[1]"
                :fill-color="chartColors[1]"
                :fill-opacity="0.25"
                :weight="1.5"
              >
                <LeafletTooltip direction="top">
                  <span class="text-xs"><span class="font-medium">{{ c.city }}</span> · {{ t('dashboard.locations.accounts', { n: c.accounts }) }} · {{ formatArr(c.arr) }} ARR</span>
                </LeafletTooltip>
              </LeafletCircleMarker>
            </template>
            <LeafletMarker
              v-for="(office, i) in (showOffices ? filtered : [])"
              :key="office.id"
              :lng-lat="office.lngLat"
              anchor="center"
              :z-index-offset="selectedId === office.id ? 1000 : 0"
              :opacity="selectedId && selectedId !== office.id ? 0.55 : 1"
              @click="onMarkerClick(office.id)"
              @ready="(marker) => onMarkerReady(office.id, marker)"
            >
              <!-- Staggered pop-in on load; HQ and the selected office pulse. -->
              <!-- WHY (Rule90/96): 200ms pop-in, and the pulse is gated with
                   motion-safe so reduced-motion gets a static marker. -->
              <span
                class="animate-in fade-in-0 zoom-in-50 fill-mode-both relative flex items-center justify-center duration-200"
                :style="{ animationDelay: `${i * 70}ms` }"
              >
                <span
                  v-if="office.kind === 'hq' || selectedId === office.id"
                  :class="['absolute inset-0 rounded-full opacity-40 motion-safe:animate-ping', kindDotBg(office.kind)]"
                  aria-hidden="true"
                />
                <span
                  :class="[
                    'outline-background relative block rounded-full ring-4 outline-2 transition-transform duration-200 hover:scale-125',
                    markerSizeClass(office.headcount),
                    kindDotClass(office.kind),
                    selectedId === office.id && 'scale-125',
                  ]"
                />
              </span>
              <LeafletTooltip
                direction="top"
                :offset="[0, -10]"
              >
                <span class="text-xs font-medium">{{ office.city }}</span>
              </LeafletTooltip>
              <LeafletPopup
                :offset="[0, -10]"
                :min-width="240"
              >
                <OfficePopup
                  :office="office"
                  :local-time="localTime(office.timezone)"
                />
              </LeafletPopup>
            </LeafletMarker>
          </LeafletMap>
          <MapControls
            @zoom-in="mapRef?.zoomIn()"
            @zoom-out="mapRef?.zoomOut()"
            @reset="resetView"
          />
          <!-- WHY (Rule93): the canvas map is invisible to screen readers --
               this sr-only list carries the same office data as text. -->
          <ul class="sr-only">
            <li
              v-for="office in officeLocations"
              :key="`sr-${office.id}`"
            >
              {{ office.city }}, {{ office.country }} — {{ formatNumber(office.headcount) }} people
            </li>
          </ul>
          <!-- Layer switch -->
          <div class="absolute top-3 left-3 z-[800]">
            <ToggleGroup
              v-model="layer"
              type="single"
              variant="outline"
              size="sm"
              class="bg-card/90 backdrop-blur-sm"
              :aria-label="t('dashboard.locations.layers.label')"
            >
              <ToggleGroupItem
                v-for="l in (['offices', 'customers', 'both'] as const)"
                :key="l"
                :value="l"
                class="px-2.5 text-xs"
              >
                {{ t(`dashboard.locations.layers.${l}`) }}
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
          <!-- Legend: kind colour + "size = headcount" -->
          <div class="bg-card/90 text-muted-foreground pointer-events-none absolute bottom-3 left-3 z-[800] flex items-center gap-3 rounded-md border px-2.5 py-1.5 text-xs backdrop-blur-sm">
            <span
              v-for="kind in (['hq', 'hub', 'office'] as const)"
              :key="kind"
              class="flex items-center gap-1.5"
            >
              <span :class="['size-2 rounded-full', kindDotBg(kind)]" />
              {{ t(`dashboard.locations.kind.${kind}`) }}
            </span>
            <span class="border-l pl-3">{{ t('dashboard.locations.sizeLegend') }}</span>
            <span
              v-if="showCustomers"
              class="flex items-center gap-1.5 border-l pl-3"
            >
              <span class="border-chart-2 bg-chart-2/25 size-2.5 rounded-full border" />
              {{ t('dashboard.locations.layers.customers') }}
            </span>
          </div>
        </Card>
      </div>

      <!-- Breakdown: people by region, customers by city -->
      <div class="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle class="text-base">
              {{ t('dashboard.locations.regions.title') }}
            </CardTitle>
            <CardDescription>{{ t('dashboard.locations.regions.description') }}</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div
              v-for="r in regions"
              :key="r.key"
              class="space-y-1.5"
            >
              <div class="flex items-baseline justify-between gap-3 text-sm">
                <span class="font-medium">{{ t(`dashboard.locations.regions.${r.key}`) }}</span>
                <span class="text-muted-foreground text-xs tabular-nums">
                  {{ t('dashboard.locations.regions.meta', { offices: r.offices, roles: r.openRoles }) }}
                  · <span class="text-foreground font-medium">{{ r.headcount }}</span> ({{ r.share }}%)
                </span>
              </div>
              <div class="bg-muted h-2 overflow-hidden rounded-full">
                <div
                  :class="['h-full rounded-full', r.bar]"
                  :style="{ width: `${r.share}%` }"
                />
              </div>
            </div>
            <div class="text-muted-foreground grid grid-cols-2 gap-3 border-t pt-3 text-xs">
              <div>
                <div>{{ t('dashboard.locations.regions.largest') }}</div>
                <div class="text-foreground text-sm font-medium">
                  {{ t(`dashboard.locations.regions.${largestRegion.key}`) }} · {{ largestRegion.share }}%
                </div>
              </div>
              <div>
                <div>{{ t('dashboard.locations.regions.hiring') }}</div>
                <div class="text-foreground text-sm font-medium">
                  {{ t(`dashboard.locations.regions.${hiringRegion.key}`) }} · {{ t('dashboard.locations.openRolesShort', { n: hiringRegion.openRoles }) }}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle class="text-base">
              {{ t('dashboard.locations.customers.title') }}
            </CardTitle>
            <CardDescription>{{ t('dashboard.locations.customers.description') }}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul class="space-y-2.5">
              <li
                v-for="c in topCustomers"
                :key="c.id"
                class="grid grid-cols-[7rem_1fr_auto] items-center gap-3 text-sm"
              >
                <span class="truncate font-medium">{{ c.city }}</span>
                <span class="bg-muted h-1.5 overflow-hidden rounded-full">
                  <span
                    class="bg-chart-2 block h-full rounded-full"
                    :style="{ width: `${Math.round((c.arr / maxArr) * 100)}%` }"
                  />
                </span>
                <span class="text-muted-foreground text-xs tabular-nums">
                  <span class="text-foreground font-medium">{{ formatArr(c.arr) }}</span> · {{ t('dashboard.locations.accounts', { n: c.accounts }) }}
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </PageBody>
  </Page>
</template>
