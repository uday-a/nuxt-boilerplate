import { computed, ref, type ComputedRef } from 'vue'

// Chart palette is driven by Tailwind v4 CSS variables (`--chart-1`..`--chart-5`,
// `--muted-foreground`, `--border`, `--popover`, etc.) so dark/light flips
// happen automatically when the consumer toggles their theme class. The
// values resolve at runtime via `getComputedStyle`, so they pick up whatever
// the consumer set in their own `tailwind.css` -- no fork required.
//
// We bump `themeKey` whenever `<html>` class/style changes (the typical
// shadcn dark-mode pivot) so every consuming `computed` re-resolves and
// downstream ECharts options re-paint.

const themeKey = ref(0)

if (typeof window !== 'undefined') {
  // Bump once on the first paint so post-hydration getComputedStyle reads
  // the *resolved* CSS values (during SSR-built bundles the very first
  // computed pass returns the fallbacks below).
  requestAnimationFrame(() => themeKey.value++)
  new MutationObserver(() => themeKey.value++).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'style', 'data-theme'],
  })
}

// Lazy canvas context used to normalize any CSS color string (including
// `oklch(...)`, `oklab(...)`, `color(display-p3 ...)`) into a hex / rgba
// string ECharts' canvas renderer can consume. Without this, code that
// does `color + '40'` (8-digit hex alpha trick) produces invalid color
// strings like `oklch(...)40` and the canvas API throws.
let _hexCanvas: CanvasRenderingContext2D | null = null
function toHex(cssColor: string): string {
  if (typeof document === 'undefined') return cssColor
  if (!_hexCanvas) {
    _hexCanvas = document.createElement('canvas').getContext('2d')
  }
  if (!_hexCanvas) return cssColor
  // Reset, then assign; the browser normalizes whatever it accepted into
  // the canonical hex/rgba form when read back.
  _hexCanvas.fillStyle = '#000'
  _hexCanvas.fillStyle = cssColor
  return _hexCanvas.fillStyle as string
}

function resolveVar(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  if (!v) return fallback
  return toHex(v)
}

// SSR / pre-hydration fallback palette. Hex values picked to roughly
// match the shadcn Neutral defaults in `tailwind.css` so the first paint
// doesn't flicker.
const CHART_FALLBACK = [
  '#f59e0b',
  '#14b8a6',
  '#3b82f6',
  '#f97316',
  '#eab308',
]

export const chartColors: ComputedRef<string[]> = computed(() => {
  themeKey.value
  return Array.from({ length: 5 }, (_, i) => resolveVar(`--chart-${i + 1}`, CHART_FALLBACK[i]!))
})

export const chartTextColor: ComputedRef<string> = computed(() => {
  themeKey.value
  return resolveVar('--muted-foreground', '#888888')
})

export const chartAxisColor: ComputedRef<string> = computed(() => {
  themeKey.value
  return resolveVar('--border', '#e5e5e5')
})

export const chartSplitLineColor: ComputedRef<string> = computed(() => {
  themeKey.value
  return resolveVar('--border', '#f0f0f0')
})

export const chartTooltipBg: ComputedRef<string> = computed(() => {
  themeKey.value
  return resolveVar('--popover', 'rgba(255,255,255,0.96)')
})

export const chartTooltipBorder: ComputedRef<string> = computed(() => {
  themeKey.value
  return resolveVar('--border', '#e5e5e5')
})

export const chartTooltipText: ComputedRef<string> = computed(() => {
  themeKey.value
  return resolveVar('--popover-foreground', '#333333')
})

// Default gauge stoplight: teal (safe) -> amber (warning) -> red (danger).
// Pulled off saturated green and onto teal so the gauge ties back to the
// dashboard palette; red is kept as the universal "limit reached" cue.
// GaugeChart consumes this via its `thresholds` prop default; consumers
// pass their own array to override. Static because gauges have semantic
// meaning (green safe / red danger) that we deliberately don't theme-flip.
export const gaugeThresholds: [number, string][] = [
  [0.6, '#14b8a6'],
  [0.85, '#f59e0b'],
  [1, '#dc2626'],
]
