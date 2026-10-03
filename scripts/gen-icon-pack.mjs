// Generates app/lib/icon-pack.ts: one pack-aware export per icon the app
// imports from '@/lib/icon-pack' (or still from 'lucide-vue-next').
// Hugeicons ships Lucide-compatible alias names, so most icons resolve by
// name; MANUAL covers the few that don't. Run: npm run icons:gen
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const huge = require('@hugeicons/core-free-icons')
const tabler = require('@tabler/icons-vue')
const phosphor = require('@phosphor-icons/vue')

const OUT = 'app/lib/icon-pack.ts'

const MANUAL = {
  Loader2: 'Loading03Icon', Loader2Icon: 'Loading03Icon', CheckCircle2: 'CheckmarkCircle02Icon',
  Globe2: 'Globe02Icon', KanbanSquare: 'SquareKanbanIcon', BarChart3: 'BarChartIcon',
  TriangleAlert: 'TriangleAlertIcon', TriangleAlertIcon: 'TriangleAlertIcon', UserCircle: 'UserCircleIcon',
  PlayCircle: 'PlayCircleIcon', Gauge: 'GaugeIcon', FolderKanban: 'FolderKanbanIcon',
  FileSpreadsheet: 'FileSpreadsheetIcon', AudioWaveform: 'AudioWaveformIcon', OctagonXIcon: 'OctagonXIcon',
  // Semantic picks where the name match is the wrong glyph.
  Palette: 'PaintBoardIcon',
}

