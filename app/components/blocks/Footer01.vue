<script setup lang="ts">
import { ref } from 'vue'
import { Boxes, Github } from '@/lib/icon-pack'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

const REPO_URL = 'https://github.com/uday-a/nuxt-boilerplate'

const newsletter = ref('')
const subscribed = ref(false)

function subscribe() {
  if (!newsletter.value) return
  subscribed.value = true
  newsletter.value = ''
}
</script>

<template>
  <footer class="bg-background border-t">
    <div class="mx-auto max-w-6xl px-4 py-4">
      <div class="grid gap-4 lg:grid-cols-12">
        <div class="space-y-4 lg:col-span-4">
          <div class="flex items-center gap-2">
            <div class="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
              <Boxes
                class="size-4"
                aria-hidden="true"
              />
            </div>
            <span class="text-base font-semibold">Acme</span>
          </div>
          <p class="text-muted-foreground max-w-sm text-sm">
            Projects, billing and permissions for growing teams. Product updates once a month.
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
            class="text-success text-xs"
          >
            Thanks — check your inbox to confirm.
          </p>
        </div>

        <!-- Real destinations only: a boilerplate footer full of href="#" teaches
             dead links. Add columns back as the pages exist. -->
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:col-span-8">
          <div class="space-y-3">
            <h3 class="text-sm font-semibold">
              Product
            </h3>
            <ul class="space-y-2">
              <li>
                <NuxtLink
                  to="/#features"
                  class="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >Features</NuxtLink>
              </li>
              <li>
                <NuxtLink
                  to="/pricing"
                  class="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >Pricing</NuxtLink>
              </li>
              <li>
                <NuxtLink
                  to="/login"
                  class="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >Sign in</NuxtLink>
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
                  :href="REPO_URL"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >Documentation</a>
              </li>
              <li>
                <NuxtLink
                  to="/support"
                  class="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >Help center</NuxtLink>
              </li>
              <li>
                <NuxtLink
                  to="/feedback"
                  class="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >Feedback</NuxtLink>
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
                  class="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >Terms</NuxtLink>
              </li>
              <li>
                <NuxtLink
                  to="/privacy"
                  class="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >Privacy</NuxtLink>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <Separator class="my-4" />

      <div class="flex flex-wrap items-center justify-between gap-4">
        <p class="text-muted-foreground text-xs">
          © 2026 Acme. All rights reserved.
        </p>
        <a
          :href="REPO_URL"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          class="text-muted-foreground transition-colors hover:text-foreground"
        >
          <Github
            class="size-4"
            aria-hidden="true"
          />
        </a>
      </div>
    </div>
  </footer>
</template>
