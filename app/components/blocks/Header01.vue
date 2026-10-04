<script setup lang="ts">
import { ref } from 'vue'
import { Boxes, Menu } from '@/lib/icon-pack'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

const mobileOpen = ref(false)
const { loggedIn } = useUserSession()

const links = [
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#customers', label: 'Customers' },
  { href: '#docs', label: 'Docs' },
  { href: '#blog', label: 'Blog' },
]
</script>

<template>
  <header class="bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 border-b backdrop-blur">
    <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
      <NuxtLink
        to="/"
        class="flex items-center gap-2"
      >
        <div class="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
          <Boxes class="size-4" />
        </div>
        <span class="text-base font-semibold">Acme</span>
      </NuxtLink>

      <nav
        class="hidden items-center gap-6 md:flex"
        aria-label="Primary"
      >
        <a
          v-for="link in links"
          :key="link.href"
          :href="link.href"
          class="text-muted-foreground hover:text-foreground text-sm transition-colors"
        >{{ link.label }}</a>
      </nav>

      <div class="hidden items-center gap-2 md:flex">
        <Button
          v-if="loggedIn"
          as-child
          size="sm"
        >
          <NuxtLink to="/dashboard">Go to dashboard</NuxtLink>
        </Button>
        <template v-else>
          <Button
            as-child
            variant="ghost"
            size="sm"
          >
            <NuxtLink to="/login">Sign in</NuxtLink>
          </Button>
          <Button
            as-child
            size="sm"
          >
            <NuxtLink to="/sign-up">Start free trial</NuxtLink>
          </Button>
        </template>
      </div>

      <Sheet v-model:open="mobileOpen">
        <SheetTrigger as-child>
          <Button
            variant="ghost"
            size="icon"
            class="md:hidden"
            aria-label="Open menu"
          >
            <Menu class="size-5" />
          </Button>
        </SheetTrigger>
        <!-- SheetContent renders its own close button in the header's top-right
             corner, so no hand-rolled X here. -->
        <SheetContent
          side="right"
          class="w-72"
        >
          <div class="flex h-full flex-col">
            <div class="flex items-center justify-between border-b px-4 py-3">
              <div class="flex items-center gap-2">
                <div class="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-md">
                  <Boxes class="size-3.5" />
                </div>
                <SheetTitle
                  as="span"
                  class="text-sm font-semibold"
                >
                  Acme
                </SheetTitle>
              </div>
              <SheetDescription class="sr-only">
                Site navigation
              </SheetDescription>
            </div>
            <nav
              class="flex flex-1 flex-col gap-1 p-4"
              aria-label="Mobile"
            >
              <a
                v-for="link in links"
                :key="link.href"
                :href="link.href"
                class="hover:bg-muted rounded-md px-3 py-2 text-sm transition-colors"
                @click="mobileOpen = false"
              >{{ link.label }}</a>
            </nav>
            <div class="flex flex-col gap-2 border-t p-4">
              <Button
                v-if="loggedIn"
                as-child
                class="w-full"
              >
                <NuxtLink
                  to="/dashboard"
                  @click="mobileOpen = false"
                >
                  Go to dashboard
                </NuxtLink>
              </Button>
              <template v-else>
                <Button
                  as-child
                  variant="outline"
                  class="w-full"
                >
                  <NuxtLink
                    to="/login"
                    @click="mobileOpen = false"
                  >
                    Sign in
                  </NuxtLink>
                </Button>
                <Button
                  as-child
                  class="w-full"
                >
                  <NuxtLink
                    to="/sign-up"
                    @click="mobileOpen = false"
                  >
                    Start free trial
                  </NuxtLink>
                </Button>
              </template>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  </header>
</template>
