<script setup lang="ts">
// Edit teams + activeTeam below to match your tenant model. The dropdown
// is the full team switcher pattern -- avatar tile, label, kbd shortcut,
// and a "Add team" footer row. Wire setActive() to your tenant API.
import { ref } from 'vue'
import { AudioWaveform, Check, ChevronsUpDown, Command, Plus } from 'lucide-vue-next'
import UipkgeLogo from '@/components/brand/UipkgeLogo.vue'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

const teams = [
  { name: 'UIPKGE', logo: UipkgeLogo, plan: 'Nuxt.js' },
  { name: 'Acme Corp.', logo: AudioWaveform, plan: 'Startup' },
  { name: 'Evil Corp.', logo: Command, plan: 'Free' },
]

const { isMobile } = useSidebar()
const { t } = useI18n()
const activeTeam = ref(teams[0]!)
function setActive(team: typeof teams[number]) {
  activeTeam.value = team
}
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
            <div class="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg group-data-[collapsible=icon]:size-6">
              <component
                :is="activeTeam.logo"
                class="size-8 group-data-[collapsible=icon]:size-6"
              />
            </div>
            <div class="flex flex-1 flex-col justify-center gap-0.5 text-left min-w-0 group-data-[collapsible=icon]:hidden">
              <span class="truncate font-semibold text-sm leading-none tracking-tight">{{ activeTeam.name }}</span>
              <span class="truncate text-xs text-muted-foreground leading-none">{{ activeTeam.plan }}</span>
            </div>
            <ChevronsUpDown class="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          class="w-(--reka-dropdown-menu-trigger-width) min-w-56 rounded-lg"
          :side="isMobile ? 'bottom' : 'right'"
          align="start"
          :side-offset="4"
        >
          <DropdownMenuLabel class="text-muted-foreground text-xs">
            {{ t('nav.groups.teams') }}
          </DropdownMenuLabel>
          <DropdownMenuItem
            v-for="(team, i) in teams"
            :key="team.name"
            class="gap-2 p-2"
            @select="setActive(team)"
          >
            <div class="flex size-6 items-center justify-center rounded-sm border p-0.5">
              <component
                :is="team.logo"
                class="size-full shrink-0"
              />
            </div>
            {{ team.name }}
            <Check
              v-if="activeTeam === team"
              class="ml-auto size-4"
            />
            <DropdownMenuShortcut v-else>
              ⌘{{ i + 1 }}
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem class="gap-2 p-2">
            <div class="flex size-6 items-center justify-center rounded-md border bg-background">
              <Plus class="size-4" />
            </div>
            <div class="text-muted-foreground font-medium">
              {{ t('nav.actions.addTeam') }}
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
