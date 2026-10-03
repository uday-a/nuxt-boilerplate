<script setup lang="ts">
import { ArrowRight } from '@/lib/icon-pack'
import { Button } from '@/components/ui/button'

const { loggedIn } = useUserSession()
</script>

<template>
  <section class="bg-muted/30 border-t">
    <div class="mx-auto max-w-4xl px-4 py-4 text-center">
      <h2 class="text-3xl font-semibold tracking-tight sm:text-4xl">
        Ready to see what your team ships next?
      </h2>
      <p class="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
        Setup takes 12 minutes. Bring your projects over from your current tool with one CSV upload.
      </p>
      <div class="mt-4 flex flex-wrap items-center justify-center gap-3">
        <Button
          v-if="loggedIn"
          as-child
          size="lg"
        >
          <NuxtLink to="/dashboard">
            Go to dashboard
            <ArrowRight
              class="size-4"
              aria-hidden="true"
            />
          </NuxtLink>
        </Button>
        <Button
          v-else
          as-child
          size="lg"
        >
          <NuxtLink to="/sign-up">
            Start free trial
            <ArrowRight
              class="size-4"
              aria-hidden="true"
            />
          </NuxtLink>
        </Button>
        <Button
          size="lg"
          variant="outline"
        >
          Book a demo
        </Button>
      </div>
      <p class="mt-4 text-xs text-muted-foreground">
        14-day free trial · No credit card required · Cancel anytime
      </p>
    </div>
  </section>
</template>
