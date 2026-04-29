<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Columns3,
  Download,
  Filter,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from 'lucide-vue-next'
import { Table, TableBody, TableCell, TableEmpty, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Customers' })

type Status = 'active' | 'trial' | 'churned' | 'invited'
type Plan = 'Free' | 'Pro' | 'Team' | 'Enterprise'
type Density = 'compact' | 'comfortable'
type DateRange = 'all' | '7d' | '30d' | '90d'

interface Customer {
  id: string
  name: string
  email: string
  plan: Plan
  status: Status
  mrr: number
  seats: number
  country: string
  lastSeen: string
  createdAt: string
}

// Mock data -- swap for `useFetch('/api/customers')` when a real endpoint
// exists. 48 rows so pagination, faceted filters, and CSV export all have
// something interesting to do.
const customers: Customer[] = [
  { id: '1', name: 'Northwind Industries', email: 'ops@northwind.example', plan: 'Enterprise', status: 'active', mrr: 4800, seats: 220, country: 'US', lastSeen: '2026-05-15', createdAt: '2023-02-11' },
  { id: '2', name: 'Sentinel Labs', email: 'team@sentinel.example', plan: 'Enterprise', status: 'active', mrr: 3600, seats: 145, country: 'US', lastSeen: '2026-05-15', createdAt: '2023-04-02' },
  { id: '3', name: 'Apex Logistics', email: 'admin@apex.example', plan: 'Pro', status: 'trial', mrr: 0, seats: 12, country: 'CA', lastSeen: '2026-05-14', createdAt: '2026-05-01' },
  { id: '4', name: 'Olympus Robotics', email: 'finance@olympus.example', plan: 'Enterprise', status: 'active', mrr: 5200, seats: 310, country: 'DE', lastSeen: '2026-05-15', createdAt: '2022-11-19' },
  { id: '5', name: 'Crescent Health', email: 'it@crescent.example', plan: 'Pro', status: 'active', mrr: 1800, seats: 64, country: 'UK', lastSeen: '2026-05-15', createdAt: '2024-01-08' },
  { id: '6', name: 'Polaris Software', email: 'eng@polaris.example', plan: 'Pro', status: 'active', mrr: 980, seats: 38, country: 'US', lastSeen: '2026-05-13', createdAt: '2024-06-30' },
  { id: '7', name: 'Bluefin Studios', email: 'studio@bluefin.example', plan: 'Team', status: 'active', mrr: 720, seats: 22, country: 'AU', lastSeen: '2026-05-15', createdAt: '2025-02-14' },
  { id: '8', name: 'Mercury Holdings', email: 'ops@mercury.example', plan: 'Enterprise', status: 'churned', mrr: 0, seats: 0, country: 'US', lastSeen: '2026-03-22', createdAt: '2022-05-04' },
  { id: '9', name: 'Vertex Analytics', email: 'data@vertex.example', plan: 'Team', status: 'active', mrr: 1240, seats: 41, country: 'US', lastSeen: '2026-05-15', createdAt: '2024-09-12' },
  { id: '10', name: 'Magnolia Foods', email: 'sales@magnolia.example', plan: 'Free', status: 'invited', mrr: 0, seats: 0, country: 'FR', lastSeen: '2026-05-12', createdAt: '2026-05-09' },
  { id: '11', name: 'Driftwood Hotels', email: 'gm@driftwood.example', plan: 'Pro', status: 'active', mrr: 2100, seats: 78, country: 'ES', lastSeen: '2026-05-14', createdAt: '2024-03-21' },
  { id: '12', name: 'Cobalt Manufacturing', email: 'plant@cobalt.example', plan: 'Enterprise', status: 'active', mrr: 6800, seats: 420, country: 'DE', lastSeen: '2026-05-15', createdAt: '2021-10-02' },
  { id: '13', name: 'Skyline Couriers', email: 'fleet@skyline.example', plan: 'Pro', status: 'trial', mrr: 0, seats: 8, country: 'US', lastSeen: '2026-05-11', createdAt: '2026-04-28' },
  { id: '14', name: 'Harbor Insurance', email: 'risk@harbor.example', plan: 'Enterprise', status: 'churned', mrr: 0, seats: 0, country: 'UK', lastSeen: '2026-02-18', createdAt: '2022-01-15' },
  { id: '15', name: 'Iron Peak Mining', email: 'site@ironpeak.example', plan: 'Team', status: 'active', mrr: 1480, seats: 52, country: 'CA', lastSeen: '2026-05-15', createdAt: '2023-08-04' },
  { id: '16', name: 'Linden Education', email: 'admin@linden.example', plan: 'Pro', status: 'active', mrr: 920, seats: 31, country: 'NL', lastSeen: '2026-05-13', createdAt: '2024-11-09' },
  { id: '17', name: 'Quartz Media', email: 'news@quartz.example', plan: 'Team', status: 'active', mrr: 640, seats: 19, country: 'US', lastSeen: '2026-05-15', createdAt: '2025-04-22' },
  { id: '18', name: 'Aurelia Cosmetics', email: 'web@aurelia.example', plan: 'Pro', status: 'trial', mrr: 0, seats: 11, country: 'FR', lastSeen: '2026-05-09', createdAt: '2026-04-18' },
  { id: '19', name: 'Tundra Outdoors', email: 'shop@tundra.example', plan: 'Free', status: 'invited', mrr: 0, seats: 0, country: 'CA', lastSeen: '2026-05-10', createdAt: '2026-05-07' },
  { id: '20', name: 'Falcon Aviation', email: 'ops@falcon.example', plan: 'Enterprise', status: 'active', mrr: 8200, seats: 540, country: 'US', lastSeen: '2026-05-15', createdAt: '2021-06-18' },
  { id: '21', name: 'Larkspur Retail', email: 'pos@larkspur.example', plan: 'Pro', status: 'active', mrr: 1380, seats: 47, country: 'UK', lastSeen: '2026-05-14', createdAt: '2024-02-27' },
  { id: '22', name: 'Bronze Brewing', email: 'taproom@bronze.example', plan: 'Team', status: 'active', mrr: 540, seats: 16, country: 'US', lastSeen: '2026-05-15', createdAt: '2025-07-30' },
  { id: '23', name: 'Cinder Energy', email: 'grid@cinder.example', plan: 'Enterprise', status: 'churned', mrr: 0, seats: 0, country: 'AU', lastSeen: '2026-04-02', createdAt: '2022-09-11' },
  { id: '24', name: 'Marina Logistics', email: 'port@marina.example', plan: 'Pro', status: 'active', mrr: 1620, seats: 58, country: 'NL', lastSeen: '2026-05-15', createdAt: '2024-05-13' },
  { id: '25', name: 'Hazel Coffee', email: 'roast@hazel.example', plan: 'Free', status: 'invited', mrr: 0, seats: 0, country: 'US', lastSeen: '2026-05-08', createdAt: '2026-05-08' },
  { id: '26', name: 'Granite Capital', email: 'desk@granite.example', plan: 'Enterprise', status: 'active', mrr: 7400, seats: 380, country: 'UK', lastSeen: '2026-05-15', createdAt: '2022-03-26' },
  { id: '27', name: 'Hollow Bay Studios', email: 'art@hollowbay.example', plan: 'Team', status: 'trial', mrr: 0, seats: 9, country: 'CA', lastSeen: '2026-05-13', createdAt: '2026-05-05' },
  { id: '28', name: 'Pioneer Telecom', email: 'noc@pioneer.example', plan: 'Enterprise', status: 'active', mrr: 5400, seats: 290, country: 'US', lastSeen: '2026-05-15', createdAt: '2023-01-30' },
  { id: '29', name: 'Sable Property', email: 'leasing@sable.example', plan: 'Pro', status: 'active', mrr: 1160, seats: 35, country: 'AU', lastSeen: '2026-05-14', createdAt: '2024-08-15' },
  { id: '30', name: 'Ember Bakery', email: 'order@ember.example', plan: 'Free', status: 'invited', mrr: 0, seats: 0, country: 'US', lastSeen: '2026-05-04', createdAt: '2026-05-03' },
  { id: '31', name: 'Cascade Bikes', email: 'workshop@cascade.example', plan: 'Team', status: 'active', mrr: 780, seats: 24, country: 'US', lastSeen: '2026-05-15', createdAt: '2025-05-20' },
  { id: '32', name: 'Lighthouse Legal', email: 'firm@lighthouse.example', plan: 'Pro', status: 'churned', mrr: 0, seats: 0, country: 'UK', lastSeen: '2026-01-19', createdAt: '2023-07-08' },
  { id: '33', name: 'Briar Travel', email: 'desk@briar.example', plan: 'Team', status: 'trial', mrr: 0, seats: 14, country: 'FR', lastSeen: '2026-05-12', createdAt: '2026-04-30' },
  { id: '34', name: 'Pacific Outfit', email: 'hello@pacific.example', plan: 'Pro', status: 'active', mrr: 1380, seats: 49, country: 'US', lastSeen: '2026-05-15', createdAt: '2024-04-19' },
  { id: '35', name: 'Reverie Audio', email: 'mix@reverie.example', plan: 'Team', status: 'active', mrr: 920, seats: 28, country: 'DE', lastSeen: '2026-05-15', createdAt: '2025-01-12' },
  { id: '36', name: 'Tidewater Ferry', email: 'ops@tidewater.example', plan: 'Pro', status: 'active', mrr: 1540, seats: 51, country: 'CA', lastSeen: '2026-05-14', createdAt: '2024-06-04' },
  { id: '37', name: 'Glassline Optics', email: 'lab@glassline.example', plan: 'Enterprise', status: 'active', mrr: 3120, seats: 168, country: 'JP', lastSeen: '2026-05-15', createdAt: '2023-12-09' },
  { id: '38', name: 'Wildwood Press', email: 'editor@wildwood.example', plan: 'Pro', status: 'trial', mrr: 0, seats: 7, country: 'UK', lastSeen: '2026-05-10', createdAt: '2026-04-25' },
  { id: '39', name: 'Quill & Co', email: 'studio@quill.example', plan: 'Free', status: 'invited', mrr: 0, seats: 0, country: 'US', lastSeen: '2026-05-06', createdAt: '2026-05-05' },
  { id: '40', name: 'Aster Pharmaceuticals', email: 'rd@aster.example', plan: 'Enterprise', status: 'active', mrr: 9400, seats: 612, country: 'CH', lastSeen: '2026-05-15', createdAt: '2020-09-14' },
  { id: '41', name: 'Birchwood Co-op', email: 'admin@birchwood.example', plan: 'Team', status: 'churned', mrr: 0, seats: 0, country: 'CA', lastSeen: '2026-02-11', createdAt: '2023-04-29' },
  { id: '42', name: 'Sunpeak Solar', email: 'fleet@sunpeak.example', plan: 'Pro', status: 'active', mrr: 1280, seats: 42, country: 'ES', lastSeen: '2026-05-15', createdAt: '2024-10-17' },
  { id: '43', name: 'Halcyon Hospitality', email: 'concierge@halcyon.example', plan: 'Enterprise', status: 'active', mrr: 4200, seats: 240, country: 'US', lastSeen: '2026-05-15', createdAt: '2023-03-08' },
  { id: '44', name: 'Verdant Farms', email: 'mgmt@verdant.example', plan: 'Pro', status: 'active', mrr: 860, seats: 27, country: 'NL', lastSeen: '2026-05-14', createdAt: '2025-08-23' },
  { id: '45', name: 'Onyx Defense', email: 'gov@onyx.example', plan: 'Enterprise', status: 'active', mrr: 11200, seats: 880, country: 'US', lastSeen: '2026-05-15', createdAt: '2020-02-02' },
  { id: '46', name: 'Lumen Education', email: 'campus@lumen.example', plan: 'Team', status: 'trial', mrr: 0, seats: 18, country: 'UK', lastSeen: '2026-05-11', createdAt: '2026-04-22' },
  { id: '47', name: 'Saffron Spices', email: 'shop@saffron.example', plan: 'Free', status: 'invited', mrr: 0, seats: 0, country: 'IN', lastSeen: '2026-05-09', createdAt: '2026-05-09' },
  { id: '48', name: 'Beacon Cycling', email: 'team@beacon.example', plan: 'Pro', status: 'active', mrr: 1060, seats: 33, country: 'US', lastSeen: '2026-05-15', createdAt: '2024-12-01' },
]

const statusTone: Record<Status, string> = {
  active: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  trial: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  invited: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  churned: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
}

interface ColumnDef {
  key: string
  label: string
  sortable: boolean
  defaultVisible: boolean
  alignRight?: boolean
}

const columns: ColumnDef[] = [
  { key: 'name', label: 'Customer', sortable: true, defaultVisible: true },
  { key: 'plan', label: 'Plan', sortable: true, defaultVisible: true },
  { key: 'status', label: 'Status', sortable: true, defaultVisible: true },
  { key: 'mrr', label: 'MRR', sortable: true, defaultVisible: true, alignRight: true },
  { key: 'seats', label: 'Seats', sortable: true, defaultVisible: true, alignRight: true },
  { key: 'country', label: 'Country', sortable: true, defaultVisible: false },
  { key: 'lastSeen', label: 'Last seen', sortable: true, defaultVisible: true },
  { key: 'createdAt', label: 'Created', sortable: true, defaultVisible: false },
]

const STATUSES: Status[] = ['active', 'trial', 'invited', 'churned']
const PLANS: Plan[] = ['Free', 'Pro', 'Team', 'Enterprise']

type SortKey = 'name' | 'plan' | 'status' | 'mrr' | 'seats' | 'country' | 'lastSeen' | 'createdAt'

const search = ref('')
const statusFilter = ref<Set<Status>>(new Set())
const planFilter = ref<Set<Plan>>(new Set())
const dateRange = ref<DateRange>('all')
const sortKey = ref<SortKey>('mrr')
const sortDir = ref<'asc' | 'desc'>('desc')
const page = ref(0)
const pageSize = ref(10)
const selected = ref<Set<string>>(new Set())
const density = ref<Density>('comfortable')
const visibleCols = ref<Set<string>>(new Set(columns.filter((c) => c.defaultVisible).map((c) => c.key)))
const loading = ref(true)
const detailOpen = ref(false)
const detailCustomer = ref<Customer | null>(null)

// Initial-load skeleton -- visible long enough to demo the shimmer.
onMounted(() => {
  setTimeout(() => (loading.value = false), 650)
})

function toggleSort(key: SortKey, sortable: boolean) {
  if (!sortable) return
  if (sortKey.value === key) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else {
    sortKey.value = key
    sortDir.value = key === 'mrr' || key === 'seats' ? 'desc' : 'asc'
  }
  page.value = 0
}

function toggleSetValue<T>(set: Set<T>, value: T) {
  const next = new Set(set)
  if (next.has(value)) next.delete(value)
  else next.add(value)
  return next
}

const dateCutoff = computed(() => {
  if (dateRange.value === 'all') return null
  const days = dateRange.value === '7d' ? 7 : dateRange.value === '30d' ? 30 : 90
  const d = new Date('2026-05-16')
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
})

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return customers.filter((c) => {
    if (statusFilter.value.size && !statusFilter.value.has(c.status)) return false
    if (planFilter.value.size && !planFilter.value.has(c.plan)) return false
    if (dateCutoff.value && c.lastSeen < dateCutoff.value) return false
    if (!q) return true
    return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)
  })
})

