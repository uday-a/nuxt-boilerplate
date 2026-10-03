<script setup lang="ts">
import { FolderKanban, LayoutDashboard, Settings } from '@/lib/icon-pack'
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider,
} from '@/components/ui/sidebar'

const items = [
  { title: 'Dashboard', icon: LayoutDashboard, active: true },
  { title: 'Projects', icon: FolderKanban, active: false },
  { title: 'Settings', icon: Settings, active: false },
]
</script>

<template>
  <!-- A static (collapsible="none") sidebar. The app's real one is the
       Sidebar02 block in the dashboard layout. -->
  <SidebarProvider class="min-h-0">
    <Sidebar
      collapsible="none"
      class="h-auto rounded-md border"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem
              v-for="item in items"
              :key="item.title"
            >
              <SidebarMenuButton :is-active="item.active">
                <component
                  :is="item.icon"
                  aria-hidden="true"
                />
                <span>{{ item.title }}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  </SidebarProvider>
</template>