// Tabler (Icon*) and Phosphor (Ph*) names where the Lucide name doesn't match.
const TABLER = {
  ArrowUpDown: 'ArrowsSort',
  AudioWaveform: 'WaveSine',
  BadgeCheck: 'RosetteDiscountCheck',
  BarChart3: 'ChartBar',
  BookOpen: 'Book',
  Boxes: 'Packages',
  Building2: 'Building',
  CalendarDays: 'CalendarEvent',
  CheckCheck: 'Checks',
  CheckCircle2: 'CircleCheck',
  ChevronsUpDown: 'Selector',
  Chrome: 'BrandChrome',
  CircleAlert: 'AlertCircle',
  DollarSign: 'CurrencyDollar',
  FileImage: 'Photo',
  FolderKanban: 'Folder',
  Forward: 'ArrowForwardUp',
  Github: 'BrandGithub',
  Globe2: 'World',
  Heading1: 'H1',
  Heading2: 'H2',
  Image: 'Photo',
  Info: 'InfoCircle',
  InfoIcon: 'InfoCircle',
  KanbanSquare: 'LayoutKanban',
  KeyRound: 'Key',
  Laptop: 'DeviceLaptop',
  LayoutTemplate: 'Template',
  LifeBuoy: 'Lifebuoy',
  Lightbulb: 'Bulb',
  Linkedin: 'BrandLinkedin',
  ListChecks: 'ListCheck',
  ListFilter: 'Filter',
  ListOrdered: 'ListNumbers',
  LogIn: 'Login',
  LogOut: 'Logout',
  MessageSquare: 'Message',
  Monitor: 'DeviceDesktop',
  MoreHorizontal: 'Dots',
  MousePointer2: 'Pointer',
  OctagonXIcon: 'AlertOctagon',
  PanelLeft: 'LayoutSidebar',
  PlayCircle: 'PlayerPlay',
  Redo2: 'ArrowForwardUp',
  RemoveFormatting: 'ClearFormatting',
  RotateCcw: 'Rotate',
  RotateCw: 'RotateClockwise',
  SearchX: 'ZoomCancel',
  ShieldAlert: 'ShieldExclamation',
  Slack: 'BrandSlack',
  SlidersHorizontal: 'AdjustmentsHorizontal',
  Smartphone: 'DeviceMobile',
  Table2: 'Table',
  ThumbsUp: 'ThumbUp',
  Timer: 'Stopwatch',
  Trash2: 'Trash',
  TriangleAlert: 'AlertTriangle',
  TriangleAlertIcon: 'AlertTriangle',
  Twitter: 'BrandX',
  Undo2: 'ArrowBackUp',
  Zap: 'Bolt',
}
const PHOSPHOR = {
  AlertCircle: 'WarningCircle',
  AlertTriangle: 'Warning',
  AlignCenter: 'TextAlignCenter',
  ArrowUpDown: 'ArrowsDownUp',
  AudioWaveform: 'Waveform',
  BadgeCheck: 'SealCheck',
  BarChart3: 'ChartBar',
  BellOff: 'BellSlash',
  Bold: 'TextB',
  Boxes: 'Package',
  Building2: 'Buildings',
  CalendarDays: 'CalendarDots',
  CheckCheck: 'Checks',
  CheckCircle2: 'CheckCircle',
  ChevronDown: 'CaretDown',
  ChevronDownIcon: 'CaretDown',
  ChevronLeft: 'CaretLeft',
  ChevronRight: 'CaretRight',
  ChevronUp: 'CaretUp',
  ChevronsLeft: 'CaretDoubleLeft',
  ChevronsRight: 'CaretDoubleRight',
  ChevronsUpDown: 'CaretUpDown',
  Chrome: 'GoogleChromeLogo',
  CircleAlert: 'WarningCircle',
  CircleCheckIcon: 'CheckCircle',
  CircleDot: 'RadioButton',
  CloudOff: 'CloudSlash',
  Columns3: 'Columns',
  CopyPlus: 'CopySimple',
  DollarSign: 'CurrencyDollar',
  ExternalLink: 'ArrowSquareOut',
  EyeOff: 'EyeSlash',
  FileSpreadsheet: 'FileXls',
  Filter: 'Funnel',
  FolderKanban: 'FolderSimple',
  Forward: 'ArrowBendUpRight',
  Github: 'GithubLogo',
  Globe2: 'GlobeSimple',
  Heading1: 'TextHOne',
  Heading2: 'TextHTwo',
  History: 'ClockCounterClockwise',
  Home: 'House',
  Inbox: 'Tray',
  Italic: 'TextItalic',
  KanbanSquare: 'Kanban',
  KeyRound: 'Key',
  LayoutDashboard: 'SquaresFour',
  LayoutGrid: 'GridFour',
  LayoutTemplate: 'Layout',
  LifeBuoy: 'Lifebuoy',
  Linkedin: 'LinkedinLogo',
  ListFilter: 'FunnelSimple',
  ListOrdered: 'ListNumbers',
  Loader: 'Spinner',
  Loader2: 'CircleNotch',
  Loader2Icon: 'CircleNotch',
  LogIn: 'SignIn',
  LogOut: 'SignOut',
  Mail: 'Envelope',
  MailCheck: 'EnvelopeSimpleOpen',
  Menu: 'List',
  MessageSquare: 'Chat',
  MoreHorizontal: 'DotsThree',
  MousePointer2: 'Cursor',
  OctagonXIcon: 'Prohibit',
  PanelLeft: 'SidebarSimple',
  Plane: 'Airplane',
  Quote: 'Quotes',
  Redo2: 'ArrowUUpRight',
  RemoveFormatting: 'Eraser',
  RotateCcw: 'ArrowCounterClockwise',
  RotateCw: 'ArrowClockwise',
  Search: 'MagnifyingGlass',
  SearchX: 'MagnifyingGlassMinus',
  Send: 'PaperPlaneTilt',
  Settings: 'Gear',
  Settings2: 'GearSix',
  ShieldAlert: 'ShieldWarning',
  Slack: 'SlackLogo',
  Smartphone: 'DeviceMobile',
  Sparkles: 'Sparkle',
  Strikethrough: 'TextStrikethrough',
  Table2: 'Table',
  Trash2: 'Trash',
  TrendingDown: 'TrendDown',
  TrendingUp: 'TrendUp',
  TriangleAlert: 'Warning',
  TriangleAlertIcon: 'Warning',
  Twitter: 'XLogo',
  Underline: 'TextUnderline',
  Undo2: 'ArrowUUpLeft',
  UserX: 'UserMinus',
  Webhook: 'WebhooksLogo',
  Zap: 'Lightning',
}

const files = []
;(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f)
    if (fs.statSync(p).isDirectory()) walk(p)
    else if (/\.(vue|ts)$/.test(f) && p !== path.normalize(OUT)) files.push(p)
  }
})('app')

