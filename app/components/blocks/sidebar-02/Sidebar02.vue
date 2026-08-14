<script setup lang="ts">
import {
  Activity,
  CalendarDays,
  FileText,
  Folder,
  KanbanSquare,
  LayoutDashboard,
  LayoutTemplate,
  LifeBuoy,
  Send,
  Settings2,
  Table2,
} from 'lucide-vue-next'

import NavMain from './NavMain.vue'
import NavProjects from './NavProjects.vue'
import NavSecondary from './NavSecondary.vue'
import NavUser from './NavUser.vue'
import TeamSwitcher from './TeamSwitcher.vue'
import { OverlayScroll } from '@/components/ui/overlay-scroll'
import { isNavItemActive } from '@/lib/nav-active'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'

const props = defineProps<{
  user?: { name: string, email: string, avatar?: string }
}>()

const { t } = useI18n()
const route = useRoute()

// Pull the signed-in user from the session. When the auth middleware
// BYPASS flag is on (boilerplate preview without OAuth) user.value is
// null, so we render a 'Guest' placeholder rather than crashing.
const { user: sessionUser, clear } = useUserSession()
const navUser = computed(() => ({
  name: props.user?.name || sessionUser.value?.name || sessionUser.value?.login || 'Guest',
  email: props.user?.email || sessionUser.value?.email || '',
  avatar: props.user?.avatar || sessionUser.value?.avatar || undefined,
}))

const emit = defineEmits<{
  (e: 'profile-select', key: string): void
}>()

async function onLogout() {
  await $fetch('/auth/logout', { method: 'POST' })
  await clear()
  await navigateTo('/')
}

function onProfileSelect(key: string) {
  if (key === 'account') navigateTo('/settings/account')
  if (key === 'billing') navigateTo('/settings/billing')
  if (key === 'notifications') navigateTo('/settings/notifications')
  emit('profile-select', key)
}

function withActiveNav<T extends { url: string, items?: { url: string }[] }>(
  pathname: string,
  items: T[],
): (T & { isActive: boolean, items?: (NonNullable<T['items']>[number] & { isActive: boolean })[] })[] {
  return items.map((item) => {
    const childActive = item.items?.some(sub => isNavItemActive(pathname, sub.url)) ?? false
    const selfActive = isNavItemActive(pathname, item.url)
    return {
      ...item,
      isActive: selfActive || childActive,
      items: item.items?.map(sub => ({
        ...sub,
        isActive: isNavItemActive(pathname, sub.url),
      })),
    }
  })
}

// Project + model names are tenant/brand data and stay verbatim.
const navMainStatic = computed(() => [
  { title: t('nav.items.dashboard'), url: '/dashboard', icon: LayoutDashboard },
  { title: t('nav.items.kanban'), url: '/dashboard/kanban', icon: KanbanSquare },
  { title: t('nav.items.dataTable'), url: '/dashboard/data-table', icon: Table2 },
  { title: t('nav.items.calendar'), url: '/dashboard/calendar', icon: CalendarDays },
  { title: t('nav.items.activity'), url: '/dashboard/activity', icon: Activity },
  { title: t('nav.items.uiKit'), url: '/dashboard/ui-kit', icon: LayoutTemplate },
  { title: t('nav.items.forms'), url: '/dashboard/forms', icon: FileText },
  {
    title: t('nav.items.settings'),
    url: '/settings',
    icon: Settings2,
    items: [
      { title: t('nav.items.general'), url: '/settings/general' },
      { title: t('nav.items.account'), url: '/settings/account' },
      { title: t('nav.items.security'), url: '/settings/security' },
      { title: t('nav.items.notifications'), url: '/settings/notifications' },
      { title: t('nav.items.integrations'), url: '/settings/integrations' },
      { title: t('nav.items.team'), url: '/settings/team' },
      { title: t('nav.items.billing'), url: '/settings/billing' },
      { title: t('nav.items.limits'), url: '/settings/limits' },
    ],
  },
])

const navSecondaryStatic = computed(() => [
  { title: t('nav.items.support'), url: '/support', icon: LifeBuoy },
  { title: t('nav.items.feedback'), url: '/feedback', icon: Send },
])

const projectsStatic = computed(() => [
  { name: 'Design Engineering', url: '/projects/design-engineering', icon: Folder },
  { name: 'Sales & Marketing', url: '/projects/sales-marketing', icon: Folder },
  { name: 'Travel', url: '/projects/travel', icon: Folder },
])

const data = computed(() => ({
  navMain: withActiveNav(route.path, navMainStatic.value),
  navSecondary: navSecondaryStatic.value.map(item => ({ ...item, isActive: isNavItemActive(route.path, item.url) })),
  projects: projectsStatic.value.map(item => ({ ...item, isActive: isNavItemActive(route.path, item.url) })),
}))
</script>

<template>
  <Sidebar collapsible="icon">
    <SidebarHeader>
      <TeamSwitcher />
    </SidebarHeader>
    <SidebarContent class="gap-1 overflow-visible group-data-[collapsible=icon]:overflow-hidden">
      <OverlayScroll class="min-h-0 flex-1">
        <div class="flex min-h-full flex-col gap-2">
          <NavMain :items="data.navMain" />
          <NavProjects :projects="data.projects" />
          <NavSecondary
            :items="data.navSecondary"
            class="mt-auto"
          />
        </div>
      </OverlayScroll>
    </SidebarContent>
    <SidebarFooter>
      <NavUser
        :user="navUser"
        @logout="onLogout"
        @profile-select="onProfileSelect"
      />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
