import { computed, ref, type Component, type Ref } from 'vue'
import {
  AlertTriangle, CheckCircle2, CreditCard, GitBranch, MessageSquare,
  ShieldAlert, UserPlus,
} from 'lucide-vue-next'

export type Range = '24h' | '7d' | '30d' | 'qtd' | 'ytd'

// Human label per range. Powers the funnel + hourly-requests subtitles
// so the descriptive copy stays in sync with the selected tab.
const RANGE_LABEL: Record<Range, string> = {
  '24h': 'Last 24 hours',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  qtd: 'Quarter to date',
  ytd: 'Year to date',
}

// Deterministic spark generator -- no Math.random() so SSR + client
// produce identical arrays. The smooth (start → end) ramp + a small
// sinusoidal noise term reads as a trend on a 36px-tall sparkline
// without any seed library.
function spark(len: number, start: number, end: number, jitter: number, seed: number): number[] {
  return Array.from({ length: len }, (_, i) => {
    const t = len <= 1 ? 1 : i / (len - 1)
    const base = start + (end - start) * t
    const noise = Math.sin((i + seed) * 9.3) * jitter
    return Math.round((base + noise) * 100) / 100
  })
}

interface KpiBlock {
  mrr: { delta: string }
  users: { delta: string }
  rpm: { delta: string }
  conversion: { delta: string }
  latency: { delta: string }
  churn: { delta: string }
  spark: {
    revenue: number[]
    users: number[]
    requests: number[]
    conversion: number[]
    latency: number[]
  }
}

// Per-range deltas + spark trends. Headline values (MRR, current
// users, current latency, etc.) stay constant across ranges -- they
// are point-in-time snapshots. The DELTA and the spark are what the
// selected window actually changes, matching how real dashboards work.
const KPI_BY_RANGE: Record<Range, KpiBlock> = {
  '24h': {
    mrr: { delta: '+0.4%' },
    users: { delta: '+1.1%' },
    rpm: { delta: '+1.2%' },
    conversion: { delta: '+0.1pp' },
    latency: { delta: '+3ms' },
    churn: { delta: '-0.05pp' },
    spark: {
      revenue: spark(24, 4500, 4720, 60, 11),
      users: spark(24, 12500, 12847, 80, 7),
      requests: spark(24, 2300, 2484, 90, 3),
      conversion: spark(24, 7.2, 7.4, 0.1, 5),
      latency: spark(24, 408, 412, 4, 13),
    },
  },
  '7d': {
    mrr: { delta: '+2.8%' },
    users: { delta: '+3.4%' },
    rpm: { delta: '+4.2%' },
    conversion: { delta: '+0.3pp' },
    latency: { delta: '+9ms' },
    churn: { delta: '-0.1pp' },
    spark: {
      revenue: [4380, 4420, 4510, 4570, 4620, 4680, 4720],
      users: [11800, 12000, 12200, 12350, 12500, 12700, 12847],
      requests: [2100, 2180, 2240, 2300, 2360, 2420, 2484],
      conversion: [7.0, 7.1, 7.2, 7.25, 7.3, 7.35, 7.4],
      latency: [403, 406, 405, 408, 410, 411, 412],
    },
  },
  '30d': {
    mrr: { delta: '+12.4%' },
    users: { delta: '+8.1%' },
    rpm: { delta: '+12.0%' },
    conversion: { delta: '+0.6pp' },
    latency: { delta: '+18ms' },
    churn: { delta: '-0.3pp' },
    spark: {
      revenue: spark(30, 4180, 4720, 80, 17),
      users: spark(30, 11500, 12847, 120, 23),
      requests: spark(30, 2150, 2484, 110, 29),
      conversion: spark(30, 6.8, 7.4, 0.15, 31),
      latency: spark(30, 395, 412, 5, 37),
    },
  },
  qtd: {
    mrr: { delta: '+24.1%' },
    users: { delta: '+18.3%' },
    rpm: { delta: '+18.8%' },
    conversion: { delta: '+1.2pp' },
    latency: { delta: '+24ms' },
    churn: { delta: '-0.6pp' },
    spark: {
      revenue: spark(12, 3760, 4720, 120, 41),
      users: spark(12, 10800, 12847, 200, 43),
      requests: spark(12, 1980, 2484, 140, 47),
      conversion: spark(12, 6.2, 7.4, 0.2, 53),
      latency: spark(12, 388, 412, 7, 59),
    },
  },
  ytd: {
    mrr: { delta: '+58.6%' },
    users: { delta: '+42.5%' },
    rpm: { delta: '+28.4%' },
    conversion: { delta: '+2.1pp' },
    latency: { delta: '+47ms' },
    churn: { delta: '-1.1pp' },
    spark: {
      revenue: [2980, 3320, 3780, 4180, 4720],
      users: [9000, 9800, 10800, 11800, 12847],
      requests: [1880, 2080, 2240, 2360, 2484],
      conversion: [5.3, 5.9, 6.5, 7.0, 7.4],
      latency: [365, 380, 395, 405, 412],
    },
  },
}

