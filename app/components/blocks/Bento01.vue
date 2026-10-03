<script setup lang="ts">
import { Activity, Clock, ShieldCheck, Sparkles } from '@/lib/icon-pack'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
</script>

<template>
  <section class="bg-background">
    <div class="mx-auto max-w-6xl px-4 py-4">
      <div class="mb-4 max-w-2xl space-y-3">
        <p class="text-muted-foreground text-xs font-medium uppercase tracking-wider">
          Built for scale
        </p>
        <h2 class="text-3xl font-semibold tracking-tight sm:text-4xl">
          A workspace your team grows into, not out of.
        </h2>
        <p class="text-lg text-muted-foreground">
          Start with one team and one project. Add seats, workspaces and SSO when you need them.
        </p>
      </div>

      <div class="grid gap-4 lg:grid-cols-4 lg:grid-rows-2">
        <Card class="lg:col-span-2 lg:row-span-2">
          <CardContent class="flex h-full flex-col gap-4 p-4">
            <div class="flex items-center gap-3">
              <div class="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles
                  class="size-5"
                  aria-hidden="true"
                />
              </div>
              <Badge variant="secondary">
                New
              </Badge>
            </div>
            <div class="space-y-3">
              <h3 class="text-2xl font-semibold tracking-tight">
                Weekly status, written for you
              </h3>
              <p class="text-muted-foreground text-sm">
                Every Friday the assistant reads your project activity, closed tasks and
                open blockers, then drafts a status update you can edit and share. Every
                line links back to the task it came from.
              </p>
            </div>

            <div class="mt-auto bg-muted/30 rounded-lg border p-4">
              <div class="flex items-center justify-between text-xs text-muted-foreground">
                <span>Tasks covered</span>
                <span class="tabular-nums">46 / 50</span>
              </div>
              <div class="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div class="h-full w-[92%] rounded-full bg-primary" />
              </div>
              <div class="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
                <div>
                  <p class="text-foreground text-base font-semibold tabular-nums">
                    34
                  </p>
                  <p class="text-muted-foreground">
                    Tasks closed
                  </p>
                </div>
                <div>
                  <p class="text-foreground text-base font-semibold tabular-nums">
                    12
                  </p>
                  <p class="text-muted-foreground">
                    Pull requests
                  </p>
                </div>
                <div>
                  <p class="text-foreground text-base font-semibold tabular-nums">
                    4
                  </p>
                  <p class="text-muted-foreground">
                    Blockers
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card class="lg:col-span-2 lg:row-span-1">
          <CardContent class="flex h-full items-start gap-4 p-4">
            <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Activity
                class="size-5"
                aria-hidden="true"
              />
            </div>
            <div class="space-y-2">
              <h3 class="text-lg font-semibold tracking-tight">
                Real-time activity
              </h3>
              <p class="text-sm text-muted-foreground">
                Every event — deploy, comment, invoice, permission change — streams into a
                single timeline you can filter by team, person or project.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="flex h-full flex-col justify-between gap-4 p-4">
            <div class="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Clock
                class="size-5"
                aria-hidden="true"
              />
            </div>
            <div>
              <p class="text-3xl font-semibold tracking-tight tabular-nums">
                12 min
              </p>
              <p class="mt-1 text-sm text-muted-foreground">
                Average setup time
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="flex h-full flex-col justify-between gap-4 p-4">
            <div class="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck
                class="size-5"
                aria-hidden="true"
              />
            </div>
            <div>
              <p class="text-sm font-semibold">
                SOC 2 · ISO 27001 · GDPR
              </p>
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
