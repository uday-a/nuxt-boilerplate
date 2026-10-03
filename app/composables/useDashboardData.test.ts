// Guards the dashboard funnel contract: per-range data updates, the
// bar-compatible funnelOption shape (never a triangle series), and the
// FunnelChart public props dashboard callers rely on.
import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useDashboardData, type Range } from './useDashboardData'
import { FunnelChart } from '@/components/ui/charts/funnel-chart'
import { formatPct, formatStepRatesLine } from '@/lib/funnel'

describe('dashboard funnel wiring', () => {
  it('exposes the 30d demo funnel with exact counts', () => {
    const { funnel, funnelSummary } = useDashboardData(ref<Range>('30d'))
    expect(funnel.value.map(f => f.value)).toEqual([24850, 14910, 5964, 1789, 447])
    expect(funnelSummary.value.visitors).toBe(24850)
    expect(funnelSummary.value.retained).toBe(447)
    expect(formatPct(funnelSummary.value.endToEnd)).toBe('1.8%')
    expect(formatStepRatesLine(funnelSummary.value)).toBe('Step rates: 60% → 40% → 30% → 25%')
  })

  it('updates counts + summary when the range changes', () => {
    const range = ref<Range>('30d')
    const { funnel, funnelSummary } = useDashboardData(range)
    expect(funnelSummary.value.visitors).toBe(24850)
    range.value = '24h'
    expect(funnel.value.map(f => f.value)).toEqual([1000, 600, 240, 72, 18])
    expect(funnelSummary.value.visitors).toBe(1000)
    expect(funnelSummary.value.retained).toBe(18)
    expect(formatStepRatesLine(funnelSummary.value)).toBe('Step rates: 60% → 40% → 30% → 25%')
    range.value = '7d'
    expect(funnel.value.map(f => f.value)).toEqual([6000, 3600, 1440, 432, 108])
  })

  it('keeps funnelOption a thin range-aware layer (no series override)', () => {
    const range = ref<Range>('30d')
    const { funnelOption } = useDashboardData(range)
    expect('series' in (funnelOption.value as Record<string, unknown>)).toBe(false)
    expect(funnelOption.value.aria.label.description).toContain('Last 30 days')
    expect(funnelOption.value.aria.label.description).toContain('End-to-end 1.8% retained.')
    range.value = 'ytd'
    expect(funnelOption.value.aria.label.description).toContain('Year to date')
  })
})

describe('FunnelChart public props', () => {
  it('keeps the dashboard caller contract (data/height/option)', () => {
    const keys = Object.keys((FunnelChart as unknown as { props: Record<string, unknown> }).props)
    for (const key of ['data', 'height', 'showLabels', 'showLegend', 'option', 'class'])
      expect(keys, `FunnelChart props: ${keys.join(',')}`).toContain(key)
  })
})
