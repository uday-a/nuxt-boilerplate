import { describe, expect, it } from 'vitest'
import type { H3Event } from 'h3'
import { requireRateLimit } from './rate-limit'

// Minimal H3Event shape — getRequestIP touches event.context plus node.req,
// so both need stubbing. A socket address is enough to exercise bucketing.
function fakeEvent(ip: string): H3Event {
  return {
    context: {},
    node: { req: { headers: {}, socket: { remoteAddress: ip } } },
  } as unknown as H3Event
}

describe('requireRateLimit', () => {
  it('allows requests under the limit', () => {
    const event = fakeEvent('10.0.0.1')
    for (let i = 0; i < 30; i++) {
      expect(() => requireRateLimit(event, { key: 'test:allow' })).not.toThrow()
    }
  })

  it('throws RATE_LIMITED (429) past the limit', () => {
    const event = fakeEvent('10.0.0.2')
    for (let i = 0; i < 30; i++) requireRateLimit(event, { key: 'test:block' })
    try {
      requireRateLimit(event, { key: 'test:block' })
      expect.unreachable()
    }
    catch (e) {
      const err = e as { statusCode?: number, data?: { code?: string } }
      expect(err.statusCode).toBe(429)
      expect(err.data?.code).toBe('RATE_LIMITED')
    }
  })

  it('tracks buckets per key + IP independently', () => {
    const a = fakeEvent('10.0.0.3')
    const b = fakeEvent('10.0.0.4')
    for (let i = 0; i < 30; i++) requireRateLimit(a, { key: 'test:iso' })
    expect(() => requireRateLimit(b, { key: 'test:iso' })).not.toThrow()
    expect(() => requireRateLimit(a, { key: 'test:other' })).not.toThrow()
  })

  it('fails open when the IP is unreadable', () => {
    const broken = {} as H3Event
    expect(() => requireRateLimit(broken, { key: 'test:open' })).not.toThrow()
  })
})