const sorted = computed(() => {
  const dir = sortDir.value === 'asc' ? 1 : -1
  return [...filtered.value].sort((a, b) => {
    const av = a[sortKey.value as keyof Customer]
    const bv = b[sortKey.value as keyof Customer]
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir
    return String(av).localeCompare(String(bv)) * dir
  })
})

const pageCount = computed(() => Math.max(1, Math.ceil(sorted.value.length / pageSize.value)))
const paged = computed(() => sorted.value.slice(page.value * pageSize.value, (page.value + 1) * pageSize.value))

// Reset page when filters/sort/pageSize churn the result count.
watch([search, statusFilter, planFilter, dateRange, pageSize], () => {
  page.value = 0
})

const allOnPageChecked = computed(() => paged.value.length > 0 && paged.value.every((c) => selected.value.has(c.id)))
const someOnPageChecked = computed(() => paged.value.some((c) => selected.value.has(c.id)) && !allOnPageChecked.value)
const allFilteredChecked = computed(() => sorted.value.length > 0 && sorted.value.every((c) => selected.value.has(c.id)))

function togglePage(v: boolean) {
  const next = new Set(selected.value)
  for (const c of paged.value) {
    if (v) next.add(c.id)
    else next.delete(c.id)
  }
  selected.value = next
}

