import { describe, it, expect } from 'vitest'
import { cn, safeRedirectPath } from './utils'

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
