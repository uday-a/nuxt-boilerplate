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

const queue = [
  { name: 'Lena Wei', initials: 'LW' },
  { name: 'Joaquín Reyes', initials: 'JR' },
  { name: 'Priya Shah', initials: 'PS' },
]
</script>

<template>
  <section class="bg-background relative overflow-hidden">
    <div class="relative mx-auto max-w-6xl px-6 py-24 lg:py-32">
      <div class="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div class="space-y-6">
          <Badge
            variant="secondary"
            class="gap-1"
          >
            <Sparkles class="size-3" />
            New: AI-powered insights
          </Badge>
          <h1 class="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            The platform your team will actually use.
          </h1>
          <p class="text-muted-foreground max-w-xl text-lg">
            One workspace for everything your team needs. Built on shadcn-vue primitives — fast, accessible, easy to
            customise.
          </p>
          <div class="flex flex-wrap items-center gap-3">
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
          <div class="text-muted-foreground flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <span>★★★★★ 4.9 on G2</span>
            <span>14-day free trial</span>
            <span>No credit card required</span>
          </div>
        </div>

        <div
          class="relative mx-auto w-full max-w-md lg:mr-0"
          aria-hidden="true"
        >
          <!-- WHY: flat system -- shadow-sm only. Cards sit on
               borders, not elevation. -->
          <Card class="shadow-sm">
            <CardHeader>
              <CardTitle class="text-base">
                Onboarding queue
              </CardTitle>
              <CardDescription>3 starting Monday</CardDescription>
            </CardHeader>
            <CardContent class="space-y-3">
              <div
                v-for="person in queue"
                :key="person.name"
                class="flex items-center gap-3"
              >
                <Avatar class="size-8">
                  <AvatarFallback>{{ person.initials }}</AvatarFallback>
                </Avatar>
                <div class="flex-1">
                  <p class="text-sm font-medium">
                    {{ person.name }}
                  </p>
                  <p class="text-muted-foreground text-xs">
                    Engineering
                  </p>
                </div>
                <Badge variant="secondary">
                  Pending
                </Badge>
              </div>
            </CardContent>
          </Card>
          <div class="relative -mt-4 hidden grid-cols-2 gap-4 px-4 md:grid">
            <Card class="rotate-2 shadow-sm">
              <CardContent class="space-y-1 p-4">
                <p class="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Active users
                </p>
                <p class="text-2xl font-semibold tracking-tight tabular-nums">
                  1,284
                </p>
                <p class="text-success text-xs">
                  +8.2% MoM
                </p>
              </CardContent>
            </Card>
            <Card class="-rotate-2 shadow-sm">
              <CardContent class="space-y-1 p-4">
                <p class="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Uptime
                </p>
                <p class="text-2xl font-semibold tracking-tight tabular-nums">
                  100%
                </p>
                <p class="text-muted-foreground text-xs">
                  12 cycles, 0 misses
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
