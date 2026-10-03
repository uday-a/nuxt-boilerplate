<script setup lang="ts">
import type { Component } from 'vue'
import { ChevronRight } from '@/lib/icon-pack'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'

const props = defineProps<{
  items: {
    title: string
    url: string
    icon: Component
    isActive?: boolean
    items?: {
      title: string
      url: string
      isActive?: boolean
    }[]
  }[]
}>()

const { t } = useI18n()

// Groups with children open when one of their pages is active — also after
// client-side navigation, not only on first render — and stay user-toggleable.
const open = ref<Record<string, boolean>>({})
watch(
  () => props.items.map(i => [i.title, !!i.isActive] as const),
  (states) => {
    for (const [title, active] of states) {
      if (active) open.value[title] = true
    }
  },
  { immediate: true },
)
</script>

<template>
  <SidebarGroup>
    <SidebarGroupLabel>{{ t('nav.groups.platform') }}</SidebarGroupLabel>
    <SidebarMenu>
      <template
        v-for="item in items"
        :key="item.title"
      >
        <!-- Group: the whole row toggles; only the children navigate. -->
        <Collapsible
          v-if="item.items?.length"
          v-model:open="open[item.title]"
          as-child
        >
          <SidebarMenuItem>
            <CollapsibleTrigger as-child>
              <SidebarMenuButton
                :tooltip="item.title"
                :class="['group/trigger', item.isActive && 'text-sidebar-foreground font-medium']"
              >
                <component :is="item.icon" />
                <span>{{ item.title }}</span>
                <ChevronRight class="ml-auto transition-transform duration-200 group-data-[state=open]/trigger:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                <SidebarMenuSubItem
                  v-for="subItem in item.items"
                  :key="subItem.title"
                >
                  <SidebarMenuSubButton
                    as-child
                    :is-active="subItem.isActive"
                    class="data-[active=true]:bg-sidebar-primary/10 data-[active=true]:text-sidebar-primary data-[active=true]:font-medium"
                  >
                    <NuxtLink :to="subItem.url">
                      <span>{{ subItem.title }}</span>
                    </NuxtLink>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>

        <SidebarMenuItem v-else>
          <SidebarMenuButton
            as-child
            :tooltip="item.title"
            :is-active="item.isActive"
            class="data-[active=true]:bg-sidebar-primary/10 data-[active=true]:text-sidebar-primary data-[active=true]:font-medium data-[active=true]:[&>svg]:text-sidebar-primary"
          >
            <NuxtLink :to="item.url">
              <component :is="item.icon" />
              <span>{{ item.title }}</span>
            </NuxtLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </template>
    </SidebarMenu>
  </SidebarGroup>
</template>
