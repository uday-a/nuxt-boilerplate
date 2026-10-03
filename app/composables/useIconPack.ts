export const ICON_PACKS = ['lucide', 'hugeicons', 'phosphor', 'tabler'] as const
export type IconPack = typeof ICON_PACKS[number]

const COOKIE = 'ui-icon-pack'
const cookieOpts = { sameSite: 'lax' as const, maxAge: 60 * 60 * 24 * 365 }

/**
 * Active icon pack. Shared state, seeded once from the cookie (the initialiser
 * only runs the first time), so every icon instance reads a cheap ref and SSR
 * already renders the chosen pack.
 */
export function useIconPack() {
  return useState<IconPack>(COOKIE, () => {
    const v = useCookie<IconPack>(COOKIE, cookieOpts).value
    return ICON_PACKS.includes(v) ? v : 'lucide'
  })
}

/** For controls: call in setup, then `set()` from event handlers. */
export function useIconPackControl() {
  const pack = useIconPack()
  const cookie = useCookie<IconPack>(COOKIE, cookieOpts)
  return {
    pack,
    set(next: IconPack) {
      cookie.value = next
      pack.value = next
    },
  }
}
