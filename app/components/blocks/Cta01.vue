<script setup lang="ts">
import { ArrowRight } from '@/lib/icon-pack'
import { Button } from '@/components/ui/button'

const { loggedIn } = useUserSession()
</script>

<template>
  <section class="bg-background relative overflow-hidden">
    <div class="mx-auto max-w-4xl px-6 py-24 text-center">
      <h2 class="text-3xl font-semibold tracking-tight sm:text-4xl">
        Ready to give your team a Monday they'll actually look forward to?
      </h2>
      <p class="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
        Set up takes 12 minutes. Migrate from your current tool with one CSV upload.
      </p>
      <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button
          v-if="loggedIn"
          as-child
          size="lg"
        >
          <NuxtLink to="/dashboard">
            Go to dashboard
            <ArrowRight class="ml-2 size-4" />
          </NuxtLink>
        </Button>
        <Button
          v-else
          as-child
          size="lg"
        >
          <NuxtLink to="/sign-up">
            Start free trial
            <ArrowRight class="ml-2 size-4" />
          </NuxtLink>
        </Button>
        <Button
          as-child
          size="lg"
          variant="outline"
        >
          <NuxtLink to="/login">Book a demo</NuxtLink>
        </Button>
      </div>
      <p class="text-muted-foreground mt-4 text-xs">
        14-day free trial · No credit card required · Cancel anytime
      </p>
    </div>
  </section>
</template>