// ── Per-range chart data ────────────────────────────────────────────
//
// Revenue / Requests / Funnel / Top products vary with the selected
// range. The static panels (treemap, calendar, alerts, customers,
// activities, quota gauge) are intentionally NOT range-aware -- they
// own their own intrinsic period.

interface RevenuePoint { x: string; revenue: number; expenses: number }

// Smooth deterministic generator for medium-length series.
function genSeries(len: number, rStart: number, rEnd: number, eStart: number, eEnd: number, seed: number): RevenuePoint[] {
  return Array.from({ length: len }, (_, i) => {
    const t = len <= 1 ? 1 : i / (len - 1)
    return {
      x: String(i + 1),
      revenue: Math.round(rStart + (rEnd - rStart) * t + Math.sin((i + seed) * 0.7) * (rEnd - rStart) * 0.06),
      expenses: Math.round(eStart + (eEnd - eStart) * t + Math.sin((i + seed) * 0.9) * (eEnd - eStart) * 0.05),
    }
  })
}

const revenueByRange: Record<Range, RevenuePoint[]> = {
  '24h': Array.from({ length: 24 }, (_, h) => ({
    x: `${String(h).padStart(2, '0')}:00`,
    revenue: Math.round(150 + Math.sin((h - 6) / 24 * Math.PI * 2) * 90 + ((h * 7) % 40)),
    expenses: Math.round(80 + Math.sin((h - 8) / 24 * Math.PI * 2) * 30 + ((h * 11) % 20)),
  })),
  '7d': [
    { x: 'Mon', revenue: 4380, expenses: 3120 },
    { x: 'Tue', revenue: 4480, expenses: 3210 },
    { x: 'Wed', revenue: 4560, expenses: 3260 },
    { x: 'Thu', revenue: 4620, expenses: 3300 },
    { x: 'Fri', revenue: 4720, expenses: 3380 },
    { x: 'Sat', revenue: 3920, expenses: 2940 },
    { x: 'Sun', revenue: 3680, expenses: 2820 },
  ],
  '30d': genSeries(30, 4180, 4720, 3000, 3380, 17),
  qtd: genSeries(12, 28000, 33000, 20000, 23000, 41).map((p, i) => ({ ...p, x: `W${i + 1}` })),
  ytd: [
    { x: 'Jan', revenue: 184000, expenses: 108000 },
    { x: 'Feb', revenue: 172000, expenses: 112000 },
    { x: 'Mar', revenue: 198000, expenses: 118000 },
    { x: 'Apr', revenue: 224000, expenses: 124000 },
    { x: 'May', revenue: 248000, expenses: 132000 },
  ],
}

interface RequestsBlock {
  title: string
  subtitle: string
  data: { x: string; y: number }[]
}

