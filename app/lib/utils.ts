import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const DEFAULT_AUTH_REDIRECT = '/dashboard'

/**
 * WHY: money/numbers were formatted ad hoc in three places (forms billing
 * math, locations headcount, data-table money) with diverging zero handling.
 * One helper keeps "$0 vs em-dash" decisions in a single spot.
 * Zero renders as $0 (audited: Rule80 -- a real zero, muted at the call
 * site, never an em-dash that reads as "no data").
 */
export function formatMoney(n: number): string {
  return `$${n.toLocaleString()}`
}

/**
 * WHY: same centralization as formatMoney for plain counts (headcount,
 * seats). toLocaleString keeps grouping consistent across pages.
 */
export function formatNumber(n: number): string {
  return n.toLocaleString()
}

/**
 * Validates a redirect target to protect against open-redirect phishing attacks.
 * Rejects external URLs (`https://evil.com`), protocol-relative URLs (`//evil.com`),
 * and backslash bypasses (`/\evil.com`), returning the safe fallback.
 */
export function safeRedirectPath(value: string | null | undefined, fallback = DEFAULT_AUTH_REDIRECT): string {
  const candidate = value?.trim()
  if (!candidate) return fallback
  if (!candidate.startsWith('/') || candidate.startsWith('//') || candidate.includes('\\')) return fallback

  try {
    const url = new URL(candidate, 'https://uipkge.local')
    if (url.origin !== 'https://uipkge.local') return fallback
    return `${url.pathname}${url.search}${url.hash}`
  }
  catch {
    return fallback
  }
}
