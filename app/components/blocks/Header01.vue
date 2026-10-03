<script setup lang="ts">
import { ref } from 'vue'
import { Boxes, Menu } from '@/lib/icon-pack'
import { Button } from '@/components/ui/button'
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

const mobileOpen = ref(false)
const { loggedIn } = useUserSession()
</script>

<template>
  <header
    class="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60"
  >
    <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
      <NuxtLink
        to="/"
        class="flex items-center gap-2"
      >
        <div class="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Boxes
            class="size-4"
            aria-hidden="true"
          />
        </div>
        <span class="text-base font-semibold">UIPKGE</span>
      </NuxtLink>

      <nav
        class="hidden items-center gap-4 md:flex"
        aria-label="Primary"
      >
        <a
          href="/#features"
          class="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >Features</a>
        <NuxtLink
          to="/pricing"
          class="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >Pricing</NuxtLink>
        <a
          href="/#customers"
          class="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >Customers</a>
        <a
          href="/#faq"
          class="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >FAQ</a>
      </nav>

      <div class="hidden items-center gap-2 md:flex">
        <template v-if="loggedIn">
          <Button
            as-child
            size="sm"
          >
            <NuxtLink to="/dashboard">Go to dashboard</NuxtLink>
          </Button>
        </template>
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
        <SheetContent
          side="right"
          class="w-72"
        >
          <SheetHeader>
            <div class="flex items-center gap-2">
              <div class="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Boxes
                  class="size-4"
                  aria-hidden="true"
                />
              </div>
              <SheetTitle class="text-sm">
                UIPKGE
              </SheetTitle>
            </div>
            <SheetDescription class="sr-only">
              Site navigation
            </SheetDescription>
          </SheetHeader>
          <SheetBody>
            <nav
              class="flex flex-col gap-1"
              aria-label="Mobile"
            >
              <a
                href="/#features"
                class="rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
                @click="mobileOpen = false"
              >Features</a>
              <NuxtLink
                to="/pricing"
                class="rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
                @click="mobileOpen = false"
              >Pricing</NuxtLink>
              <a
                href="/#customers"
                class="rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
                @click="mobileOpen = false"
              >Customers</a>
              <a
                href="/#faq"
                class="rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
                @click="mobileOpen = false"
              >FAQ</a>
            </nav>
          </SheetBody>
          <SheetFooter class="flex-col sm:flex-col">
            <template v-if="loggedIn">
              <Button
                as-child
                class="w-full"
                @click="mobileOpen = false"
              >
                <NuxtLink to="/dashboard">Go to dashboard</NuxtLink>
              </Button>
            </template>
            <template v-else>
              <Button
                as-child
                variant="outline"
                class="w-full"
                @click="mobileOpen = false"
              >
                <NuxtLink to="/login">Sign in</NuxtLink>
              </Button>
              <Button
                as-child
                class="w-full"
                @click="mobileOpen = false"
              >
                <NuxtLink to="/sign-up">Start free trial</NuxtLink>
              </Button>
            </template>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  </header>
</template>
