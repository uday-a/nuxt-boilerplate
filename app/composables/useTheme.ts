import { watch } from 'vue'

type Theme = 'light' | 'dark' | 'system'
const COOKIE_KEY = 'uipkge-theme'

// useCookie is Nuxt-auto-imported. The cookie path matters: the server
// SSR renderer reads this cookie to decide the initial `theme` value
// before the first HTML is sent down, which means ThemeSwitch renders
// the same icon on the server as the client will produce on hydration.
// localStorage can't do that -- it doesn't exist server-side, so the
// SSR pass would always render `system` and then the client would flip
// to whatever was saved, producing a hydration mismatch warning.

export function useTheme() {
  const theme = useCookie<Theme>(COOKIE_KEY, {
    default: () => 'system',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  })

  function setTheme(next: Theme) {
    theme.value = next
  }

  function apply(next: Theme) {
    if (typeof window === 'undefined') return
    const isDark = next === 'dark' || (next === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    document.documentElement.classList.toggle('dark', isDark)
  }

  if (typeof window !== 'undefined') {
    apply(theme.value)
    watch(theme, apply)
  }

  return { theme, setTheme }
}
