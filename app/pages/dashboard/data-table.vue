<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  Activity,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ArrowUpRight,
  Building2,
  CalendarIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Columns3,
  CreditCard,
  Download,
  Filter,
  Mail,
  MapPin,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  UserPlus,
  Users,
  X,
} from '@/lib/icon-pack'
import { Table, TableBody, TableCell, TableEmpty, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RangeCalendar } from '@/components/ui/range-calendar'
import { DateFormatter, getLocalTimeZone } from '@internationalized/date'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { toast } from 'vue-sonner'
import { formatMoney, formatNumber } from '@/lib/utils'
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Page, PageHeader, PageHeaderHeading, PageBody } from '@/components/ui/page'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
const title = useRouteLabel()
useHead({ title })

type Status = 'active' | 'trial' | 'churned' | 'invited'
type Plan = 'Free' | 'Pro' | 'Team' | 'Enterprise'
type Density = 'compact' | 'comfortable'
type DateRange = 'all' | '7d' | '30d' | '90d' | 'custom'

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
  { id: '1', name: 'Northwind Industries', email: 'ops@northwind.example', plan: 'Enterprise', status: 'active', mrr: 4800, seats: 220, country: 'US', lastSeen: '2026-09-28', createdAt: '2023-06-27' },
  { id: '2', name: 'Sentinel Labs', email: 'team@sentinel.example', plan: 'Enterprise', status: 'active', mrr: 3600, seats: 145, country: 'US', lastSeen: '2026-09-28', createdAt: '2023-08-16' },
  { id: '3', name: 'Apex Logistics', email: 'admin@apex.example', plan: 'Pro', status: 'trial', mrr: 0, seats: 12, country: 'CA', lastSeen: '2026-09-27', createdAt: '2026-09-14' },
  { id: '4', name: 'Olympus Robotics', email: 'finance@olympus.example', plan: 'Enterprise', status: 'active', mrr: 5200, seats: 310, country: 'DE', lastSeen: '2026-09-28', createdAt: '2023-04-04' },
  { id: '5', name: 'Crescent Health', email: 'it@crescent.example', plan: 'Pro', status: 'active', mrr: 1800, seats: 64, country: 'UK', lastSeen: '2026-09-28', createdAt: '2024-05-23' },
  { id: '6', name: 'Polaris Software', email: 'eng@polaris.example', plan: 'Pro', status: 'active', mrr: 980, seats: 38, country: 'US', lastSeen: '2026-09-26', createdAt: '2024-11-13' },
  { id: '7', name: 'Bluefin Studios', email: 'studio@bluefin.example', plan: 'Team', status: 'active', mrr: 720, seats: 22, country: 'AU', lastSeen: '2026-09-28', createdAt: '2025-06-30' },
  { id: '8', name: 'Mercury Holdings', email: 'ops@mercury.example', plan: 'Enterprise', status: 'churned', mrr: 0, seats: 0, country: 'US', lastSeen: '2026-08-05', createdAt: '2022-09-17' },
  { id: '9', name: 'Vertex Analytics', email: 'data@vertex.example', plan: 'Team', status: 'active', mrr: 1240, seats: 41, country: 'US', lastSeen: '2026-09-28', createdAt: '2025-01-26' },
  { id: '10', name: 'Magnolia Foods', email: 'sales@magnolia.example', plan: 'Free', status: 'invited', mrr: 0, seats: 0, country: 'FR', lastSeen: '2026-09-25', createdAt: '2026-09-22' },
  { id: '11', name: 'Driftwood Hotels', email: 'gm@driftwood.example', plan: 'Pro', status: 'active', mrr: 2100, seats: 78, country: 'ES', lastSeen: '2026-09-27', createdAt: '2024-08-04' },
  { id: '12', name: 'Cobalt Manufacturing', email: 'plant@cobalt.example', plan: 'Enterprise', status: 'active', mrr: 6800, seats: 420, country: 'DE', lastSeen: '2026-09-28', createdAt: '2022-02-15' },
  { id: '13', name: 'Skyline Couriers', email: 'fleet@skyline.example', plan: 'Pro', status: 'trial', mrr: 0, seats: 8, country: 'US', lastSeen: '2026-09-24', createdAt: '2026-09-11' },
  { id: '14', name: 'Harbor Insurance', email: 'risk@harbor.example', plan: 'Enterprise', status: 'churned', mrr: 0, seats: 0, country: 'UK', lastSeen: '2026-07-04', createdAt: '2022-05-31' },
  { id: '15', name: 'Iron Peak Mining', email: 'site@ironpeak.example', plan: 'Team', status: 'active', mrr: 1480, seats: 52, country: 'CA', lastSeen: '2026-09-28', createdAt: '2023-12-18' },
  { id: '16', name: 'Linden Education', email: 'admin@linden.example', plan: 'Pro', status: 'active', mrr: 920, seats: 31, country: 'NL', lastSeen: '2026-09-26', createdAt: '2025-03-25' },
  { id: '17', name: 'Quartz Media', email: 'news@quartz.example', plan: 'Team', status: 'active', mrr: 640, seats: 19, country: 'US', lastSeen: '2026-09-28', createdAt: '2025-09-05' },
  { id: '18', name: 'Aurelia Cosmetics', email: 'web@aurelia.example', plan: 'Pro', status: 'trial', mrr: 0, seats: 11, country: 'FR', lastSeen: '2026-09-22', createdAt: '2026-09-01' },
  { id: '19', name: 'Tundra Outdoors', email: 'shop@tundra.example', plan: 'Free', status: 'invited', mrr: 0, seats: 0, country: 'CA', lastSeen: '2026-09-23', createdAt: '2026-09-20' },
  { id: '20', name: 'Falcon Aviation', email: 'ops@falcon.example', plan: 'Enterprise', status: 'active', mrr: 8200, seats: 540, country: 'US', lastSeen: '2026-09-28', createdAt: '2021-11-01' },
  { id: '21', name: 'Larkspur Retail', email: 'pos@larkspur.example', plan: 'Pro', status: 'active', mrr: 1380, seats: 47, country: 'UK', lastSeen: '2026-09-27', createdAt: '2024-07-12' },
  { id: '22', name: 'Bronze Brewing', email: 'taproom@bronze.example', plan: 'Team', status: 'active', mrr: 540, seats: 16, country: 'US', lastSeen: '2026-09-28', createdAt: '2025-12-13' },
  { id: '23', name: 'Cinder Energy', email: 'grid@cinder.example', plan: 'Enterprise', status: 'churned', mrr: 0, seats: 0, country: 'AU', lastSeen: '2026-08-16', createdAt: '2023-01-25' },
  { id: '24', name: 'Marina Logistics', email: 'port@marina.example', plan: 'Pro', status: 'active', mrr: 1620, seats: 58, country: 'NL', lastSeen: '2026-09-28', createdAt: '2024-09-26' },
  { id: '25', name: 'Hazel Coffee', email: 'roast@hazel.example', plan: 'Free', status: 'invited', mrr: 0, seats: 0, country: 'US', lastSeen: '2026-09-21', createdAt: '2026-09-21' },
  { id: '26', name: 'Granite Capital', email: 'desk@granite.example', plan: 'Enterprise', status: 'active', mrr: 7400, seats: 380, country: 'UK', lastSeen: '2026-09-28', createdAt: '2022-08-09' },
  { id: '27', name: 'Hollow Bay Studios', email: 'art@hollowbay.example', plan: 'Team', status: 'trial', mrr: 0, seats: 9, country: 'CA', lastSeen: '2026-09-26', createdAt: '2026-09-18' },
  { id: '28', name: 'Pioneer Telecom', email: 'noc@pioneer.example', plan: 'Enterprise', status: 'active', mrr: 5400, seats: 290, country: 'US', lastSeen: '2026-09-28', createdAt: '2023-06-15' },
  { id: '29', name: 'Sable Property', email: 'leasing@sable.example', plan: 'Pro', status: 'active', mrr: 1160, seats: 35, country: 'AU', lastSeen: '2026-09-27', createdAt: '2024-12-29' },
  { id: '30', name: 'Ember Bakery', email: 'order@ember.example', plan: 'Free', status: 'invited', mrr: 0, seats: 0, country: 'US', lastSeen: '2026-09-17', createdAt: '2026-09-16' },
  { id: '31', name: 'Cascade Bikes', email: 'workshop@cascade.example', plan: 'Team', status: 'active', mrr: 780, seats: 24, country: 'US', lastSeen: '2026-09-28', createdAt: '2025-10-03' },
  { id: '32', name: 'Lighthouse Legal', email: 'firm@lighthouse.example', plan: 'Pro', status: 'churned', mrr: 0, seats: 0, country: 'UK', lastSeen: '2026-06-04', createdAt: '2023-11-21' },
  { id: '33', name: 'Briar Travel', email: 'desk@briar.example', plan: 'Team', status: 'trial', mrr: 0, seats: 14, country: 'FR', lastSeen: '2026-09-25', createdAt: '2026-09-13' },
  { id: '34', name: 'Pacific Outfit', email: 'hello@pacific.example', plan: 'Pro', status: 'active', mrr: 1380, seats: 49, country: 'US', lastSeen: '2026-09-28', createdAt: '2024-09-02' },
  { id: '35', name: 'Reverie Audio', email: 'mix@reverie.example', plan: 'Team', status: 'active', mrr: 920, seats: 28, country: 'DE', lastSeen: '2026-09-28', createdAt: '2025-05-28' },
  { id: '36', name: 'Tidewater Ferry', email: 'ops@tidewater.example', plan: 'Pro', status: 'active', mrr: 1540, seats: 51, country: 'CA', lastSeen: '2026-09-27', createdAt: '2024-10-18' },
  { id: '37', name: 'Glassline Optics', email: 'lab@glassline.example', plan: 'Enterprise', status: 'active', mrr: 3120, seats: 168, country: 'JP', lastSeen: '2026-09-28', createdAt: '2024-04-23' },
  { id: '38', name: 'Wildwood Press', email: 'editor@wildwood.example', plan: 'Pro', status: 'trial', mrr: 0, seats: 7, country: 'UK', lastSeen: '2026-09-23', createdAt: '2026-09-08' },
  { id: '39', name: 'Quill & Co', email: 'studio@quill.example', plan: 'Free', status: 'invited', mrr: 0, seats: 0, country: 'US', lastSeen: '2026-09-19', createdAt: '2026-09-18' },
  { id: '40', name: 'Aster Pharmaceuticals', email: 'rd@aster.example', plan: 'Enterprise', status: 'active', mrr: 9400, seats: 612, country: 'CH', lastSeen: '2026-09-28', createdAt: '2021-01-28' },
  { id: '41', name: 'Birchwood Co-op', email: 'admin@birchwood.example', plan: 'Team', status: 'churned', mrr: 0, seats: 0, country: 'CA', lastSeen: '2026-06-27', createdAt: '2023-09-12' },
  { id: '42', name: 'Sunpeak Solar', email: 'fleet@sunpeak.example', plan: 'Pro', status: 'active', mrr: 1280, seats: 42, country: 'ES', lastSeen: '2026-09-28', createdAt: '2025-03-02' },
  { id: '43', name: 'Halcyon Hospitality', email: 'concierge@halcyon.example', plan: 'Enterprise', status: 'active', mrr: 4200, seats: 240, country: 'US', lastSeen: '2026-09-28', createdAt: '2023-07-22' },
  { id: '44', name: 'Verdant Farms', email: 'mgmt@verdant.example', plan: 'Pro', status: 'active', mrr: 860, seats: 27, country: 'NL', lastSeen: '2026-09-27', createdAt: '2026-01-06' },
  { id: '45', name: 'Onyx Defense', email: 'gov@onyx.example', plan: 'Enterprise', status: 'active', mrr: 11200, seats: 880, country: 'US', lastSeen: '2026-09-28', createdAt: '2020-06-17' },
  { id: '46', name: 'Lumen Education', email: 'campus@lumen.example', plan: 'Team', status: 'trial', mrr: 0, seats: 18, country: 'UK', lastSeen: '2026-09-24', createdAt: '2026-09-05' },
  { id: '47', name: 'Saffron Spices', email: 'shop@saffron.example', plan: 'Free', status: 'invited', mrr: 0, seats: 0, country: 'IN', lastSeen: '2026-09-22', createdAt: '2026-09-22' },
  { id: '48', name: 'Beacon Cycling', email: 'team@beacon.example', plan: 'Pro', status: 'active', mrr: 1060, seats: 33, country: 'US', lastSeen: '2026-09-28', createdAt: '2025-04-16' },
]