function selectAllFiltered() {
  selected.value = new Set(sorted.value.map((c) => c.id))
}

function toggleRow(id: string, v: boolean) {
  const next = new Set(selected.value)
  if (v) next.add(id)
  else next.delete(id)
  selected.value = next
}

function clearSelection() {
  selected.value = new Set()
}

function formatMoney(n: number) {
  return n === 0 ? '—' : `$${n.toLocaleString()}`
}

function sortIcon(key: SortKey) {
  if (sortKey.value !== key) return ArrowUpDown
  return sortDir.value === 'asc' ? ArrowUp : ArrowDown
}

function isVisible(key: string) {
  return visibleCols.value.has(key)
}

function toggleColumn(key: string) {
  visibleCols.value = toggleSetValue(visibleCols.value, key)
}

const activeFilterCount = computed(() => {
  let n = 0
  if (search.value.trim()) n++
  if (statusFilter.value.size) n++
  if (planFilter.value.size) n++
  if (dateRange.value !== 'all') n++
  return n
})

function resetFilters() {
  search.value = ''
  statusFilter.value = new Set()
  planFilter.value = new Set()
  dateRange.value = 'all'
  sortKey.value = 'mrr'
  sortDir.value = 'desc'
}

function openDetail(c: Customer) {
  detailCustomer.value = c
  detailOpen.value = true
}

