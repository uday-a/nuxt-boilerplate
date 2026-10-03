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
  <footer class="border-t bg-background">
    <div class="mx-auto max-w-6xl px-4 py-4">
      <div class="grid gap-4 lg:grid-cols-12">
        <div class="space-y-4 lg:col-span-4">
          <div class="flex items-center gap-2">
            <div class="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Boxes
                class="size-4"
                aria-hidden="true"
              />
            </div>
            <span class="text-base font-semibold">UIPKGE</span>
          </div>
          <p class="max-w-sm text-sm text-muted-foreground">
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
            class="text-xs text-success"
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
                <NuxtLink
                  to="/login"
                  class="text-sm text-muted-foreground transition-colors hover:text-foreground"
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
                  class="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >Documentation</a>
              </li>
              <li>
                <NuxtLink
                  to="/support"
                  class="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >Help center</NuxtLink>
              </li>
              <li>
                <NuxtLink
                  to="/feedback"
                  class="text-sm text-muted-foreground transition-colors hover:text-foreground"
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
                  class="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >Terms</NuxtLink>
              </li>
              <li>
                <NuxtLink
                  to="/privacy"
                  class="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >Privacy</NuxtLink>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <Separator class="my-4" />

      <div class="flex flex-wrap items-center justify-between gap-4">
        <p class="text-xs text-muted-foreground">
          © 2026 UIPKGE. All rights reserved.
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
