<script setup lang="ts">
import { ref } from 'vue'
import { Boxes, Menu, X } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'

const mobileOpen = ref(false)
</script>

<template>
  <header
    class="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60"
  >
    <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
      <a href="#" class="flex items-center gap-2">
        <div class="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Boxes class="size-4" />
        </div>
        <span class="text-base font-semibold">Acme</span>
      </a>

      <nav class="hidden items-center gap-6 md:flex" aria-label="Primary">
        <a href="#features" class="text-sm text-muted-foreground transition-colors hover:text-foreground">Features</a>
        <a href="#pricing" class="text-sm text-muted-foreground transition-colors hover:text-foreground">Pricing</a>
        <a href="#customers" class="text-sm text-muted-foreground transition-colors hover:text-foreground">Customers</a>
        <a href="#faq" class="text-sm text-muted-foreground transition-colors hover:text-foreground">FAQ</a>
        <a href="#contact" class="text-sm text-muted-foreground transition-colors hover:text-foreground">Contact</a>
      </nav>

      <div class="hidden items-center gap-2 md:flex">
        <ThemeSwitcher />
        <Button variant="ghost" size="sm">Sign in</Button>
        <Button size="sm">Start free trial</Button>
      </div>

      <Sheet v-model:open="mobileOpen">
        <SheetTrigger as-child>
          <Button variant="ghost" size="icon" class="md:hidden" aria-label="Open menu">
            <Menu class="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" class="w-72">
          <div class="flex h-full flex-col">
            <div class="flex items-center justify-between border-b px-4 py-3">
              <div class="flex items-center gap-2">
                <div class="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Boxes class="size-3.5" />
                </div>
                <span class="text-sm font-semibold">Acme</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                class="size-8"
                aria-label="Close menu"
                @click="mobileOpen = false"
              >
                <X class="size-4" />
              </Button>
            </div>
            <nav class="flex flex-1 flex-col gap-1 p-4" aria-label="Mobile">
              <a href="#features" class="rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted" @click="mobileOpen = false">Features</a>
              <a href="#pricing" class="rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted" @click="mobileOpen = false">Pricing</a>
              <a href="#customers" class="rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted" @click="mobileOpen = false">Customers</a>
              <a href="#faq" class="rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted" @click="mobileOpen = false">FAQ</a>
              <a href="#contact" class="rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted" @click="mobileOpen = false">Contact</a>
            </nav>
            <div class="flex flex-col gap-2 border-t p-4">
              <div class="flex items-center justify-between">
                <span class="text-xs text-muted-foreground">Theme</span>
                <ThemeSwitcher />
              </div>
              <Button variant="outline" class="w-full">Sign in</Button>
              <Button class="w-full">Start free trial</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  </header>
</template>