const names = new Set()
for (const f of files) {
  const s = fs.readFileSync(f, 'utf8')
  for (const x of s.matchAll(/import\s*\{([^}]+)\}\s*from\s*'(?:lucide-vue-next|@\/lib\/icon-pack)'/g)) {
    for (let n of x[1].split(',')) {
      n = n.trim().split(/\s+as\s+/)[0].trim()
      if (n) names.add(n)
    }
  }
}

// Canonical Hugeicons name: the `…Icon` export that is the same object as the alias.
const canon = (v) => {
  const c = Object.keys(huge).filter(k => huge[k] === v && k.endsWith('Icon'))
  c.sort((a, b) => /\d{2}Icon$/.test(b) - /\d{2}Icon$/.test(a) || a.length - b.length)
  return c[0]
}

const rows = []
const missing = []
for (const n of [...names].sort()) {
  let h = MANUAL[n]
  if (!h) {
    const base = n.replace(/Icon$/, '')
    // Prefer the exact `<Name>Icon` export: some bare aliases point at a
    // different glyph (e.g. `CloudOff` → CloudLoading, but `CloudOffIcon`
    // is the real crossed-out cloud). Fall back to the alias.
    if (huge[`${base}Icon`]) h = `${base}Icon`
    else if (huge[base]) h = canon(huge[base])
  }
  const base = n.replace(/Icon$/, '')
  const tb = `Icon${TABLER[n] ?? base}`
  const ph = `Ph${PHOSPHOR[n] ?? base}`
  if (!h || !huge[h]) missing.push(`${n} (hugeicons)`)
  else if (!tabler[tb]) missing.push(`${n} (tabler)`)
  else if (!phosphor[ph]) missing.push(`${n} (phosphor)`)
  else rows.push([n, h, tb, ph])
}
if (missing.length) {
  console.error(`No Hugeicons match for: ${missing.join(', ')} — add them to MANUAL / TABLER / PHOSPHOR in scripts/gen-icon-pack.mjs`)
  process.exit(1)
}

const hugeNames = [...new Set(rows.map(r => r[1]))].sort()
const tablerNames = [...new Set(rows.map(r => r[2]))].sort()
const phosphorNames = [...new Set(rows.map(r => r[3]))].sort()
const out = `// GENERATED by scripts/gen-icon-pack.mjs — do not edit by hand. To add an
// icon, import it from '@/lib/icon-pack' and run \`npm run icons:gen\`.
//
// Pack-aware icons: every icon the app uses, exported under its Lucide name.
// Each renders the Lucide, Hugeicons, Phosphor or Tabler equivalent depending
// on the active pack (useIconPack — cookie-backed, SSR-safe).
import { defineComponent, h, type Component } from 'vue'
import { HugeiconsIcon } from '@hugeicons/vue'
import {
${rows.map(([n]) => `  ${n} as L${n},`).join('\n')}
} from 'lucide-vue-next'
import {
${hugeNames.map(n => `  ${n} as H${n},`).join('\n')}
} from '@hugeicons/core-free-icons'
import {
${tablerNames.map(n => `  ${n} as T${n},`).join('\n')}
} from '@tabler/icons-vue'
import {
${phosphorNames.map(n => `  ${n},`).join('\n')}
} from '@phosphor-icons/vue'
import { useIconPack } from '@/composables/useIconPack'

type HugeIcon = typeof H${hugeNames[0]}

function packed(name: string, lucide: Component, icon: HugeIcon, tablerIcon: Component, phosphorIcon: Component): Component {
  return defineComponent({
    name: \`Icon\${name}\`,
    inheritAttrs: false,
    setup(_, { attrs }) {
      const pack = useIconPack()
      // Size comes from the caller's size-* class in every pack.
      return () => {
        switch (pack.value) {
          case 'hugeicons': return h(HugeiconsIcon, { icon, size: 24, strokeWidth: 1.5, ...attrs })
          case 'tabler': return h(tablerIcon, { size: 24, stroke: 2, ...attrs })
          case 'phosphor': return h(phosphorIcon, { size: 24, weight: 'regular', ...attrs })
          default: return h(lucide, attrs)
        }
      }
    },
  })
}

${rows.map(([n, hn, tb, ph]) => `export const ${n} = packed('${n}', L${n}, H${hn}, T${tb}, ${ph})`).join('\n')}
`
fs.writeFileSync(OUT, out)
console.log(`icons:gen  ${rows.length} icons → ${OUT}`)
