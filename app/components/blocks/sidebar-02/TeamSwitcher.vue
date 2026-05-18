<script setup lang="ts">
// Edit teams + activeTeam below to match your tenant model. The dropdown
// is the full team switcher pattern -- avatar tile, label, kbd shortcut,
// and a "Add team" footer row. Wire setActive() to your tenant API.
import { h, ref } from 'vue'
import { AudioWaveform, Check, ChevronsUpDown, Command, Plus } from 'lucide-vue-next'
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

// Inline Nuxt mark — the official green chevron. Functional component so
// it slots into the same <component :is="..."> pattern lucide icons use.
const NuxtLogo = () => h('svg', {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 32 32',
  fill: 'currentColor',
}, [
  h('path', {
    d: 'M18.392 23.586h11.615c.369 0 .732-.096 1.052-.278.32-.182.586-.444.768-.76a1.516 1.516 0 0 0 0-1.517L24.025 8.28a1.524 1.524 0 0 0-.768-.76 1.539 1.539 0 0 0-1.052-.279c-.37 0-.733.097-1.053.279-.32.182-.585.444-.767.76l-1.993 3.443-3.895-6.736a1.524 1.524 0 0 0-.768-.76 1.539 1.539 0 0 0-1.053-.278c-.369 0-.732.096-1.052.278-.32.183-.586.444-.768.76L1.183 21.031a1.516 1.516 0 0 0 0 1.517c.182.316.448.578.768.76.32.182.683.278 1.052.278h7.293c2.89 0 5.022-1.27 6.488-3.738l3.562-6.13 1.907-3.282 5.723 9.873h-7.63l-1.954 3.277ZM10.176 20.3l-5.09-.001 7.633-13.156 3.81 6.578-2.551 4.403c-.973 1.604-2.078 2.176-3.802 2.176Z',
  }),
])

const teams = [
  { name: 'Nuxt', logo: NuxtLogo, plan: 'v4' },
  { name: 'Acme Corp.', logo: AudioWaveform, plan: 'Startup' },
  { name: 'Evil Corp.', logo: Command, plan: 'Free' },
]

const { isMobile } = useSidebar()
const { t } = useI18n()
const activeTeam = ref(teams[0]!)
function setActive(team: typeof teams[number]) { activeTeam.value = team }
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
            <div class="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground group-data-[collapsible=icon]:size-6">
              <component
                :is="activeTeam.logo"
                class="size-4 group-data-[collapsible=icon]:size-3.5"
              />
            </div>
            <div class="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
              <span class="truncate font-display font-bold">{{ activeTeam.name }}</span>
              <span class="truncate text-xs text-muted-foreground">{{ activeTeam.plan }}</span>
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
            <div class="flex size-6 items-center justify-center rounded-sm border">
              <component
                :is="team.logo"
                class="size-3.5 shrink-0"
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
