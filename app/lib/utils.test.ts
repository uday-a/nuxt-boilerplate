import { describe, it, expect } from 'vitest'
import { cn, safeRedirectPath, formatMoney, formatNumber } from './utils'

describe('cn (classNames merger)', () => {
  it('merges single and multiple classes', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1')
  })

  it('handles conditional falsy expressions', () => {
    const isHidden = false
    expect(cn('base', isHidden && 'hidden', null, undefined, 'active')).toBe('base active')
  })

  it('correctly resolves Tailwind class collisions (last wins)', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2')
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    expect(cn('bg-primary text-white', 'bg-secondary')).toBe('text-white bg-secondary')
  })
})

describe('safeRedirectPath', () => {
  it('allows same-site relative and absolute paths', () => {
    expect(safeRedirectPath('/dashboard')).toBe('/dashboard')
    expect(safeRedirectPath('/pricing?plan=pro#checkout')).toBe('/pricing?plan=pro#checkout')
    expect(safeRedirectPath('/settings/billing')).toBe('/settings/billing')
  })

  it('rejects external URL targets and protocol-relative paths', () => {
    expect(safeRedirectPath('https://evil.example/phish')).toBe('/dashboard')
    expect(safeRedirectPath('http://malicious.com')).toBe('/dashboard')
    expect(safeRedirectPath('//evil.example/phish')).toBe('/dashboard')
    expect(safeRedirectPath('dashboard')).toBe('/dashboard')
    expect(safeRedirectPath('/\\evil.example')).toBe('/dashboard')
  })

  it('supports custom fallback path', () => {
    expect(safeRedirectPath(null, '/login')).toBe('/login')
    expect(safeRedirectPath('https://evil.example/phish', '/login')).toBe('/login')
  })
})

describe('formatMoney / formatNumber (Rule15 centralization)', () => {
  it('formats USD with grouping and renders zero as $0 (never an em-dash)', () => {
    expect(formatMoney(4800)).toBe('$4,800')
    expect(formatMoney(0)).toBe('$0')
    expect(formatMoney(115700)).toBe('$115,700')
  })

  it('formats plain counts with grouping', () => {
    expect(formatNumber(1221)).toBe('1,221')
    expect(formatNumber(0)).toBe('0')
  })
})
