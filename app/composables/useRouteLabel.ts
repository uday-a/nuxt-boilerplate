import { computed } from 'vue'
import { routeLabel } from '@/lib/breadcrumb-labels'

/** Current page's label from the shared route map — use it for the H1 and `<title>`. */
export function useRouteLabel() {
  const route = useRoute()
  const { t } = useI18n()
  return computed(() => routeLabel(route.path, t))
}
