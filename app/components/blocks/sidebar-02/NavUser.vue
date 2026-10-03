<script setup lang="ts">
import { computed } from 'vue'
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Monitor,
  Moon,
  Palette,
  Sparkles,
  Sun,
} from '@/lib/icon-pack'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useTheme } from '@/composables/useTheme'

const props = defineProps<{
  user: {
    name: string
    email: string
    avatar?: string
  }
}>()

const emit = defineEmits<{
  (e: 'logout'): void
  (e: 'profile-select', key: string): void
}>()

const { isMobile } = useSidebar()
const { t } = useI18n()
const { theme, setTheme } = useTheme()

const initials = computed(() => {
  const parts = props.user.name.trim().split(/\s+/).slice(0, 2)
  return parts.map(p => p[0]?.toUpperCase()).join('') || 'U'
})
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:!justify-center"
          >
            <Avatar class="size-8 shrink-0 rounded-lg group-data-[collapsible=icon]:size-6">
              <AvatarImage
                v-if="user.avatar"
                :src="user.avatar"
                :alt="user.name"
              />
              <AvatarFallback class="rounded-lg text-xs group-data-[collapsible=icon]:text-xs">
                {{ initials }}
              </AvatarFallback>
            </Avatar>
            <div class="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
              <span
                class="truncate font-medium"
                :title="user.name"
              >{{ user.name }}</span>
              <span
                class="truncate text-xs"
                :title="user.email"
              >{{ user.email }}</span>
            </div>
            <ChevronsUpDown class="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          class="w-(--reka-dropdown-menu-trigger-width) min-w-56 rounded-lg"
          :side="isMobile ? 'bottom' : 'right'"
          align="end"
          :side-offset="4"
        >
          <DropdownMenuLabel class="p-0 font-normal">
            <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar class="size-8 rounded-lg">
                <AvatarImage
                  v-if="user.avatar"
                  :src="user.avatar"
                  :alt="user.name"
                />
                <AvatarFallback class="rounded-lg text-xs">
                  {{ initials }}
                </AvatarFallback>
              </Avatar>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold">{{ user.name }}</span>
                <span class="truncate text-xs">{{ user.email }}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <Sparkles />
              {{ t('nav.user.upgrade') }}
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem @select="emit('profile-select', 'account')">
              <BadgeCheck />
              {{ t('nav.user.account') }}
            </DropdownMenuItem>
            <DropdownMenuItem @select="emit('profile-select', 'billing')">
              <CreditCard />
              {{ t('nav.user.billing') }}
            </DropdownMenuItem>
            <DropdownMenuItem @select="emit('profile-select', 'notifications')">
              <Bell />
              {{ t('nav.user.notifications') }}
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Palette />
              Theme
              <span class="text-muted-foreground ml-auto text-xs capitalize">{{ theme }}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent class="min-w-36">
              <DropdownMenuRadioGroup
                :model-value="theme"
                @update:model-value="(v) => setTheme(v as any)"
              >
                <DropdownMenuRadioItem value="light">
                  <Sun /> Light
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dark">
                  <Moon /> Dark
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="system">
                  <Monitor /> System
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem @select="emit('logout')">
            <LogOut />
            {{ t('nav.user.logout') }}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