const requestsByRange: Record<Range, RequestsBlock> = {
  '24h': {
    title: 'Requests by hour',
    subtitle: 'Today · UTC',
    data: Array.from({ length: 24 }, (_, h) => ({
      x: `${String(h).padStart(2, '0')}:00`,
      // Deterministic so SSR + client match (no Math.random).
      y: Math.round(800 + Math.sin((h - 6) / 24 * Math.PI * 2) * 500 + ((h * 53) % 200)),
    })),
  },
  '7d': {
    title: 'Requests by day',
    subtitle: 'Last 7 days · UTC',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => ({
      x: d,
      y: Math.round(28000 + Math.sin(i * 1.1) * 4200 + i * 380),
    })),
  },
  '30d': {
    title: 'Requests by day',
    subtitle: 'Last 30 days · UTC',
    data: Array.from({ length: 30 }, (_, i) => ({
      x: String(i + 1),
      y: Math.round(26000 + Math.sin(i * 0.7) * 3800 + ((i * 17) % 2400)),
    })),
  },
  qtd: {
    title: 'Requests by week',
    subtitle: 'Quarter to date · UTC',
    data: Array.from({ length: 12 }, (_, i) => ({
      x: `W${i + 1}`,
      y: Math.round(180000 + Math.sin(i * 0.9) * 24000 + i * 2400),
    })),
  },
  ytd: {
    title: 'Requests by month',
    subtitle: 'Year to date · UTC',
    data: ['Jan', 'Feb', 'Mar', 'Apr', 'May'].map((m, i) => ({
      x: m,
      y: Math.round(720000 + i * 86000 + Math.sin(i * 1.2) * 38000),
    })),
  },
}

// Funnel: ratios stay constant across ranges (60% → 40% → 30% → 25%);
// only the absolute visitor count scales with the window.
function buildFunnel(visitors: number) {
  const signups = Math.round(visitors * 0.6)
  const activated = Math.round(signups * 0.4)
  const paid = Math.round(activated * 0.3)
  const retained = Math.round(paid * 0.25)
  return [
    { name: 'Visitors', value: visitors, realValue: visitors },
    { name: 'Sign-ups', value: signups, realValue: signups },
    { name: 'Activated', value: activated, realValue: activated },
    { name: 'Paid', value: activated, realValue: paid },
    { name: 'Retained 30d', value: activated, realValue: retained },
  ]
}

const VISITORS_BY_RANGE: Record<Range, number> = {
  '24h': 820,
  '7d': 5740,
  '30d': 24850,
  qtd: 74600,
  ytd: 124200,
}

// Top products: identity stays constant, only the change% varies per
// range (longer window → bigger swing). Base list + per-range string
// table beats repeating five product objects five times.
const PRODUCT_BASE: Omit<Product, 'change'>[] = [
  { name: 'API · Pro tier', mrr: 48200, up: true },
  { name: 'Workspace · Team', mrr: 36400, up: true },
  { name: 'Batch endpoint', mrr: 14800, up: true },
  { name: 'Workspace · Enterprise', mrr: 12200, up: true },
  { name: 'API · Hobby', mrr: 4100, up: false },
]
const PRODUCT_CHANGE_BY_RANGE: Record<Range, string[]> = {
  '24h': ['+0.4%', '+0.3%', '+0.7%', '+0.1%', '-0.1%'],
  '7d': ['+2.8%', '+1.8%', '+4.9%', '+0.8%', '-0.5%'],
  '30d': ['+12.4%', '+8.1%', '+22.0%', '+3.8%', '-2.4%'],
  qtd: ['+24.1%', '+18.3%', '+38.2%', '+8.4%', '-4.2%'],
  ytd: ['+58.6%', '+42.5%', '+74.1%', '+18.7%', '-8.9%'],
}

// ── Remaining static data ───────────────────────────────────────────

