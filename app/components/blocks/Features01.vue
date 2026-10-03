<script setup lang="ts">
import { BarChart3, FolderKanban, KeyRound, Plug, ShieldCheck, Users } from '@/lib/icon-pack'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
  {
    icon: FolderKanban,
    title: 'Projects',
    description: 'Plan work on boards, lists or calendars and see what shipped, what slipped and who owns it.',
  },
  {
    icon: Users,
    title: 'Teams and roles',
    description: 'Invite people, group them into teams and control what each role can view or change.',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Usage, activity and delivery trends on one dashboard, filterable by team or project.',
  },
  {
    icon: Plug,
    title: 'Integrations',
    description: 'Connect GitHub, Slack and your billing provider so updates flow in without copy and paste.',
  },
  {
    icon: KeyRound,
    title: 'API access',
    description: 'Scoped API keys with per-key limits, so scripts and services get only what they need.',
  },
  {
    icon: ShieldCheck,
    title: 'Security',
    description: 'SSO, two-factor sign-in and an audit log of every change, ready for your next review.',
  },
]
</script>

<template>
  <section class="bg-background">
    <div class="mx-auto max-w-6xl px-4 py-4">
      <div class="mb-4 max-w-2xl space-y-3">
        <p class="text-muted-foreground text-xs font-medium uppercase tracking-wider">
          Features
        </p>
        <h2 class="text-3xl font-semibold tracking-tight sm:text-4xl">
          Everything teams need, nothing they don't.
        </h2>
        <p class="text-muted-foreground text-lg">
          Six building blocks that work together from day one.
        </p>
      </div>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card
          v-for="feature in features"
          :key="feature.title"
        >
          <CardHeader class="gap-4">
            <div class="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
              <component
                :is="feature.icon"
                class="size-5"
                aria-hidden="true"
              />
            </div>
            <CardTitle class="text-base">
              {{ feature.title }}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-muted-foreground text-sm">
              {{ feature.description }}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
</template>