// CSV builds from currently visible columns and the filtered+sorted set --
// matches what the user sees on screen, not the raw dataset.
function exportCsv() {
  const cols = columns.filter((c) => visibleCols.value.has(c.key))
  const header = cols.map((c) => c.label).join(',')
  const rows = sorted.value.map((row) =>
    cols
      .map((c) => {
        const v = row[c.key as keyof Customer]
        const s = String(v).replace(/"/g, '""')
        return /[",\n]/.test(s) ? `"${s}"` : s
      })
      .join(','),
  )
  const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `customers-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const dateRangeLabel: Record<DateRange, string> = {
  all: 'All time',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
}

const cellPad = computed(() => (density.value === 'compact' ? 'py-1.5' : 'py-3'))
const visibleCount = computed(() => columns.filter((c) => visibleCols.value.has(c.key)).length + 2)
</script>

<template>
  <div class="space-y-4">
    <header class="flex flex-wrap items-end justify-between gap-4">
      <div class="space-y-1">
        <h1 class="text-2xl font-semibold tracking-tight">Customers</h1>
        <p class="text-muted-foreground text-sm">
          {{ customers.length }} accounts · {{ sorted.length }} after filters · {{ selected.size }} selected
        </p>
      </div>
      <div class="flex items-center gap-2">
        <Button variant="outline" size="sm" class="h-8 gap-1.5" @click="exportCsv">
          <Download class="size-3.5" />Export CSV
        </Button>
        <Button size="sm" class="h-8 gap-1.5"><Plus class="size-3.5" />Add customer</Button>
      </div>
    </header>

    <Card class="overflow-hidden">
      <CardHeader class="flex flex-col gap-3 space-y-0 border-b px-4 py-3">
        <div class="flex flex-wrap items-center gap-2">
          <div class="relative max-w-xs flex-1 min-w-[12rem]">
            <Search class="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
            <Input v-model="search" placeholder="Search name, email, country…" class="h-8 pl-7 text-sm" />
          </div>

          <Popover>
            <PopoverTrigger as-child>
              <Button variant="outline" size="sm" class="h-8 gap-1.5 text-xs">
                <Filter class="size-3.5" />Status
                <Badge v-if="statusFilter.size" variant="secondary" class="ml-1 h-4 px-1 text-[10px]">{{ statusFilter.size }}</Badge>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" class="w-48 p-1">
              <button
                v-for="s in STATUSES"
                :key="s"
                class="hover:bg-accent flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs capitalize"
                @click="statusFilter = toggleSetValue(statusFilter, s)"
              >
                <span class="flex items-center gap-2">
                  <span :class="['size-2 rounded-full', s === 'active' ? 'bg-emerald-500' : s === 'trial' ? 'bg-blue-500' : s === 'invited' ? 'bg-amber-500' : 'bg-rose-500']" />
                  {{ s }}
                </span>
                <Check v-if="statusFilter.has(s)" class="text-muted-foreground size-3" />
              </button>
              <Separator class="my-1" />
              <button class="text-muted-foreground hover:bg-accent w-full rounded px-2 py-1.5 text-left text-xs" @click="statusFilter = new Set()">Clear</button>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger as-child>
              <Button variant="outline" size="sm" class="h-8 gap-1.5 text-xs">
                <Filter class="size-3.5" />Plan
                <Badge v-if="planFilter.size" variant="secondary" class="ml-1 h-4 px-1 text-[10px]">{{ planFilter.size }}</Badge>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" class="w-44 p-1">
              <button
                v-for="p in PLANS"
                :key="p"
                class="hover:bg-accent flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs"
                @click="planFilter = toggleSetValue(planFilter, p)"
              >
                {{ p }}
                <Check v-if="planFilter.has(p)" class="text-muted-foreground size-3" />
              </button>
              <Separator class="my-1" />
              <button class="text-muted-foreground hover:bg-accent w-full rounded px-2 py-1.5 text-left text-xs" @click="planFilter = new Set()">Clear</button>
            </PopoverContent>
          </Popover>

          <Select v-model="dateRange">
            <SelectTrigger size="sm" class="h-8 w-[140px] text-xs">
              <SelectValue :placeholder="dateRangeLabel[dateRange]" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>

          <Button
            v-if="activeFilterCount > 0"
            variant="ghost"
            size="sm"
            class="h-8 gap-1.5 text-xs text-muted-foreground"
            @click="resetFilters"
          >
            <RotateCcw class="size-3" />Reset
          </Button>

          <div class="ml-auto flex items-center gap-2">
            <ToggleGroup v-model="density" type="single" size="sm" variant="outline" class="h-8">
              <ToggleGroupItem value="compact" class="h-8 px-2 text-xs">Compact</ToggleGroupItem>
              <ToggleGroupItem value="comfortable" class="h-8 px-2 text-xs">Cozy</ToggleGroupItem>
            </ToggleGroup>

            <Popover>
              <PopoverTrigger as-child>
                <Button variant="outline" size="sm" class="h-8 gap-1.5 text-xs">
                  <Columns3 class="size-3.5" />Columns
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" class="w-44 p-1">
                <button
                  v-for="c in columns"
                  :key="c.key"
                  class="hover:bg-accent flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs"
                  @click="toggleColumn(c.key)"
                >
                  {{ c.label }}
                  <Check v-if="isVisible(c.key)" class="text-muted-foreground size-3" />
                </button>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div v-if="selected.size > 0" class="bg-muted/40 -mx-4 -mb-3 flex flex-wrap items-center gap-2 border-t px-4 py-2 text-xs">
          <span class="font-medium">{{ selected.size }} selected</span>
          <button
            v-if="allOnPageChecked && !allFilteredChecked && sorted.length > pageSize"
            class="text-primary underline-offset-2 hover:underline"
            @click="selectAllFiltered"
          >
            Select all {{ sorted.length }} matching
          </button>
          <div class="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" class="h-7 text-xs">Email</Button>
            <Button variant="outline" size="sm" class="h-7 text-xs">Change plan</Button>
            <Button variant="outline" size="sm" class="h-7 text-xs text-rose-600">Archive</Button>
            <Button variant="ghost" size="sm" class="h-7 text-xs" @click="clearSelection">Clear</Button>
          </div>
        </div>
      </CardHeader>

      <CardContent class="p-0">
        <div class="max-h-[70vh] overflow-auto">
          <Table>
            <TableHeader class="bg-background sticky top-0 z-10 shadow-[0_1px_0_0_var(--border)]">
              <TableRow>
                <TableHead class="w-10 pl-4">
                  <Checkbox
                    :model-value="allOnPageChecked ? true : someOnPageChecked ? 'indeterminate' : false"
                    @update:model-value="(v) => togglePage(Boolean(v))"
                  />
                </TableHead>
                <template v-for="c in columns" :key="c.key">
                  <TableHead v-if="isVisible(c.key)" :class="c.alignRight ? 'text-right' : ''">
                    <button
                      v-if="c.sortable"
                      :class="['hover:text-foreground inline-flex items-center gap-1 font-medium', c.alignRight ? 'ml-auto' : '']"
                      @click="toggleSort(c.key as SortKey, c.sortable)"
                    >
                      {{ c.label }}<component :is="sortIcon(c.key as SortKey)" class="size-3" />
                    </button>
                    <span v-else>{{ c.label }}</span>
                  </TableHead>
                </template>
                <TableHead class="w-10" />
              </TableRow>
            </TableHeader>

            <TableBody v-if="loading">
              <TableRow v-for="i in pageSize" :key="`sk-${i}`">
                <TableCell :class="['pl-4', cellPad]"><Skeleton class="size-4 rounded" /></TableCell>
                <TableCell v-for="c in columns.filter((c) => isVisible(c.key))" :key="c.key" :class="[cellPad]">
                  <Skeleton :class="['h-3', c.key === 'name' ? 'w-40' : 'w-16']" />
                </TableCell>
                <TableCell :class="cellPad"><Skeleton class="size-4 rounded" /></TableCell>
              </TableRow>
            </TableBody>

            <TableBody v-else>
              <TableRow
                v-for="c in paged"
                :key="c.id"
                :data-state="selected.has(c.id) ? 'selected' : undefined"
                class="hover:bg-muted/40 cursor-pointer"
                @click="openDetail(c)"
              >
                <TableCell :class="['pl-4', cellPad]" @click.stop>
                  <Checkbox :model-value="selected.has(c.id)" @update:model-value="(v) => toggleRow(c.id, Boolean(v))" />
                </TableCell>
                <TableCell v-if="isVisible('name')" :class="cellPad">
                  <div class="font-medium">{{ c.name }}</div>
                  <div class="text-muted-foreground text-xs">{{ c.email }}</div>
                </TableCell>
                <TableCell v-if="isVisible('plan')" :class="['text-muted-foreground', cellPad]">{{ c.plan }}</TableCell>
                <TableCell v-if="isVisible('status')" :class="cellPad">
                  <Badge variant="outline" :class="['gap-1 px-2 text-[10px] font-medium uppercase tracking-wide', statusTone[c.status]]">
                    {{ c.status }}
                  </Badge>
                </TableCell>
                <TableCell v-if="isVisible('mrr')" :class="['text-right tabular-nums', cellPad]">{{ formatMoney(c.mrr) }}</TableCell>
                <TableCell v-if="isVisible('seats')" :class="['text-right tabular-nums text-muted-foreground', cellPad]">{{ c.seats || '—' }}</TableCell>
                <TableCell v-if="isVisible('country')" :class="['text-muted-foreground', cellPad]">{{ c.country }}</TableCell>
                <TableCell v-if="isVisible('lastSeen')" :class="['text-muted-foreground text-xs tabular-nums', cellPad]">{{ c.lastSeen }}</TableCell>
                <TableCell v-if="isVisible('createdAt')" :class="['text-muted-foreground text-xs tabular-nums', cellPad]">{{ c.createdAt }}</TableCell>
                <TableCell :class="cellPad" @click.stop>
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <Button variant="ghost" size="icon" class="size-7"><MoreHorizontal class="size-3.5" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem @click="openDetail(c)">View details</DropdownMenuItem>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Email</DropdownMenuItem>
                      <DropdownMenuItem>Copy ID</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem class="text-rose-600">Archive</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
              <TableEmpty v-if="paged.length === 0" :colspan="visibleCount">
                <div class="flex flex-col items-center gap-2 py-6">
                  <SlidersHorizontal class="text-muted-foreground size-5" />
                  <p class="text-sm">No customers match your filters.</p>
                  <Button variant="outline" size="sm" class="h-7 text-xs" @click="resetFilters">Reset filters</Button>
                </div>
              </TableEmpty>
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <div class="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-xs">
        <span class="text-muted-foreground">
          Showing
          <span class="text-foreground tabular-nums">{{ paged.length === 0 ? 0 : page * pageSize + 1 }}–{{ Math.min((page + 1) * pageSize, sorted.length) }}</span>
          of <span class="text-foreground tabular-nums">{{ sorted.length }}</span>
        </span>

        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2">
            <span class="text-muted-foreground">Rows per page</span>
            <Select v-model.number="pageSize">
              <SelectTrigger size="sm" class="h-7 w-[68px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="5">5</SelectItem>
                <SelectItem :value="10">10</SelectItem>
                <SelectItem :value="20">20</SelectItem>
                <SelectItem :value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <span class="text-muted-foreground tabular-nums">Page {{ page + 1 }} of {{ pageCount }}</span>

          <div class="flex items-center gap-1">
            <Button variant="outline" size="icon" class="size-7" :disabled="page === 0" @click="page = 0">
              <ChevronsLeft class="size-3.5" />
            </Button>
            <Button variant="outline" size="icon" class="size-7" :disabled="page === 0" @click="page--">
              <ChevronLeft class="size-3.5" />
            </Button>
            <Button variant="outline" size="icon" class="size-7" :disabled="page >= pageCount - 1" @click="page++">
              <ChevronRight class="size-3.5" />
            </Button>
            <Button variant="outline" size="icon" class="size-7" :disabled="page >= pageCount - 1" @click="page = pageCount - 1">
              <ChevronsRight class="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </Card>

    <Sheet v-model:open="detailOpen">
      <SheetContent class="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{{ detailCustomer?.name }}</SheetTitle>
          <SheetDescription>{{ detailCustomer?.email }}</SheetDescription>
        </SheetHeader>
        <div v-if="detailCustomer" class="space-y-4 px-4 pb-4 text-sm">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <div class="text-muted-foreground text-xs">Plan</div>
              <div class="font-medium">{{ detailCustomer.plan }}</div>
            </div>
            <div>
              <div class="text-muted-foreground text-xs">Status</div>
              <Badge variant="outline" :class="['gap-1 px-2 text-[10px] font-medium uppercase tracking-wide', statusTone[detailCustomer.status]]">
                {{ detailCustomer.status }}
              </Badge>
            </div>
            <div>
              <div class="text-muted-foreground text-xs">MRR</div>
              <div class="font-medium tabular-nums">{{ formatMoney(detailCustomer.mrr) }}</div>
            </div>
            <div>
              <div class="text-muted-foreground text-xs">Seats</div>
              <div class="font-medium tabular-nums">{{ detailCustomer.seats || '—' }}</div>
            </div>
            <div>
              <div class="text-muted-foreground text-xs">Country</div>
              <div class="font-medium">{{ detailCustomer.country }}</div>
            </div>
            <div>
              <div class="text-muted-foreground text-xs">Customer since</div>
              <div class="font-medium tabular-nums">{{ detailCustomer.createdAt }}</div>
            </div>
          </div>
          <Separator />
          <div>
            <div class="text-muted-foreground mb-1 text-xs">Last seen</div>
            <div class="font-medium tabular-nums">{{ detailCustomer.lastSeen }}</div>
          </div>
          <div class="flex gap-2 pt-2">
            <Button size="sm" class="h-8 text-xs">Edit</Button>
            <Button variant="outline" size="sm" class="h-8 text-xs">Send email</Button>
            <Button variant="outline" size="sm" class="h-8 text-xs text-rose-600">Archive</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  </div>
</template>