const statusTone: Record<Status, string> = {
  active: 'border-success/20 bg-success/10 text-success',
  trial: 'border-info/20 bg-info/10 text-info',
  invited: 'border-warning/20 bg-warning/10 text-warning',
  churned: 'border-destructive/20 bg-destructive/10 text-destructive',
}

const statusDot: Record<Status, string> = {
  active: 'bg-success',
  trial: 'bg-info',
  invited: 'bg-warning',
  churned: 'bg-destructive',
}

const { t, locale } = useI18n()

interface ColumnDef {
  key: string
  label: string
  sortable: boolean
  defaultVisible: boolean
  alignRight?: boolean
}

const columns = computed<ColumnDef[]>(() => [
  { key: 'name', label: 'Customer', sortable: true, defaultVisible: true },
  { key: 'plan', label: 'Plan', sortable: true, defaultVisible: true },
  { key: 'status', label: 'Status', sortable: true, defaultVisible: true },
  // WHY (Rule62): measured headers carry their units so "$4,800" and "220"
  // never read as unitless.
  { key: 'mrr', label: t('dashboard.table.headers.mrr'), sortable: true, defaultVisible: true, alignRight: true },
  { key: 'seats', label: t('dashboard.table.headers.seats'), sortable: true, defaultVisible: true, alignRight: true },
  { key: 'country', label: 'Country', sortable: true, defaultVisible: false },
  { key: 'lastSeen', label: 'Last seen', sortable: true, defaultVisible: true },
  { key: 'createdAt', label: 'Created', sortable: true, defaultVisible: false },
])

