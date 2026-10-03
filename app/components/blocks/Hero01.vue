<script setup lang="ts">
import { ArrowRight, PlayCircle, Sparkles } from '@/lib/icon-pack'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const { loggedIn } = useUserSession()

const tasks = [
  { title: 'Migrate billing to v2', owner: 'Emma Clarke', initials: 'EC', status: 'Done', variant: 'success' },
  { title: 'SSO for Enterprise', owner: 'James Porter', initials: 'JP', status: 'In review', variant: 'info' },
  { title: 'Usage-based alerts', owner: 'Olivia Brooks', initials: 'OB', status: 'Open', variant: 'secondary' },
] as const
</script>

<template>
  <section class="relative overflow-hidden bg-background">
    <div class="relative mx-auto max-w-6xl px-4 py-4 lg:py-4">
      <div class="grid gap-4 lg:grid-cols-2 lg:items-center">
        <div class="space-y-4">
          <Badge
            variant="secondary"
            class="gap-1"
          >
            <Sparkles
              class="size-3.5"
              aria-hidden="true"
            />
            New: usage-based alerts
          </Badge>
          <h1 class="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            The platform your team will actually use.
          </h1>
          <p class="max-w-xl text-lg text-muted-foreground">
            Plan projects, track work and ship releases in one workspace — with the
            billing, permissions and audit trail your company needs built in.
          </p>
          <div class="flex flex-wrap items-center gap-3">
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
            <!-- The login page has a one-click demo workspace; send people there
                 rather than to a video that doesn't exist. -->
            <Button
              as-child
              size="lg"
              variant="outline"
            >
              <NuxtLink to="/login">
                <PlayCircle
                  class="size-4"
                  aria-hidden="true"
                />
                Try the live demo
              </NuxtLink>
            </Button>
          </div>
          <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span>Rated 4.9 on G2</span>
            <span>14-day free trial</span>
            <span>No credit card required</span>
          </div>
        </div>

        <div
          class="relative mx-auto w-full max-w-md lg:mr-0"
          aria-hidden="true"
        >
          <!-- WHY (Rule7): flat system -- shadow-sm only. Cards sit on
               borders, not elevation. -->
          <Card class="shadow-sm">
            <CardHeader>
              <CardTitle class="text-base">
                Q4 launch
              </CardTitle>
              <CardDescription>3 tasks due this week · 1 done</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div
                v-for="task in tasks"
                :key="task.title"
                class="flex items-center gap-3"
              >
                <Avatar class="size-8">
                  <AvatarFallback class="bg-muted text-muted-foreground text-xs">
                    {{ task.initials }}
                  </AvatarFallback>
                </Avatar>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium">
                    {{ task.title }}
                  </p>
                  <p class="text-muted-foreground text-xs">
                    {{ task.owner }}
                  </p>
                </div>
                <Badge :variant="task.variant">
                  {{ task.status }}
                </Badge>
              </div>
            </CardContent>
          </Card>
          <div class="relative -mt-4 hidden grid-cols-2 gap-4 px-4 md:grid">
            <Card class="-rotate-2 shadow-sm">
              <CardContent class="space-y-1 p-4">
                <p class="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                  Deploys
                </p>
                <p class="text-2xl font-semibold tracking-tight tabular-nums">
                  42
                </p>
                <p class="text-success text-xs">
                  +12% vs last week
                </p>
              </CardContent>
            </Card>
            <Card class="rotate-2 shadow-sm">
              <CardContent class="space-y-1 p-4">
                <p class="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                  Uptime
                </p>
                <p class="text-2xl font-semibold tracking-tight tabular-nums">
                  99.98%
                </p>
                <p class="text-muted-foreground text-xs">
                  Last 30 days
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
