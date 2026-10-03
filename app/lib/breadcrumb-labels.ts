/**
 * Route path -> `nav.items.*` i18n key. One label source for the sidebar,
 * the topbar breadcrumb and each page's H1, so the three never disagree.
 * Keyed by full path because segments repeat (`/dashboard/activity` is
 * "Activity", `/settings/activity` is "Activity log").
 */
export const ROUTE_LABEL_KEYS: Record<string, string> = {
  '/dashboard': 'nav.items.dashboard',
  '/dashboard/messages': 'nav.items.messages',
  '/dashboard/kanban': 'nav.items.kanban',
  '/dashboard/data-table': 'nav.items.dataTable',
  '/dashboard/calendar': 'nav.items.calendar',
  '/dashboard/activity': 'nav.items.activity',
  '/dashboard/locations': 'nav.items.locations',
  '/dashboard/ui-kit': 'nav.items.uiKit',
  '/dashboard/forms': 'nav.items.forms',
  '/dashboard/form-example': 'nav.items.formExample',
  '/settings': 'nav.items.settings',
  '/settings/general': 'nav.items.general',
  '/settings/account': 'nav.items.account',
  '/settings/security': 'nav.items.security',
  '/settings/api-keys': 'nav.items.apiKeys',
  '/settings/notifications': 'nav.items.notifications',
  '/settings/integrations': 'nav.items.integrations',
  '/settings/team': 'nav.items.team',
  '/settings/activity': 'nav.items.activityLog',
  '/settings/billing': 'nav.items.billing',
  '/settings/limits': 'nav.items.limits',
  '/admin': 'nav.items.admin',
  '/admin/users': 'nav.items.users',
  '/admin/roles': 'nav.items.roles',
  '/projects': 'nav.items.projects',
  '/support': 'nav.items.support',
  '/feedback': 'nav.items.feedback',
}

function humanize(segment: string): string {
  return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
}

/** Label for a route path; falls back to the humanized last segment. */
export function routeLabel(path: string, t: (key: string) => string): string {
  const key = ROUTE_LABEL_KEYS[path]
  return key ? t(key) : humanize(path.split('/').filter(Boolean).pop() ?? '')
}
