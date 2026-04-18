import { ref, watch } from 'vue'

const STORAGE_KEY = 'uipkge-theme'
type Theme = 'light' | 'dark' | 'system'

const theme = ref<Theme>('system')

export function useTheme() {
  function set(next: Theme) {
    theme.value = next
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, next)
      apply(next)
    }
  }

  function apply(next: Theme) {
    if (typeof window === 'undefined') return
    const isDark = next === 'dark' || (next === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    document.documentElement.classList.toggle('dark', isDark)
  }

  if (typeof window !== 'undefined') {
    const stored = (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? 'system'
    theme.value = stored
    apply(stored)
    watch(theme, apply)
  }

  return { theme, setTheme: set }
}
