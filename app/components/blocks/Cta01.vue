<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
</script>

<template>
  <section class="relative overflow-hidden bg-background">
    <div
      class="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-primary/15 via-background to-background"
    />
    <div
      class="pointer-events-none absolute -bottom-40 right-1/4 size-[500px] rounded-full bg-primary/10 blur-3xl"
    />

    <div class="mx-auto max-w-4xl px-6 py-24 text-center">
      <h2 class="text-3xl font-semibold tracking-tight sm:text-4xl">
        Ready to give your team a Monday they'll actually look forward to?
      </h2>
      <p class="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
        Set up takes 12 minutes. Migrate from your current tool with one CSV upload.
      </p>
      <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button size="lg">
          Start free trial
          <ArrowRight class="ml-2 size-4" />
        </Button>
        <Button size="lg" variant="outline">Book a demo</Button>
      </div>
      <p class="mt-4 text-xs text-muted-foreground">
        14-day free trial · No credit card required · Cancel anytime
      </p>
    </div>
  </section>
</template>
