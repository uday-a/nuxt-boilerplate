<script setup lang="ts">
import { Activity, Clock, ShieldCheck, Sparkles } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
</script>

<template>
  <section class="bg-background">
    <div class="mx-auto max-w-6xl px-6 py-24">
      <div class="mb-12 max-w-2xl space-y-3">
        <p class="text-sm font-medium uppercase tracking-widest text-primary">Built for scale</p>
        <h2 class="text-3xl font-semibold tracking-tight sm:text-4xl">
          A workspace your team grows into, not out of.
        </h2>
        <p class="text-lg text-muted-foreground">
          Four surfaces that work end-to-end. Replace any one without touching the rest.
        </p>
      </div>

      <div class="grid gap-4 lg:grid-cols-4 lg:grid-rows-2">
        <Card class="lg:col-span-2 lg:row-span-2">
          <CardContent class="flex h-full flex-col gap-6 p-8">
            <div class="flex items-center gap-3">
              <div class="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles class="size-5" />
              </div>
              <Badge variant="secondary">New</Badge>
            </div>
            <div class="space-y-3">
              <h3 class="text-2xl font-semibold tracking-tight">AI-assisted reviews</h3>
              <p class="text-muted-foreground">
                Draft 360 feedback in seconds. The assistant reads your goals, your 1:1
                notes and your peer reviews, then writes a first pass you can edit. Every
                suggestion cites the source so nothing comes out of nowhere.
              </p>
            </div>

            <div class="mt-auto rounded-lg border bg-muted/30 p-5">
              <div class="flex items-center justify-between text-xs text-muted-foreground">
                <span>Draft quality</span>
                <span class="font-mono">92 / 100</span>
              </div>
              <div class="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div class="h-full w-[92%] rounded-full bg-primary" />
              </div>
              <div class="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
                <div>
                  <p class="font-mono text-base text-foreground">12</p>
                  <p class="text-muted-foreground">Goals</p>
                </div>
                <div>
                  <p class="font-mono text-base text-foreground">34</p>
                  <p class="text-muted-foreground">1:1 notes</p>
                </div>
                <div>
                  <p class="font-mono text-base text-foreground">8</p>
                  <p class="text-muted-foreground">Peers</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card class="lg:col-span-2 lg:row-span-1">
          <CardContent class="flex h-full items-start gap-5 p-6">
            <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Activity class="size-5" />
            </div>
            <div class="space-y-2">
              <h3 class="text-lg font-semibold tracking-tight">Real-time activity</h3>
              <p class="text-sm text-muted-foreground">
                Every event — hire, promotion, time-off, payroll run — streams into a
                single timeline you can filter by team, person or module.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="flex h-full flex-col justify-between gap-4 p-6">
            <div class="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Clock class="size-5" />
            </div>
            <div>
              <p class="text-3xl font-semibold tracking-tight">12 min</p>
              <p class="mt-1 text-sm text-muted-foreground">Average setup time</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="flex h-full flex-col justify-between gap-4 p-6">
            <div class="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck class="size-5" />
            </div>
            <div>
              <p class="text-sm font-semibold tracking-tight">SOC 2 · ISO 27001 · GDPR</p>
              <p class="mt-1 text-sm text-muted-foreground">
                Encrypted at rest, audited quarterly.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
</template>
