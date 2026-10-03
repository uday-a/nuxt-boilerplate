import { COLOR_THEME_DEFAULT, COLOR_THEME_IDS, RADIUS_DEFAULT, RADIUS_OPTIONS } from '@/lib/color-themes'

/**
 * Colour theme + corner radius for the whole app (header theme customiser).
 * Cookie-backed and applied on <html> during SSR, so the first paint is
 * already themed — no flash. Values mirror the uipkge.dev site customiser.
 */
export function useColorTheme() {
  const opts = { sameSite: 'lax' as const, maxAge: 60 * 60 * 24 * 365 }
  const themeCookie = useCookie<string>('ui-color-theme', { default: () => COLOR_THEME_DEFAULT, ...opts })
  const radiusCookie = useCookie<string>('ui-radius', { default: () => RADIUS_DEFAULT, ...opts })

  const colorTheme = computed({
    get: () => (COLOR_THEME_IDS.has(themeCookie.value) ? themeCookie.value : COLOR_THEME_DEFAULT),
    set: (v: string) => { themeCookie.value = v },
  })
  // useCookie JSON-parses values, so "0.75" comes back as a number — normalise.
  const radius = computed({
    get: () => {
      const v = String(radiusCookie.value)
      return (RADIUS_OPTIONS as readonly string[]).includes(v) ? v : RADIUS_DEFAULT
    },
    set: (v: string) => { radiusCookie.value = v },
  })

  function reset() {
    colorTheme.value = COLOR_THEME_DEFAULT
    radius.value = RADIUS_DEFAULT
  }

  return { colorTheme, radius, reset }
}