export interface Activity {
  icon: Component
  iconClass: string
  title: string
  detail: string
  age: string
}

export interface Alert {
  icon: Component
  tone: string
  title: string
  detail: string
  age: string
}

export interface Customer {
  name: string
  plan: string
  mrr: number
  status: 'healthy' | 'at-risk' | 'churned'
  avatar: string
}

export interface Product {
  name: string
  mrr: number
  change: string
  up: boolean
}

export function useDashboardData(range: Ref<Range> = ref<Range>('30d')) {
  // Reactive views over the range tab. Static demo data (revenue
  // series, calendar heatmap, treemap, top products/customers,
  // activities, alerts) lives outside the per-range table on purpose
  // -- those panels have their own intrinsic period and don't
  // pretend to honour the selected range.
  const kpi = computed(() => KPI_BY_RANGE[range.value])
  const rangeLabel = computed(() => RANGE_LABEL[range.value])

  const revenueSeries = computed(() => revenueByRange[range.value])
  const requestsBlock = computed(() => requestsByRange[range.value])

  // Stepwise conversion rates: Sign-ups retains 60% of Visitors,
  // Activated 40% of Sign-ups, Paid 30% of Activated, Retained 25% of
  // Paid. End-to-end = 0.60 * 0.40 * 0.30 * 0.25 = 1.8% of Visitors.
  //
  // The two bottom stages (Paid, Retained 30d) carry the same `value`
  // as Activated so they render at the same trapezoid width -- a
  // deliberate "the funnel reaches a floor" look. `realValue` keeps
  // the actual count for the label formatter.
  const funnel = computed(() => buildFunnel(VISITORS_BY_RANGE[range.value]))

  // Custom funnel series so the bottom-three equal-size effect works
  // AND the inline labels show the real count rather than the
  // inflated visual value. `sort: 'none'` is important -- with three
  // identical values ECharts otherwise reshuffles the order.
  const funnelOption = computed(() => ({
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
        formatter: (p: { name: string; value: number; data?: { realValue?: number } }) =>
          `${p.name}\n${(p.data?.realValue ?? p.value).toLocaleString()}`,
      },
      labelLine: { length: 8, lineStyle: { width: 1, type: 'solid' } },
      itemStyle: { borderColor: '#fff', borderWidth: 1 },
      emphasis: { label: { fontSize: 13, fontWeight: 700 } },
      data: funnel.value,
    }],
  }))

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

  // Anchor to a fixed date so SSR + client produce identical strings
  // and values (Math.random() / new Date() would diverge between
  // renders and trigger a hydration text mismatch). Update this
  // baseline whenever the demo data is refreshed.
  const calendarAnchor = new Date('2026-05-15T00:00:00Z')
  function seeded(i: number): number {
    // Cheap deterministic pseudo-random: keeps the heatmap visually
    // busy without importing a seed library.
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

  const topProducts = computed<Product[]>(() =>
    PRODUCT_BASE.map((p, i) => ({ ...p, change: PRODUCT_CHANGE_BY_RANGE[range.value][i]! }))
  )

  const alerts: Alert[] = [
    { icon: ShieldAlert, tone: 'text-rose-500', title: 'Quantum rate-limit p99 breached', detail: '3,420/min vs 3,000 cap. 4 customers throttled.', age: '7m ago' },
    { icon: AlertTriangle, tone: 'text-amber-500', title: 'Background workers degraded', detail: 'p95 412ms over last 8m. eu-west region only.', age: '38m ago' },
    { icon: CheckCircle2, tone: 'text-emerald-500', title: 'Deploy succeeded on main', detail: 'commit 4e8a91c — Dashboard reset.', age: '1h ago' },
  ]

  const topCustomers: Customer[] = [
    { name: 'Northwind Industries', plan: 'Enterprise', mrr: 4800, status: 'healthy', avatar: 'NI' },
    { name: 'Sentinel Labs', plan: 'Enterprise', mrr: 3600, status: 'healthy', avatar: 'SL' },
    { name: 'Apex Logistics', plan: 'Pro', mrr: 1200, status: 'at-risk', avatar: 'AL' },
    { name: 'Olympus Robotics', plan: 'Enterprise', mrr: 5200, status: 'healthy', avatar: 'OR' },
    { name: 'Crescent Health', plan: 'Pro', mrr: 1800, status: 'healthy', avatar: 'CH' },
    { name: 'Polaris Software', plan: 'Pro', mrr: 980, status: 'healthy', avatar: 'PS' },
  ]

  // Strip every bit of chrome (axes, grid, tooltip, legend) so a chart
  // fits inside a ~36-44px tall KPI tile without competing with the
  // big number above it. CAREFUL: never include a `series` key here --
  // the chart wrappers spread the option prop at the END of their
  // computed option object, so a stub series would clobber the
  // data-bound series and you'd see an empty chart. Series-shape
  // tweaks would belong in the chart components themselves, not in
  // consumer options.
  const miniChrome = {
    grid: { left: 0, right: 0, top: 2, bottom: 2, containLabel: false },
    xAxis: { show: false, axisLine: { show: false }, axisLabel: { show: false }, axisTick: { show: false }, splitLine: { show: false } },
    yAxis: { show: false, axisLine: { show: false }, axisLabel: { show: false }, axisTick: { show: false }, splitLine: { show: false } },
    tooltip: { show: false },
    legend: { show: false },
  }

  // Activity feed icons sit inside `IconBox variant="muted"`. The icon
  // category is communicated by the title text -- the icon hue does not
  // need to carry severity, so all six use `text-muted-foreground` for
  // a quiet, uniform feed. Use a semantic colour only where it carries
  // information the title doesn't already (alerts, status dots).
  const activities: Activity[] = [
    { icon: UserPlus, iconClass: 'text-muted-foreground', title: 'Olive Park accepted invite', detail: 'Joined Acme Inc as Member', age: '2m ago' },
    { icon: CreditCard, iconClass: 'text-muted-foreground', title: 'Northwind paid INV-2031', detail: '$2,400 via Visa ··4242', age: '47m ago' },
    { icon: GitBranch, iconClass: 'text-muted-foreground', title: 'Deploy succeeded on main', detail: 'commit 4e8a91c — Dashboard reset', age: '1h ago' },
    { icon: AlertTriangle, iconClass: 'text-muted-foreground', title: 'Background workers degraded', detail: 'p95 412ms over last 8m', age: '3h ago' },
    { icon: MessageSquare, iconClass: 'text-muted-foreground', title: 'Sentinel Labs left feedback', detail: '"Streaming citations are a game-changer"', age: '5h ago' },
    { icon: CheckCircle2, iconClass: 'text-muted-foreground', title: 'Daily report sent to ops@acme.com', detail: '37 tasks closed, 12 opened', age: 'Yesterday' },
  ]

  // MRR per product is identity across ranges (only the change% varies),
  // so the running total is a plain constant -- no need to recompute on
  // range flips.
  const totalMrr = PRODUCT_BASE.reduce((s, p) => s + p.mrr, 0)
  const totalDeploys = calendarData.reduce((s, [, v]) => s + v, 0)

  const statusTone: Record<Customer['status'], string> = {
    healthy: 'bg-emerald-500',
    'at-risk': 'bg-amber-500',
    churned: 'bg-rose-500',
  }

  function formatK(n: number) {
    return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
  }

  return {
    revenueSeries,
    requestsBlock,
    funnel,
    funnelOption,
    segments,
    segmentsVisibleCount,
    totalHeadcount,
    totalTeams,
    calendarData,
    calendarRange,
    topProducts,
    alerts,
    topCustomers,
    miniChrome,
    activities,
    totalMrr,
    totalDeploys,
    statusTone,
    formatK,
    kpi,
    rangeLabel,
  }
}
