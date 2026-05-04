<script setup lang="ts">
import {
  Activity,
  BookOpen,
  Bot,
  CalendarDays,
  FileText,
  Frame,
  KanbanSquare,
  LayoutDashboard,
  LayoutTemplate,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
  Table2,
} from "lucide-vue-next"

import NavMain from './NavMain.vue'
import NavProjects from './NavProjects.vue'
import NavSecondary from './NavSecondary.vue'
import NavUser from './NavUser.vue'
import TeamSwitcher from './TeamSwitcher.vue'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'

const { t } = useI18n()

// Pull the signed-in user from the session. When the auth middleware
// BYPASS flag is on (boilerplate preview without OAuth) user.value is
// null, so we render a 'Guest' placeholder rather than crashing.
const { user, clear } = useUserSession()
const navUser = computed(() => ({
  name: user.value?.name || user.value?.login || 'Guest',
  email: user.value?.email || '',
  avatar: user.value?.avatar ?? undefined,
}))

async function onLogout() {
  await $fetch('/auth/logout', { method: 'POST' })
  await clear()
  await navigateTo('/')
}

// Project + model names are tenant/brand data and stay verbatim.
const data = computed(() => ({
  navMain: [
    { title: t('nav.items.dashboard'), url: '/dashboard', icon: LayoutDashboard, isActive: true },
    { title: t('nav.items.kanban'), url: '/dashboard/kanban', icon: KanbanSquare },
    { title: t('nav.items.dataTable'), url: '/dashboard/data-table', icon: Table2 },
    { title: t('nav.items.calendar'), url: '/dashboard/calendar', icon: CalendarDays },
    { title: t('nav.items.activity'), url: '/dashboard/activity', icon: Activity },
    { title: t('nav.items.uiKit'), url: '/dashboard/ui-kit', icon: LayoutTemplate },
    { title: t('nav.items.forms'), url: '/dashboard/forms', icon: FileText },
    {
      title: t('nav.items.playground'),
      url: '/playground',
      icon: SquareTerminal,
      items: [
        { title: t('nav.items.history'), url: '/playground/history' },
        { title: t('nav.items.starred'), url: '/playground/starred' },
        { title: t('nav.items.settings'), url: '/playground/settings' },
      ],
    },
    {
      title: t('nav.items.models'),
      url: '/models',
      icon: Bot,
      items: [
        { title: 'Genesis', url: '/models/genesis' },
        { title: 'Explorer', url: '/models/explorer' },
        { title: 'Quantum', url: '/models/quantum' },
      ],
    },
    {
      title: t('nav.items.documentation'),
      url: '/documentation',
      icon: BookOpen,
      items: [
        { title: t('nav.items.introduction'), url: '/documentation/introduction' },
        { title: t('nav.items.getStarted'), url: '/documentation/get-started' },
        { title: t('nav.items.tutorials'), url: '/documentation/tutorials' },
        { title: t('nav.items.changelog'), url: '/documentation/changelog' },
      ],
    },
    {
      title: t('nav.items.settings'),
      url: '/settings',
      icon: Settings2,
      items: [
        { title: t('nav.items.general'), url: '/settings/general' },
        { title: t('nav.items.team'), url: '/settings/team' },
        { title: t('nav.items.billing'), url: '/settings/billing' },
        { title: t('nav.items.limits'), url: '/settings/limits' },
      ],
    },
  ],
  navSecondary: [
    { title: t('nav.items.support'), url: '/support', icon: LifeBuoy },
    { title: t('nav.items.feedback'), url: '/feedback', icon: Send },
  ],
  projects: [
    { name: 'Design Engineering', url: '/projects/design-engineering', icon: Frame },
    { name: 'Sales & Marketing', url: '/projects/sales-marketing', icon: PieChart },
    { name: 'Travel', url: '/projects/travel', icon: Map },
  ],
}))
</script>

<template>
  <Sidebar collapsible="icon">
    <SidebarHeader>
      <TeamSwitcher />
    </SidebarHeader>
    <SidebarContent>
      <NavMain :items="data.navMain" />
      <NavProjects :projects="data.projects" />
      <NavSecondary :items="data.navSecondary" class="mt-auto" />
    </SidebarContent>
    <SidebarFooter>
      <NavUser :user="navUser" @logout="onLogout" />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
