<script setup lang="ts">
import {
  BookOpen,
  Bot,
  FileText,
  Frame,
  KanbanSquare,
  LayoutDashboard,
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


const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Kanban",
      url: "/dashboard/kanban",
      icon: KanbanSquare,
    },
    {
      title: "Data table",
      url: "/dashboard/data-table",
      icon: Table2,
    },
    {
      title: "Forms",
      url: "/dashboard/forms",
      icon: FileText,
    },
    {
      title: "Playground",
      url: "/playground",
      icon: SquareTerminal,
      items: [
        { title: "History", url: "/playground/history" },
        { title: "Starred", url: "/playground/starred" },
        { title: "Settings", url: "/playground/settings" },
      ],
    },
    {
      title: "Models",
      url: "/models",
      icon: Bot,
      items: [
        { title: "Genesis", url: "/models/genesis" },
        { title: "Explorer", url: "/models/explorer" },
        { title: "Quantum", url: "/models/quantum" },
      ],
    },
    {
      title: "Documentation",
      url: "/documentation",
      icon: BookOpen,
      items: [
        { title: "Introduction", url: "/documentation/introduction" },
        { title: "Get Started", url: "/documentation/get-started" },
        { title: "Tutorials", url: "/documentation/tutorials" },
        { title: "Changelog", url: "/documentation/changelog" },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
      items: [
        { title: "General", url: "/settings/general" },
        { title: "Team", url: "/settings/team" },
        { title: "Billing", url: "/settings/billing" },
        { title: "Limits", url: "/settings/limits" },
      ],
    },
  ],
  navSecondary: [
    { title: "Support", url: "/support", icon: LifeBuoy },
    { title: "Feedback", url: "/feedback", icon: Send },
  ],
  projects: [
    { name: "Design Engineering", url: "/projects/design-engineering", icon: Frame },
    { name: "Sales & Marketing", url: "/projects/sales-marketing", icon: PieChart },
    { name: "Travel", url: "/projects/travel", icon: Map },
  ],
}
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
      <NavUser :user="data.user" />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