const STATUSES: Status[] = ['active', 'trial', 'invited', 'churned']
const PLANS: Plan[] = ['Free', 'Pro', 'Team', 'Enterprise']

type SortKey = 'name' | 'plan' | 'status' | 'mrr' | 'seats' | 'country' | 'lastSeen' | 'createdAt'

const search = ref('')
const statusFilter = ref<Set<Status>>(new Set())
const planFilter = ref<Set<Plan>>(new Set())
const dateRange = ref<DateRange>('30d')
const sortKey = ref<SortKey>('mrr')
const sortDir = ref<'asc' | 'desc'>('desc')
const page = ref(0)
const pageSize = ref(10)
const selected = ref<Set<string>>(new Set())
const density = ref<Density>('comfortable')
const visibleCols = ref<Set<string>>(new Set(columns.value.filter(c => c.defaultVisible).map(c => c.key)))
const loading = ref(true)
const detailOpen = ref(false)
const detailCustomer = ref<Customer | null>(null)
const filtersOpen = ref(false)

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

// Custom range via a RangeCalendar-in-Popover. Picking both endpoints
// flips the filter into 'custom' so the same cutoff computed chain
// applies; picking a preset select item clears the calendar value.
// `DateValue` from @internationalized/date and reka-ui's calendar accept
// the same runtime shapes but TypeScript treats them as different brands.
// `as any` avoids the false-positive without changing behavior.
const customCal = ref<any>(undefined)
const customOpen = ref(false)

const customStartIso = computed(() => {
  const s = customCal.value?.start
  return s ? s.toDate(getLocalTimeZone()).toISOString().slice(0, 10) : null
})

const customEndIso = computed(() => {
  const e = customCal.value?.end
  return e ? e.toDate(getLocalTimeZone()).toISOString().slice(0, 10) : null
})

const customSpan = computed(() => {
  if (!customCal.value?.start || !customCal.value?.end) return null
  const tz = getLocalTimeZone()
  const df = new DateFormatter(locale.value, { month: 'short', day: 'numeric', year: 'numeric' })
  return t('dashboard.range.customLabel', {
    start: df.format(customCal.value.start.toDate(tz)),
    end: df.format(customCal.value.end.toDate(tz)),
  })
})

watch(customCal, (v) => {
  if (v?.start && v?.end) {
    dateRange.value = 'custom'
    customOpen.value = false
  }
  page.value = 0
})

watch(dateRange, (v) => {
  if (v !== 'custom') customCal.value = undefined
})

const dateCutoff = computed(() => {
  if (dateRange.value === 'all') return null
  if (dateRange.value === 'custom') return customStartIso.value
  const days = dateRange.value === '7d' ? 7 : dateRange.value === '30d' ? 30 : 90
  const d = new Date('2026-09-29')
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
})

