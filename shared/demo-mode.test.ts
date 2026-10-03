import { describe, expect, it } from 'vitest'
import { resolveDemoMode } from './demo-mode'

// Demo mode hands out admin sessions to anyone, so a prod start that
// forgets NODE_ENV must NOT turn it on.
describe('resolveDemoMode', () => {
  it('is off when NODE_ENV is unset (bare `node` prod start)', () => {
    expect(resolveDemoMode(undefined, undefined)).toBe(false)
  })
  it('is off in production and test', () => {
    expect(resolveDemoMode(undefined, 'production')).toBe(false)
    expect(resolveDemoMode(undefined, 'test')).toBe(false)
  })
  it('is on in development (nuxt dev)', () => {
    expect(resolveDemoMode(undefined, 'development')).toBe(true)
  })
  it('DEMO_MODE=true forces it on, even in production', () => {
    expect(resolveDemoMode('true', undefined)).toBe(true)
    expect(resolveDemoMode('true', 'production')).toBe(true)
  })
  it('DEMO_MODE=false forces it off, even in development', () => {
    expect(resolveDemoMode('false', 'development')).toBe(false)
  })
})
