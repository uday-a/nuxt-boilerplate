<script setup lang="ts">
import { Activity, Clock, ShieldCheck, Sparkles } from '@/lib/icon-pack'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

const sources = [
  { value: 12, label: 'Goals' },
  { value: 34, label: '1:1 notes' },
  { value: 8, label: 'Peers' },
]
</script>

<template>
  <section class="bg-background">
    <div class="mx-auto max-w-6xl px-6 py-24">
      <div class="mb-12 max-w-2xl space-y-3">
        <p class="text-muted-foreground text-xs font-medium tracking-wider uppercase">
          Built for scale
        </p>
        <h2 class="text-3xl font-semibold tracking-tight sm:text-4xl">
          A workspace your team grows into, not out of.
        </h2>
        <p class="text-muted-foreground text-lg">
          Four surfaces that work end-to-end. Replace any one without touching the rest.
        </p>
      </div>

      <div class="grid gap-4 lg:grid-cols-4 lg:grid-rows-2">
        <Card class="lg:col-span-2 lg:row-span-2">
          <CardContent class="flex h-full flex-col gap-6 p-8">
            <div class="flex items-center gap-3">
              <div class="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
                <Sparkles class="size-5" />
              </div>
              <Badge variant="secondary">
                New
              </Badge>
            </div>
            <div class="space-y-3">
              <h3 class="text-2xl font-semibold tracking-tight">
                AI-assisted reviews
              </h3>
              <p class="text-muted-foreground">
                Draft 360 feedback in seconds. The assistant reads your goals, your 1:1 notes and your peer reviews,
                then writes a first pass you can edit. Every suggestion cites the source so nothing comes out of
                nowhere.
              </p>
            </div>

            <div class="bg-muted/30 mt-auto rounded-lg border p-5">
              <div class="text-muted-foreground flex items-center justify-between text-xs">
                <span>Draft quality</span>
                <span class="tabular-nums">92 / 100</span>
              </div>
              <div class="bg-muted mt-3 h-2 overflow-hidden rounded-full">
                <div class="bg-primary h-full w-[92%] rounded-full" />
              </div>
              <div class="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
                <div
                  v-for="source in sources"
                  :key="source.label"
                >
                  <p class="text-foreground text-base tabular-nums">
                    {{ source.value }}
                  </p>
                  <p class="text-muted-foreground">
                    {{ source.label }}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card class="lg:col-span-2 lg:row-span-1">
          <CardContent class="flex h-full items-start gap-5 p-6">
            <div class="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
              <Activity class="size-5" />
            </div>
            <div class="space-y-2">
              <h3 class="text-lg font-semibold tracking-tight">
                Real-time activity
              </h3>
              <p class="text-muted-foreground text-sm">
                Every event — hire, promotion, time-off, payroll run — streams into a single timeline you can filter by
                team, person or module.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="flex h-full flex-col justify-between gap-4 p-6">
            <div class="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
              <Clock class="size-5" />
            </div>
            <div>
              <p class="text-3xl font-semibold tracking-tight">
                12 min
              </p>
              <p class="text-muted-foreground mt-1 text-sm">
                Average setup time
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="flex h-full flex-col justify-between gap-4 p-6">
            <div class="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
              <ShieldCheck class="size-5" />
            </div>
            <div>
              <p class="text-sm font-semibold tracking-tight">
                SOC 2 · ISO 27001 · GDPR
              </p>
              <p class="text-muted-foreground mt-1 text-sm">
                Encrypted at rest, audited quarterly.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
</template>