// Upper bound only applies to a picked custom range -- presets are
// open-ended ("last N days up to today").
const dateEnd = computed(() => (dateRange.value === 'custom' ? customEndIso.value : null))

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return customers.filter((c) => {
    if (statusFilter.value.size && !statusFilter.value.has(c.status)) return false
    if (planFilter.value.size && !planFilter.value.has(c.plan)) return false
    if (dateCutoff.value && c.lastSeen < dateCutoff.value) return false
    if (dateEnd.value && c.lastSeen > dateEnd.value) return false
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

const allOnPageChecked = computed(() => paged.value.length > 0 && paged.value.every(c => selected.value.has(c.id)))
const someOnPageChecked = computed(() => paged.value.some(c => selected.value.has(c.id)) && !allOnPageChecked.value)
const allFilteredChecked = computed(() => sorted.value.length > 0 && sorted.value.every(c => selected.value.has(c.id)))

function togglePage(v: boolean) {
  const next = new Set(selected.value)
  for (const c of paged.value) {
    if (v) next.add(c.id)
    else next.delete(c.id)
  }
  selected.value = next
}

function selectAllFiltered() {
  selected.value = new Set(sorted.value.map(c => c.id))
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

// WHY (Rule15): money formatting is centralized in @/lib/utils so the
// data table, forms billing and locations headcount agree on "$0".
// (formatMoney/formatNumber are imported above; zero renders as $0/0,
// muted at the call site -- never an em-dash, Rule80.)

// Screen readers announce the active sort from aria-sort on the header cell.
function ariaSort(key: SortKey): 'ascending' | 'descending' | 'none' {
  if (sortKey.value !== key) return 'none'
  return sortDir.value === 'asc' ? 'ascending' : 'descending'
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
  // WHY (Rule72): the default window is 30d, not all-time -- revenue is
  // their job sort and recent data is the working set.
  dateRange.value = '30d'
  customCal.value = undefined
  sortKey.value = 'mrr'
  sortDir.value = 'desc'
}

function openDetail(c: Customer) {
  detailCustomer.value = c
  detailOpen.value = true
}

// WHY (Rule67): the "Copy ID" menu item really copies (clipboard API with a
// textarea fallback for non-secure contexts) instead of sitting dead.
async function copyText(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text)
  }
  catch {
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    ta.remove()
  }
  toast.success(label)
}

function customerIdOf(c: Customer) {
  return `cus_${c.id.padStart(6, '0')}`
}

function copyCustomerId(c: Customer) {
  copyText(customerIdOf(c), t('dashboard.table.copied'))
}

// CSV builds from currently visible columns and the filtered+sorted set --
// matches what the user sees on screen, not the raw dataset.
function exportCsv() {
  const cols = columns.value.filter(c => visibleCols.value.has(c.key))
  const header = cols.map(c => c.label).join(',')
  const rows = sorted.value.map(row =>
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

const dateRangeLabel = computed<Record<DateRange, string>>(() => ({
  'all': 'All time',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  'custom': customSpan.value ?? t('dashboard.range.custom'),
}))

const cellPad = computed(() => (density.value === 'compact' ? 'py-1.5' : 'py-3'))
const visibleCount = computed(() => columns.value.filter(c => visibleCols.value.has(c.key)).length + 2)

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('')
}

// Hashed pick from the chart-N/15 set -- keeps each customer's avatar
// stable across renders without storing a seed in the row data.
const avatarTones = [
  'bg-chart-1/15 text-chart-1',
  'bg-chart-2/15 text-chart-2',
  'bg-chart-3/15 text-chart-3',
  'bg-chart-4/15 text-chart-4',
  'bg-chart-5/15 text-chart-5',
]

function avatarTone(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return avatarTones[h % avatarTones.length]
}

const planChipTone: Record<Plan, string> = {
  Free: 'bg-muted text-muted-foreground',
  Pro: 'bg-chart-1/15 text-foreground',
  Team: 'bg-chart-2/15 text-foreground',
  Enterprise: 'bg-chart-3/15 text-foreground',
}

interface TimelineEvent {
  icon: typeof Mail
  title: string
  meta: string
  tone: string
}

// Synthesised activity -- in production this would come from
// `/api/customers/:id/events`; the shape is deterministic from the row
// data so the demo doesn't churn between opens.
function timelineFor(c: Customer): TimelineEvent[] {
  const events: TimelineEvent[] = []
  events.push({ icon: UserPlus, title: 'Account created', meta: c.createdAt, tone: 'text-muted-foreground' })
  if (c.status === 'invited') {
    events.push({ icon: Mail, title: 'Invite email sent', meta: c.lastSeen, tone: 'text-warning' })
  }
  else if (c.status === 'trial') {
    events.push({ icon: Activity, title: 'Trial started', meta: c.lastSeen, tone: 'text-info' })
  }
  else if (c.status === 'churned') {
    events.push({ icon: CreditCard, title: 'Subscription ended', meta: c.lastSeen, tone: 'text-destructive' })
  }
  else {
    events.push({ icon: CreditCard, title: `Renewed at ${formatMoney(c.mrr)}/mo`, meta: c.lastSeen, tone: 'text-success' })
    events.push({ icon: Users, title: `${c.seats} seats provisioned`, meta: c.lastSeen, tone: 'text-muted-foreground' })
  }
  return events
}
</script>

<template>
  <Page>
    <PageHeader>
      <PageHeaderHeading
        :title="title"
        :description="`${customers.length} accounts · ${sorted.length} after filters · ${selected.size} selected`"
      />
      <template #actions>
        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            @click="exportCsv"
          >
            <Download
              class="size-4"
              aria-hidden="true"
            />Export CSV
          </Button>
          <Button size="sm">
            <Plus
              class="size-4"
              aria-hidden="true"
            />Add customer
          </Button>
        </div>
      </template>
    </PageHeader>

    <!-- ClientOnly: the TanStack-driven table + its Reka controls (select,
         checkbox, dropdown) resolve internal state in the browser, producing a
         benign SSR hydration mismatch. Render the interactive grid client-side. -->
    <ClientOnly>
      <PageBody>
        <Card class="overflow-hidden">
          <CardHeader class="flex flex-col gap-3 space-y-0 border-b px-4">
            <div class="flex flex-wrap items-center gap-2">
              <div class="relative min-w-0 flex-1 md:max-w-xs md:min-w-48">
                <Search
                  class="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2"
                  aria-hidden="true"
                />
                <Input
                  v-model="search"
                  placeholder="Search name, email, country…"
                  aria-label="Search customers"
                  class="h-8 pl-7 text-sm"
                />
              </div>

              <!-- Below md the secondary filters live in one "Filters" sheet. -->
              <Button
                variant="outline"
                size="sm"
                class="h-8 gap-1.5 text-xs md:hidden"
                @click="filtersOpen = true"
              >
                <SlidersHorizontal
                  class="size-3.5"
                  aria-hidden="true"
                />Filters
                <Badge
                  v-if="statusFilter.size + planFilter.size + (dateRange !== 'all' ? 1 : 0)"
                  variant="secondary"
                  class="ml-1 h-4 px-1.5 text-xs tabular-nums"
                >
                  {{ statusFilter.size + planFilter.size + (dateRange !== 'all' ? 1 : 0) }}
                </Badge>
              </Button>

              <div class="hidden md:contents">
                <Popover>
                  <PopoverTrigger as-child>
                    <Button
                      variant="outline"
                      size="sm"
                      class="h-8 gap-1.5 text-xs"
                    >
                      <Filter class="size-3.5" />Status
                      <Badge
                        v-if="statusFilter.size"
                        variant="secondary"
                        class="ml-1 h-4 px-1.5 text-xs"
                      >
                        {{ statusFilter.size }}
                      </Badge>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    class="w-48 p-1"
                  >
                    <button
                      v-for="s in STATUSES"
                      :key="s"
                      class="hover:bg-accent focus-visible:ring-ring flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs capitalize focus-visible:ring-2 focus-visible:outline-none"
                      @click="statusFilter = toggleSetValue(statusFilter, s)"
                    >
                      <span class="flex items-center gap-2">
                        <span :class="['size-2 rounded-full', statusDot[s]]" />
                        {{ s }}
                      </span>
                      <Check
                        v-if="statusFilter.has(s)"
                        class="text-muted-foreground size-3"
                      />
                    </button>
                    <Separator class="my-1" />
                    <button
                      class="text-muted-foreground hover:bg-accent focus-visible:ring-ring w-full rounded px-2 py-1.5 text-left text-xs focus-visible:ring-2 focus-visible:outline-none"
                      @click="statusFilter = new Set()"
                    >
                      Clear
                    </button>
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger as-child>
                    <Button
                      variant="outline"
                      size="sm"
                      class="h-8 gap-1.5 text-xs"
                    >
                      <Filter class="size-3.5" />Plan
                      <Badge
                        v-if="planFilter.size"
                        variant="secondary"
                        class="ml-1 h-4 px-1.5 text-xs"
                      >
                        {{ planFilter.size }}
                      </Badge>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    class="w-44 p-1"
                  >
                    <button
                      v-for="p in PLANS"
                      :key="p"
                      class="hover:bg-accent focus-visible:ring-ring flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs focus-visible:ring-2 focus-visible:outline-none"
                      @click="planFilter = toggleSetValue(planFilter, p)"
                    >
                      {{ p }}
                      <Check
                        v-if="planFilter.has(p)"
                        class="text-muted-foreground size-3"
                      />
                    </button>
                    <Separator class="my-1" />
                    <button
                      class="text-muted-foreground hover:bg-accent focus-visible:ring-ring w-full rounded px-2 py-1.5 text-left text-xs focus-visible:ring-2 focus-visible:outline-none"
                      @click="planFilter = new Set()"
                    >
                      Clear
                    </button>
                  </PopoverContent>
                </Popover>

                <Select v-model="dateRange">
                  <SelectTrigger
                    size="sm"
                    class="h-8 w-[140px] text-xs"
                  >
                    <SelectValue :placeholder="dateRangeLabel[dateRange]" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      All time
                    </SelectItem>
                    <SelectItem value="7d">
                      Last 7 days
                    </SelectItem>
                    <SelectItem value="30d">
                      Last 30 days
                    </SelectItem>
                    <SelectItem value="90d">
                      Last 90 days
                    </SelectItem>
                    <SelectItem value="custom">
                      {{ t('dashboard.range.custom') }}
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Popover
                  v-if="dateRange === 'custom'"
                  v-model:open="customOpen"
                >
                  <PopoverTrigger as-child>
                    <Button
                      variant="outline"
                      size="sm"
                      class="h-8 gap-1.5 text-xs"
                    >
                      <CalendarIcon class="size-3.5" />{{ customSpan ?? t('dashboard.range.pickCustom') }}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    class="w-auto p-0"
                  >
                    <RangeCalendar v-model="customCal" />
                  </PopoverContent>
                </Popover>

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
                  <ToggleGroup
                    v-model="density"
                    type="single"
                    size="sm"
                    variant="outline"
                    class="h-8"
                  >
                    <ToggleGroupItem
                      value="compact"
                      class="h-8 px-2 text-xs"
                    >
                      Compact
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="comfortable"
                      class="h-8 px-2 text-xs"
                    >
                      Cozy
                    </ToggleGroupItem>
                  </ToggleGroup>

                  <Popover>
                    <PopoverTrigger as-child>
                      <Button
                        variant="outline"
                        size="sm"
                        class="h-8 gap-1.5 text-xs"
                      >
                        <Columns3 class="size-3.5" />Columns
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="end"
                      class="w-44 p-1"
                    >
                      <button
                        v-for="c in columns"
                        :key="c.key"
                        class="hover:bg-accent flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs"
                        @click="toggleColumn(c.key)"
                      >
                        {{ c.label }}
                        <Check
                          v-if="isVisible(c.key)"
                          class="text-muted-foreground size-3"
                        />
                      </button>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <!-- WHY (Rule70): active filters read as removable chips carrying
                 their VALUES (Status: active), not just counts -- the current
                 slice stays visible and each chip clears itself. -->
            <div
              v-if="statusFilter.size || planFilter.size || search.trim()"
              class="flex flex-wrap items-center gap-1.5"
            >
              <Badge
                v-for="s in statusFilter"
                :key="`status-${s}`"
                variant="secondary"
                class="gap-1 py-0.5 pr-1 text-xs capitalize"
              >
                {{ t('dashboard.table.chips.status') }}: {{ s }}
                <button
                  type="button"
                  class="hover:text-foreground focus-visible:ring-ring inline-flex items-center rounded-full p-0.5 focus-visible:ring-2 focus-visible:outline-none"
                  :aria-label="t('dashboard.table.chips.clear', { label: `${t('dashboard.table.chips.status')}: ${s}` })"
                  @click="statusFilter = toggleSetValue(statusFilter, s)"
                >
                  <X
                    class="size-3"
                    aria-hidden="true"
                  />
                </button>
              </Badge>
              <Badge
                v-for="p in planFilter"
                :key="`plan-${p}`"
                variant="secondary"
                class="gap-1 py-0.5 pr-1 text-xs"
              >
                {{ t('dashboard.table.chips.plan') }}: {{ p }}
                <button
                  type="button"
                  class="hover:text-foreground focus-visible:ring-ring inline-flex items-center rounded-full p-0.5 focus-visible:ring-2 focus-visible:outline-none"
                  :aria-label="t('dashboard.table.chips.clear', { label: `${t('dashboard.table.chips.plan')}: ${p}` })"
                  @click="planFilter = toggleSetValue(planFilter, p)"
                >
                  <X
                    class="size-3"
                    aria-hidden="true"
                  />
                </button>
              </Badge>
              <Badge
                v-if="search.trim()"
                variant="secondary"
                class="max-w-56 gap-1 py-0.5 pr-1 text-xs"
              >
                <span class="truncate">{{ t('dashboard.table.chips.search') }}: "{{ search.trim() }}"</span>
                <button
                  type="button"
                  class="hover:text-foreground focus-visible:ring-ring inline-flex shrink-0 items-center rounded-full p-0.5 focus-visible:ring-2 focus-visible:outline-none"
                  :aria-label="t('dashboard.table.chips.clear', { label: t('dashboard.table.chips.search') })"
                  @click="search = ''"
                >
                  <X
                    class="size-3"
                    aria-hidden="true"
                  />
                </button>
              </Badge>
            </div>

            <div
              v-if="selected.size > 0"
              class="bg-muted/40 -mx-4 -mb-3 flex flex-wrap items-center gap-2 border-t px-4 py-2 text-xs"
            >
              <span class="font-medium">{{ selected.size }} selected</span>
              <button
                v-if="allOnPageChecked && !allFilteredChecked && sorted.length > pageSize"
                class="text-primary underline-offset-2 hover:underline"
                @click="selectAllFiltered"
              >
                Select all {{ sorted.length }} matching
              </button>
              <div class="ml-auto flex items-center gap-2">
                <!-- WHY (Rule73): bulk-bar actions sit on the h-8 filter-bar
                     system, not h-7. -->
                <Button
                  variant="outline"
                  size="sm"
                  class="h-8 text-xs"
                >
                  Email
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  class="h-8 text-xs"
                >
                  Change plan
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  class="text-destructive h-8 text-xs"
                >
                  Archive
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  class="h-8 text-xs"
                  @click="clearSelection"
                >
                  Clear
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent class="p-0">
            <div class="max-h-[70vh] overflow-auto">
              <Table>
                <!-- WHY (Rule28/35): the hairline is the component's border-b,
                     not a shadow utility -- elevation never draws dividers. -->
                <TableHeader class="bg-background sticky top-0 z-10 border-b">
                  <TableRow>
                    <TableHead class="w-10 pl-4">
                      <Checkbox
                        :model-value="allOnPageChecked ? true : someOnPageChecked ? 'indeterminate' : false"
                        @update:model-value="(v) => togglePage(Boolean(v))"
                      />
                    </TableHead>
                    <template
                      v-for="c in columns"
                      :key="c.key"
                    >
                      <TableHead
                        v-if="isVisible(c.key)"
                        scope="col"
                        :aria-sort="c.sortable ? ariaSort(c.key as SortKey) : undefined"
                        :class="c.alignRight ? 'text-right' : ''"
                      >
                        <button
                          v-if="c.sortable"
                          :class="['hover:text-foreground focus-visible:ring-ring inline-flex items-center gap-1 rounded-sm font-medium focus-visible:ring-2 focus-visible:outline-none', c.alignRight ? 'ml-auto' : '']"
                          @click="toggleSort(c.key as SortKey, c.sortable)"
                        >
                          {{ c.label }}<component
                            :is="sortIcon(c.key as SortKey)"
                            class="size-3"
                          />
                        </button>
                        <span v-else>{{ c.label }}</span>
                      </TableHead>
                    </template>
                    <TableHead class="w-10" />
                  </TableRow>
                </TableHeader>

                <TableBody v-if="loading">
                  <TableRow
                    v-for="i in pageSize"
                    :key="`sk-${i}`"
                  >
                    <TableCell :class="['pl-4', cellPad]">
                      <Skeleton class="size-4 rounded" />
                    </TableCell>
                    <TableCell
                      v-for="c in columns.filter((c) => isVisible(c.key))"
                      :key="c.key"
                      :class="[cellPad]"
                    >
                      <Skeleton :class="['h-3', c.key === 'name' ? 'w-40' : 'w-16']" />
                    </TableCell>
                    <TableCell :class="cellPad">
                      <Skeleton class="size-4 rounded" />
                    </TableCell>
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
                    <TableCell
                      :class="['pl-4', cellPad]"
                      @click.stop
                    >
                      <Checkbox
                        :model-value="selected.has(c.id)"
                        @update:model-value="(v) => toggleRow(c.id, Boolean(v))"
                      />
                    </TableCell>
                    <TableCell
                      v-if="isVisible('name')"
                      :class="cellPad"
                    >
                      <div class="font-medium">
                        {{ c.name }}
                      </div>
                      <div class="text-muted-foreground text-xs">
                        {{ c.email }}
                      </div>
                    </TableCell>
                    <TableCell
                      v-if="isVisible('plan')"
                      :class="['text-muted-foreground', cellPad]"
                    >
                      {{ c.plan }}
                    </TableCell>
                    <TableCell
                      v-if="isVisible('status')"
                      :class="cellPad"
                    >
                      <Badge
                        variant="outline"
                        :class="['gap-1 px-2 text-xs font-medium capitalize', statusTone[c.status]]"
                      >
                        {{ c.status }}
                      </Badge>
                    </TableCell>
                    <TableCell
                      v-if="isVisible('mrr')"
                      :class="['text-right tabular-nums', cellPad, c.mrr === 0 && 'text-muted-foreground']"
                    >
                      {{ formatMoney(c.mrr) }}
                    </TableCell>
                    <TableCell
                      v-if="isVisible('seats')"
                      :class="['text-muted-foreground text-right tabular-nums', cellPad]"
                    >
                      {{ formatNumber(c.seats) }}
                    </TableCell>
                    <TableCell
                      v-if="isVisible('country')"
                      :class="['text-muted-foreground', cellPad]"
                    >
                      {{ c.country }}
                    </TableCell>
                    <TableCell
                      v-if="isVisible('lastSeen')"
                      :class="['text-muted-foreground text-xs tabular-nums', cellPad]"
                    >
                      {{ c.lastSeen }}
                    </TableCell>
                    <TableCell
                      v-if="isVisible('createdAt')"
                      :class="['text-muted-foreground text-xs tabular-nums', cellPad]"
                    >
                      {{ c.createdAt }}
                    </TableCell>
                    <TableCell
                      :class="cellPad"
                      @click.stop
                    >
                      <DropdownMenu>
                        <TooltipProvider :delay-duration="300">
                          <Tooltip>
                            <TooltipTrigger as-child>
                              <DropdownMenuTrigger as-child>
                                <!-- WHY (Rule76/87): row actions are a 32px
                                     trigger with both an accessible name and
                                     a tooltip -- icon-only never goes naked. -->
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  class="size-8"
                                  :aria-label="`${t('dashboard.table.rowActions')} — ${c.name}`"
                                >
                                  <MoreHorizontal class="size-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                            </TooltipTrigger>
                            <TooltipContent>{{ t('dashboard.table.rowActions') }}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem @click="openDetail(c)">
                            View details
                          </DropdownMenuItem>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Email</DropdownMenuItem>
                          <DropdownMenuItem @click="copyCustomerId(c)">
                            Copy ID
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem class="text-destructive">
                            Archive
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  <TableEmpty
                    v-if="paged.length === 0"
                    :colspan="visibleCount"
                  >
                    <div class="flex flex-col items-center gap-2 py-4">
                      <SlidersHorizontal class="text-muted-foreground size-5" />
                      <p class="text-sm">
                        No customers match your filters.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        class="h-7 text-xs"
                        @click="resetFilters"
                      >
                        Reset filters
                      </Button>
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
                  <SelectTrigger
                    size="sm"
                    class="h-7 w-[68px] text-xs"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem :value="5">
                      5
                    </SelectItem>
                    <SelectItem :value="10">
                      10
                    </SelectItem>
                    <SelectItem :value="20">
                      20
                    </SelectItem>
                    <SelectItem :value="50">
                      50
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <span class="text-muted-foreground tabular-nums">Page {{ page + 1 }} of {{ pageCount }}</span>

              <div class="flex items-center gap-1">
                <!-- WHY (Rule76/87): pagination triggers are 32px with both
                     aria-labels and tooltips. -->
                <TooltipProvider :delay-duration="300">
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <Button
                        variant="outline"
                        size="icon"
                        class="size-8"
                        :disabled="page === 0"
                        :aria-label="t('dashboard.table.pagination.first')"
                        @click="page = 0"
                      >
                        <ChevronsLeft class="size-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{{ t('dashboard.table.pagination.first') }}</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <Button
                        variant="outline"
                        size="icon"
                        class="size-8"
                        :disabled="page === 0"
                        :aria-label="t('dashboard.table.pagination.prev')"
                        @click="page--"
                      >
                        <ChevronLeft class="size-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{{ t('dashboard.table.pagination.prev') }}</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <Button
                        variant="outline"
                        size="icon"
                        class="size-8"
                        :disabled="page >= pageCount - 1"
                        :aria-label="t('dashboard.table.pagination.next')"
                        @click="page++"
                      >
                        <ChevronRight class="size-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{{ t('dashboard.table.pagination.next') }}</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <Button
                        variant="outline"
                        size="icon"
                        class="size-8"
                        :disabled="page >= pageCount - 1"
                        :aria-label="t('dashboard.table.pagination.last')"
                        @click="page = pageCount - 1"
                      >
                        <ChevronsRight class="size-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{{ t('dashboard.table.pagination.last') }}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </Card>
      </PageBody>

      <Sheet v-model:open="detailOpen">
        <SheetContent class="sm:max-w-md">
          <template v-if="detailCustomer">
            <SheetHeader>
              <div class="flex items-start gap-3">
                <Avatar
                  size="lg"
                  rounded="lg"
                  class="ring-background ring-2 shadow-sm"
                >
                  <AvatarFallback :class="['text-sm font-semibold', avatarTone(detailCustomer.name)]">
                    {{ initials(detailCustomer.name) }}
                  </AvatarFallback>
                </Avatar>
                <div class="min-w-0 flex-1 space-y-1">
                  <SheetTitle
                    class="truncate text-base leading-tight"
                    :title="detailCustomer.name"
                  >
                    {{ detailCustomer.name }}
                  </SheetTitle>
                  <SheetDescription class="flex items-center gap-1 text-xs">
                    <Mail
                      class="size-3.5"
                      aria-hidden="true"
                    />{{ detailCustomer.email }}
                  </SheetDescription>
                  <div class="flex items-center gap-1.5 pt-1">
                    <Badge
                      variant="outline"
                      :class="['gap-1 px-2 py-0.5 text-xs font-medium capitalize', statusTone[detailCustomer.status]]"
                    >
                      <span :class="['size-1.5 rounded-full', statusDot[detailCustomer.status]]" />
                      {{ detailCustomer.status }}
                    </Badge>
                    <span :class="['rounded-full px-2 py-0.5 text-xs font-medium', planChipTone[detailCustomer.plan]]">
                      {{ detailCustomer.plan }}
                    </span>
                    <span class="text-muted-foreground inline-flex items-center gap-1 text-xs">
                      <MapPin
                        class="size-3.5"
                        aria-hidden="true"
                      />{{ detailCustomer.country }}
                    </span>
                  </div>
                </div>
              </div>
            </SheetHeader>

            <SheetBody class="p-0">
              <div class="grid grid-cols-3 gap-px border-b bg-border">
                <div class="bg-background flex flex-col gap-1 px-4 py-3">
                  <span class="text-muted-foreground inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider">
                    <CreditCard
                      class="size-3.5"
                      aria-hidden="true"
                    />MRR
                  </span>
                  <span class="text-base font-semibold tabular-nums">{{ formatMoney(detailCustomer.mrr) }}</span>
                  <span
                    v-if="detailCustomer.mrr > 0"
                    class="text-success inline-flex items-center gap-0.5 text-xs font-medium tabular-nums"
                  >
                    <ArrowUpRight
                      class="size-3.5"
                      aria-hidden="true"
                    />{{ Math.round(detailCustomer.mrr * 12 / 1000) }}k ARR
                  </span>
                  <span
                    v-else
                    class="text-muted-foreground text-xs"
                  >No revenue</span>
                </div>
                <div class="bg-background flex flex-col gap-1 px-4 py-3">
                  <span class="text-muted-foreground inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider">
                    <Users
                      class="size-3.5"
                      aria-hidden="true"
                    />Seats
                  </span>
                  <span class="text-base font-semibold tabular-nums">{{ detailCustomer.seats || 0 }}</span>
                  <span
                    v-if="detailCustomer.seats"
                    class="text-muted-foreground tabular-nums text-xs"
                  >
                    ${{ Math.round(detailCustomer.mrr / detailCustomer.seats) }}/seat
                  </span>
                  <span
                    v-else
                    class="text-muted-foreground text-xs"
                  >No seats</span>
                </div>
                <div class="bg-background flex flex-col gap-1 px-4 py-3">
                  <span class="text-muted-foreground inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider">
                    <Building2
                      class="size-3.5"
                      aria-hidden="true"
                    />Tier
                  </span>
                  <span class="text-base font-semibold">{{ detailCustomer.plan }}</span>
                  <span class="text-muted-foreground text-xs">{{ detailCustomer.status === 'active' ? 'Renews monthly' : detailCustomer.status === 'trial' ? 'Trial period' : detailCustomer.status === 'invited' ? 'Awaiting accept' : 'Cancelled' }}</span>
                </div>
              </div>

              <dl class="divide-border divide-y px-4 text-sm">
                <div class="flex items-center justify-between py-2.5">
                  <dt class="text-muted-foreground text-xs">
                    Customer ID
                  </dt>
                  <dd class="font-mono text-xs">
                    {{ detailCustomer ? customerIdOf(detailCustomer) : '' }}
                  </dd>
                </div>
                <div class="flex items-center justify-between py-2.5">
                  <dt class="text-muted-foreground text-xs">
                    Customer since
                  </dt>
                  <dd class="tabular-nums text-xs">
                    {{ detailCustomer.createdAt }}
                  </dd>
                </div>
                <div class="flex items-center justify-between py-2.5">
                  <dt class="text-muted-foreground text-xs">
                    Last seen
                  </dt>
                  <dd class="tabular-nums text-xs">
                    {{ detailCustomer.lastSeen }}
                  </dd>
                </div>
                <div class="flex items-center justify-between py-2.5">
                  <dt class="text-muted-foreground text-xs">
                    Country
                  </dt>
                  <dd class="text-xs">
                    {{ detailCustomer.country }}
                  </dd>
                </div>
              </dl>

              <div class="border-t px-4 py-4">
                <div class="text-muted-foreground mb-3 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider">
                  <Activity
                    class="size-3.5"
                    aria-hidden="true"
                  />Recent activity
                </div>
                <ol class="relative space-y-3 pl-5">
                  <span class="bg-border absolute top-1 bottom-1 left-[7px] w-px" />
                  <li
                    v-for="(ev, i) in timelineFor(detailCustomer)"
                    :key="i"
                    class="relative"
                  >
                    <span class="bg-background border-border absolute -left-5 top-0.5 inline-flex size-4 items-center justify-center rounded-full border">
                      <component
                        :is="ev.icon"
                        :class="['size-2.5', ev.tone]"
                      />
                    </span>
                    <div class="text-xs font-medium leading-tight">
                      {{ ev.title }}
                    </div>
                    <div class="text-muted-foreground tabular-nums text-xs">
                      {{ ev.meta }}
                    </div>
                  </li>
                </ol>
              </div>
            </SheetBody>

            <SheetFooter class="flex-row items-center">
              <Button
                size="sm"
                class="h-8 flex-1 text-xs"
              >
                Open profile
              </Button>
              <Button
                variant="outline"
                size="sm"
                class="h-8 gap-1.5 text-xs"
              >
                <Mail class="size-3.5" />Email
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button
                    variant="outline"
                    size="icon"
                    class="size-8"
                  >
                    <MoreHorizontal class="size-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem>Change plan</DropdownMenuItem>
                  <DropdownMenuItem
                    v-if="detailCustomer"
                    @click="copyCustomerId(detailCustomer)"
                  >
                    Copy ID
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem class="text-destructive">
                    Archive
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SheetFooter>
          </template>
        </SheetContent>
      </Sheet>

      <!-- Mobile filters: same state as the md+ toolbar controls. -->
      <Sheet v-model:open="filtersOpen">
        <SheetContent
          side="bottom"
          class="max-h-[85dvh]"
        >
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>Narrow the list and choose what the table shows.</SheetDescription>
          </SheetHeader>
          <SheetBody class="space-y-4">
            <section class="space-y-2">
              <h3 class="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                Status
              </h3>
              <div class="flex flex-wrap gap-2">
                <Button
                  v-for="s in STATUSES"
                  :key="s"
                  :variant="statusFilter.has(s) ? 'secondary' : 'outline'"
                  size="sm"
                  class="gap-1.5 capitalize"
                  :aria-pressed="statusFilter.has(s)"
                  @click="statusFilter = toggleSetValue(statusFilter, s)"
                >
                  <span :class="['size-2 rounded-full', statusDot[s]]" />
                  {{ s }}
                </Button>
              </div>
            </section>

            <section class="space-y-2">
              <h3 class="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                Plan
              </h3>
              <div class="flex flex-wrap gap-2">
                <Button
                  v-for="p in PLANS"
                  :key="p"
                  :variant="planFilter.has(p) ? 'secondary' : 'outline'"
                  size="sm"
                  :aria-pressed="planFilter.has(p)"
                  @click="planFilter = toggleSetValue(planFilter, p)"
                >
                  <Check
                    v-if="planFilter.has(p)"
                    class="size-4"
                    aria-hidden="true"
                  />
                  {{ p }}
                </Button>
              </div>
            </section>

            <section class="space-y-2">
              <h3 class="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                Last seen
              </h3>
              <Select v-model="dateRange">
                <SelectTrigger
                  class="w-full"
                  aria-label="Last seen"
                >
                  <SelectValue :placeholder="dateRangeLabel[dateRange]" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All time
                  </SelectItem>
                  <SelectItem value="7d">
                    Last 7 days
                  </SelectItem>
                  <SelectItem value="30d">
                    Last 30 days
                  </SelectItem>
                  <SelectItem value="90d">
                    Last 90 days
                  </SelectItem>
                  <SelectItem value="custom">
                    {{ t('dashboard.range.custom') }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <RangeCalendar
                v-if="dateRange === 'custom'"
                v-model="customCal"
                class="rounded-md border"
              />
            </section>

            <section class="space-y-2">
              <h3 class="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                Density
              </h3>
              <ToggleGroup
                v-model="density"
                type="single"
                size="sm"
                variant="outline"
              >
                <ToggleGroupItem
                  value="compact"
                  class="px-3"
                >
                  Compact
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="comfortable"
                  class="px-3"
                >
                  Cozy
                </ToggleGroupItem>
              </ToggleGroup>
            </section>

            <section class="space-y-2">
              <h3 class="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                Columns
              </h3>
              <div class="flex flex-wrap gap-2">
                <Button
                  v-for="c in columns"
                  :key="c.key"
                  :variant="isVisible(c.key) ? 'secondary' : 'outline'"
                  size="sm"
                  :aria-pressed="isVisible(c.key)"
                  @click="toggleColumn(c.key)"
                >
                  <Check
                    v-if="isVisible(c.key)"
                    class="size-4"
                    aria-hidden="true"
                  />
                  {{ c.label }}
                </Button>
              </div>
            </section>
          </SheetBody>
          <SheetFooter class="flex-row items-center">
            <Button
              variant="outline"
              class="flex-1"
              @click="resetFilters"
            >
              <RotateCcw
                class="size-4"
                aria-hidden="true"
              />Reset
            </Button>
            <Button
              class="flex-1"
              @click="filtersOpen = false"
            >
              Show {{ sorted.length }} results
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </ClientOnly>
  </Page>
</template>
