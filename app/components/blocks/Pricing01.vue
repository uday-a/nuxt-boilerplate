<script setup lang="ts">
import { ref } from 'vue'
import { Check, Sparkles } from '@/lib/icon-pack'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

type Cycle = 'monthly' | 'yearly'
type Plan = 'pro' | 'team' | 'enterprise'

// `page` renders the section heading as the page's H1 (on /pricing) and
// drops the eyebrow, so the page has one heading hierarchy.
// Handlers are props (bound via `@subscribe` / `@contact-sales`) so the block
// can tell whether a parent is listening: without one, the buttons fall back
// to plain links. Plan keys match `Plan` in server/utils/polar.ts so the
// parent page can pass them straight to /api/billing/checkout.
defineProps<{
  page?: boolean
  onSubscribe?: (plan: Plan, cycle: Cycle) => void
  onContactSales?: () => void
}>()

const cycle = ref<Cycle>('monthly')

const starterFeatures = ['Up to 10 employees', 'Core HR + directory', 'Time off + holidays', 'Email support']
const teamFeatures = ['Unlimited employees', 'Payroll + tax filing', 'Onboarding workflows', 'Performance reviews', 'Slack + priority support']
const enterpriseFeatures = ['Everything in Team', 'SSO + SCIM provisioning', 'Audit logs + role policies', 'Dedicated success manager', '99.99% SLA']
</script>

<template>
  <section class="bg-background">
    <div
      class="mx-auto max-w-6xl px-6"
      :class="page ? 'py-4' : 'py-24'"
    >
      <div class="mb-10 text-center">
        <p
          v-if="!page"
          class="text-muted-foreground text-xs font-medium tracking-wider uppercase"
        >
          Pricing
        </p>
        <component
          :is="page ? 'h1' : 'h2'"
          class="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl"
        >
          Plans for teams of every size
        </component>
        <p class="text-muted-foreground mx-auto mt-3 max-w-xl text-lg">
          No hidden fees. Cancel anytime. Save 20% with annual billing.
        </p>

        <div class="mt-6 inline-flex">
          <ToggleGroup
            type="single"
            :model-value="cycle"
            @update:model-value="(v) => v && (cycle = v as Cycle)"
          >
            <ToggleGroupItem value="monthly">
              Monthly
            </ToggleGroupItem>
            <ToggleGroupItem value="yearly">
              Yearly
              <Badge
                variant="secondary"
                class="ml-2"
              >
                −20%
              </Badge>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle class="text-xl">
              Starter
            </CardTitle>
            <CardDescription>For small teams trying things out.</CardDescription>
            <div class="mt-4 flex items-baseline gap-1">
              <span class="text-4xl font-semibold tracking-tight tabular-nums">${{ cycle === 'monthly' ? 9 : 7 }}</span>
              <span class="text-muted-foreground text-sm">/ user / month</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul class="space-y-3 text-sm">
              <li
                v-for="feature in starterFeatures"
                :key="feature"
                class="flex items-start gap-2"
              >
                <Check class="text-success mt-0.5 size-4 shrink-0" />
                <span>{{ feature }}</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              v-if="onSubscribe"
              class="w-full"
              variant="outline"
              @click="onSubscribe('pro', cycle)"
            >
              Start free
            </Button>
            <Button
              v-else
              as-child
              class="w-full"
              variant="outline"
            >
              <NuxtLink to="/sign-up">Start free</NuxtLink>
            </Button>
          </CardFooter>
        </Card>

        <div class="relative">
          <Badge class="absolute -top-3 left-1/2 z-10 -translate-x-1/2 gap-1 shadow-sm">
            <Sparkles class="size-3" /> Most popular
          </Badge>
          <!-- WHY: flat system -- shadow-sm only. The highlighted
               plan keeps its ring; elevation doesn't carry the emphasis. -->
          <Card class="border-primary ring-primary/10 shadow-sm ring-1">
            <CardHeader>
              <CardTitle class="text-xl">
                Team
              </CardTitle>
              <CardDescription>For growing companies scaling people ops.</CardDescription>
              <div class="mt-4 flex items-baseline gap-1">
                <span class="text-4xl font-semibold tracking-tight tabular-nums">${{ cycle === 'monthly' ? 29 : 24 }}</span>
                <span class="text-muted-foreground text-sm">/ user / month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul class="space-y-3 text-sm">
                <li
                  v-for="feature in teamFeatures"
                  :key="feature"
                  class="flex items-start gap-2"
                >
                  <Check class="text-success mt-0.5 size-4 shrink-0" />
                  <span>{{ feature }}</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                v-if="onSubscribe"
                class="w-full"
                @click="onSubscribe('team', cycle)"
              >
                Start 14-day trial
              </Button>
              <Button
                v-else
                as-child
                class="w-full"
              >
                <NuxtLink to="/sign-up">Start 14-day trial</NuxtLink>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle class="text-xl">
              Enterprise
            </CardTitle>
            <CardDescription>Custom controls for regulated industries.</CardDescription>
            <div class="mt-4 flex items-baseline gap-1">
              <span class="text-3xl font-semibold tracking-tight">Custom</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul class="space-y-3 text-sm">
              <li
                v-for="feature in enterpriseFeatures"
                :key="feature"
                class="flex items-start gap-2"
              >
                <Check class="text-success mt-0.5 size-4 shrink-0" />
                <span>{{ feature }}</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              v-if="onContactSales"
              class="w-full"
              variant="outline"
              @click="onContactSales()"
            >
              Talk to sales
            </Button>
            <Button
              v-else
              as-child
              class="w-full"
              variant="outline"
            >
              <NuxtLink to="/login">Talk to sales</NuxtLink>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  </section>
</template>
