<script setup lang="ts">
import type { LucideIcon } from "lucide-vue-next"
import {
  Folder,
  Forward,
  MoreHorizontal,
  Trash2,
} from "lucide-vue-next"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

defineProps<{
  projects: {
    name: string
    url: string
    icon: LucideIcon
  }[]
}>()

const { isMobile } = useSidebar()
const { t } = useI18n()
</script>

<template>
  <!-- Upstream shadcn-vue hides this entire group on icon-mode collapse
       with `group-data-[collapsible=icon]:hidden`. We keep it visible so
       the project icons stay reachable in the narrow column; the
       SidebarGroupLabel below and the `<span>` children of each
       SidebarMenuButton already self-hide on collapse, leaving an
       icon-only column that lines up with NavMain. -->
  <SidebarGroup>
    <SidebarGroupLabel>{{ t('nav.groups.projects') }}</SidebarGroupLabel>
    <SidebarMenu>
      <SidebarMenuItem v-for="item in projects" :key="item.name">
        <SidebarMenuButton as-child>
          <NuxtLink :to="item.url">
            <component :is="item.icon" />
            <span>{{ item.name }}</span>
          </NuxtLink>
        </SidebarMenuButton>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <SidebarMenuAction show-on-hover>
              <MoreHorizontal />
              <span class="sr-only">{{ t('nav.actions.more') }}</span>
            </SidebarMenuAction>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            class="w-48 rounded-lg"
            :side="isMobile ? 'bottom' : 'right'"
            :align="isMobile ? 'end' : 'start'"
          >
            <DropdownMenuItem>
              <Folder class="text-muted-foreground" />
              <span>{{ t('nav.actions.viewProject') }}</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Forward class="text-muted-foreground" />
              <span>{{ t('nav.actions.shareProject') }}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Trash2 class="text-muted-foreground" />
              <span>{{ t('nav.actions.deleteProject') }}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton>
          <MoreHorizontal />
          <span>{{ t('nav.actions.more') }}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarGroup>
</template>
