<script setup lang="ts">
import { h } from 'vue'
import { Bell } from '@/lib/icon-pack'
import Sidebar02 from '@/components/blocks/sidebar-02/Sidebar02.vue'
import CommandPalette from '@/components/blocks/CommandPalette.vue'
import NotificationsPopover from '@/components/blocks/NotificationsPopover.vue'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { ThemeSwitch } from '@/components/ui/theme-switch'
import { useTheme } from '@/composables/useTheme'

const GithubIcon = (props: { class?: string }) =>
  h('svg', {
    'class': props.class,
    'viewBox': '0 0 24 24',
    'fill': 'currentColor',
    'aria-hidden': 'true',
  }, [
    h('path', {
      d: 'M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.4-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.4 11.4 0 016 0C17 4.7 18 5 18 5c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.5-2.7 5.5-5.3 5.8.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z',
    }),
  ])

interface Crumb {
  label: string
  href?: string
}

withDefaults(
  defineProps<{
    breadcrumbs?: Crumb[]
    user?: { name: string, email: string, avatar?: string }
  }>(),
  {
    breadcrumbs: () => [{ label: 'Dashboard' }],
  },
)

const emit = defineEmits<{
  (e: 'profile-select', key: string): void
  (e: 'command-select', item: { label: string, hint?: string }): void
}>()

const { theme, setTheme } = useTheme()
// ThemeSwitch's Theme union includes 'black' (extra registry preset) which
// our app-level useTheme doesn't model. Coerce at the boundary; the cookie
// only ever stores values from our narrower union.
function onThemeChange(next: 'light' | 'dark' | 'system' | 'black') {
  if (next === 'black') return
  setTheme(next)
}
</script>

<template>
  <SidebarProvider>
    <a
      href="#main-content"
      class="bg-background text-foreground ring-ring sr-only z-50 rounded-md text-sm font-medium shadow-md ring-2 focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:px-3 focus:py-2"
    >Skip to content</a>
    <Sidebar02
      :user="user"
      @logout="emit('profile-select', 'logout')"
      @profile-select="(key) => emit('profile-select', key)"
    />
    <SidebarInset>
      <header
        class="bg-background sticky top-0 z-30 flex h-14 w-full shrink-0 items-center justify-between border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
      >
        <div class="flex items-center gap-2">
          <SidebarTrigger class="-ml-1" />
          <Separator
            orientation="vertical"
            class="mr-2 h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <template
                v-for="(crumb, i) in breadcrumbs"
                :key="i"
              >
                <BreadcrumbItem :class="i === 0 ? 'hidden md:block' : ''">
                  <BreadcrumbLink
                    v-if="crumb.href && i < breadcrumbs.length - 1"
                    as-child
                    class="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <NuxtLink :to="crumb.href">{{ crumb.label }}</NuxtLink>
                  </BreadcrumbLink>
                  <BreadcrumbPage
                    v-else
                    class="font-medium"
                  >
                    {{ crumb.label }}
                  </BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator
                  v-if="i < breadcrumbs.length - 1"
                  :class="i === 0 ? 'hidden md:block' : ''"
                />
              </template>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div class="flex items-center gap-1 px-2 sm:gap-3">
          <a
            href="https://github.com/uday-a/nuxt-boilerplate"
            data-tour="github"
            target="_blank"
            rel="noreferrer"
            class="border-border/80 bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors sm:inline-flex"
          >
            <GithubIcon class="size-3.5" />
            <span>Nuxt.js Starter</span>
          </a>
          <div
            data-tour="palette"
            class="inline-flex"
          >
            <CommandPalette @select="(item) => emit('command-select', item)" />
          </div>
          <div class="flex items-center gap-0.5">
            <LocaleSwitcher />
            <ThemeCustomizer />
            <div
              data-tour="theme"
              class="inline-flex"
            >
              <ThemeSwitch
                :model-value="theme"
                variant="icon-only"
                @update:model-value="onThemeChange"
              />
            </div>
            <NotificationsPopover>
              <template #default="{ unreadCount }">
                <Button
                  variant="ghost"
                  size="icon"
                  class="text-muted-foreground hover:text-foreground relative size-8 rounded-lg"
                  aria-label="Notifications"
                >
                  <Bell class="size-4" />
                  <span
                    v-if="unreadCount > 0"
                    class="bg-primary ring-background absolute top-1.5 right-1.5 size-2 rounded-full ring-2"
                  />
                </Button>
              </template>
            </NotificationsPopover>
          </div>
        </div>
      </header>
      <!-- WHY (Rule18): cap content width so ultra-wide viewports don't
           stretch charts into noise. -->
      <main
        id="main-content"
        tabindex="-1"
        class="mx-auto flex w-full max-w-[1600px] flex-1 flex-col p-4 outline-none"
      >
        <slot />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
