<script setup lang="ts">
import { ref } from 'vue'
import { Boxes, Github, Linkedin, Twitter } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

const newsletter = ref('')
const subscribed = ref(false)

function subscribe() {
  if (!newsletter.value) return
  subscribed.value = true
  newsletter.value = ''
}
</script>

<template>
  <footer class="border-t bg-background">
    <div class="mx-auto max-w-6xl px-6 py-16">
      <div class="grid gap-10 lg:grid-cols-12">
        <div class="space-y-4 lg:col-span-4">
          <div class="flex items-center gap-2">
            <div class="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Boxes class="size-4" />
            </div>
            <span class="text-base font-semibold">Acme</span>
          </div>
          <p class="max-w-sm text-sm text-muted-foreground">
            Built on shadcn-vue. Get product updates monthly.
          </p>
          <form
            class="flex max-w-sm gap-2"
            @submit.prevent="subscribe"
          >
            <Input
              v-model="newsletter"
              type="email"
              placeholder="you@company.com"
              required
              class="flex-1"
            />
            <Button type="submit">
              Subscribe
            </Button>
          </form>
          <p
            v-if="subscribed"
            class="text-xs text-[var(--success)]"
          >
            Thanks — check your inbox to confirm.
          </p>
        </div>

        <div class="grid grid-cols-2 gap-6 sm:grid-cols-4 lg:col-span-8">
          <div class="space-y-3">
            <h3 class="text-sm font-semibold">
              Product
            </h3>
            <ul class="space-y-2">
              <li>
                <NuxtLink
                  to="/#features"
                  class="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >Features</NuxtLink>
              </li>
              <li>
                <NuxtLink
                  to="/pricing"
                  class="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >Pricing</NuxtLink>
              </li>
              <li>
                <a
                  href="#"
                  class="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  aria-disabled="true"
                >Changelog</a>
              </li>
              <li>
                <a
                  href="#"
                  class="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  aria-disabled="true"
                >Roadmap</a>
              </li>
            </ul>
          </div>
          <div class="space-y-3">
            <h3 class="text-sm font-semibold">
              Company
            </h3>
            <ul class="space-y-2">
              <li>
                <a
                  href="#"
                  class="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >About</a>
              </li>
              <li>
                <a
                  href="#"
                  class="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >Blog</a>
              </li>
              <li>
                <a
                  href="#"
                  class="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >Careers</a>
              </li>
              <li>
                <a
                  href="#"
                  class="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >Contact</a>
              </li>
            </ul>
          </div>
          <div class="space-y-3">
            <h3 class="text-sm font-semibold">
              Resources
            </h3>
            <ul class="space-y-2">
              <li>
                <a
                  href="#"
                  class="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  aria-disabled="true"
                >Documentation</a>
              </li>
              <li>
                <a
                  href="#"
                  class="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  aria-disabled="true"
                >API</a>
              </li>
              <li>
                <NuxtLink
                  to="/support"
                  class="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >Help center</NuxtLink>
              </li>
              <li>
                <a
                  href="#"
                  class="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  aria-disabled="true"
                >Status</a>
              </li>
            </ul>
          </div>
          <div class="space-y-3">
            <h3 class="text-sm font-semibold">
              Legal
            </h3>
            <ul class="space-y-2">
              <li>
                <NuxtLink
                  to="/terms"
                  class="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >Terms</NuxtLink>
              </li>
              <li>
                <NuxtLink
                  to="/privacy"
                  class="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >Privacy</NuxtLink>
              </li>
              <li>
                <a
                  href="#"
                  class="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >Security</a>
              </li>
              <li>
                <a
                  href="#"
                  class="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >DPA</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <Separator class="my-10" />

      <div class="flex flex-wrap items-center justify-between gap-4">
        <p class="text-xs text-muted-foreground">
          © 2026 Acme. All rights reserved.
        </p>
        <div class="flex items-center gap-3">
          <a
            href="#"
            aria-label="GitHub"
            class="text-muted-foreground transition-colors hover:text-foreground"
          >
            <Github class="size-4" />
          </a>
          <a
            href="#"
            aria-label="Twitter"
            class="text-muted-foreground transition-colors hover:text-foreground"
          >
            <Twitter class="size-4" />
          </a>
          <a
            href="#"
            aria-label="LinkedIn"
            class="text-muted-foreground transition-colors hover:text-foreground"
          >
            <Linkedin class="size-4" />
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>
