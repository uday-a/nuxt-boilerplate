import { computed } from 'vue'
import { routeLabel } from '@/lib/breadcrumb-labels'
import {
  buildCatalog,
  CATALOG_CATEGORIES,
  CATALOG_STATUSES,
  searchCatalog,
  type CatalogCategory,
  type CatalogStatus,
} from '@/data/ui-catalog/catalog'
import { CURATED, CURATED_BLOCKS } from '@/data/ui-catalog/curated'
import snapshot from '@/data/ui-catalog/registry.snapshot.json'
import usage from '@/data/ui-catalog/usage.generated.json'
import type { SnapshotItem, UsageData } from '../../scripts/ui-catalog'

export interface UsedInLink {
  label: string
  /** Absent for layouts, the app shell and dynamic routes. */
  to?: string
}

const entries = buildCatalog({
  snapshot: snapshot.items as SnapshotItem[],
  curated: CURATED,
  curatedBlocks: CURATED_BLOCKS,
  usage: usage as UsageData,
})

/** i18n key suffix for a category: 'data-display' -> 'dataDisplay'. */
export const categoryKey = (c: CatalogCategory | 'all') => c.replace(/-(\w)/g, (_, ch: string) => ch.toUpperCase())

/**
 * Finder state for /dashboard/ui-kit. Filters live in the URL
 * (`?q=&cat=&status=`) so a search can be shared and survives reload.
 */
export function useUiCatalog() {
  const route = useRoute()
  const router = useRouter()
  const { t } = useI18n()

  function queryParam<T extends string>(key: string, allowed: readonly T[] | null, fallback: T) {
    return computed<T>({
      get: () => {
        const raw = route.query[key]
        const value = (Array.isArray(raw) ? raw[0] : raw) ?? ''
        if (!value) return fallback
        return allowed && !allowed.includes(value as T) ? fallback : value as T
      },
      set: (value) => {
        const query = { ...route.query, [key]: value && value !== fallback ? value : undefined }
        void router.replace({ query, hash: route.hash })
      },
    })
  }

  const q = queryParam<string>('q', null, '')
  const category = queryParam<CatalogCategory | 'all'>('cat', ['all', ...CATALOG_CATEGORIES], 'all')
  const status = queryParam<CatalogStatus | 'all'>('status', ['all', ...CATALOG_STATUSES], 'all')

  const results = computed(() => searchCatalog(entries, { q: q.value, category: category.value, status: status.value }))

  function usedInLinks(keys: string[]): UsedInLink[] {
    return keys.map((key) => {
      if (key.startsWith('layout:')) return { label: t('uiKit.card.layout', { name: key.slice(7) }) }
      if (key === 'app:root') return { label: t('uiKit.card.appShell') }
      if (key === 'app:error') return { label: t('uiKit.card.errorPage') }
      if (key.includes('[')) return { label: key }
      return { label: key === '/' ? t('uiKit.card.home') : routeLabel(key, t), to: key }
    })
  }

  function clearFilters() {
    void router.replace({ query: {} })
  }

  return { entries, results, q, category, status, usedInLinks, clearFilters }
}
