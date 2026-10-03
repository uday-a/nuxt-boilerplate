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
defineProps<{ page?: boolean }>()

const cycle = ref<Cycle>('monthly')

// Plan keys match `Plan` in server/utils/polar.ts so the parent page
// can pass them straight to /api/billing/checkout.
const emit = defineEmits<{
  subscribe: [plan: Plan, cycle: Cycle]
  contactSales: []
}>()

const starterFeatures = ['Up to 5 seats', '3 projects', '10,000 API calls / month', 'Email support']
const teamFeatures = ['Up to 50 seats', 'Unlimited projects', '250,000 API calls / month', 'Integrations and webhooks', 'Priority support']
const enterpriseFeatures = ['Everything in Team', 'SSO and SCIM provisioning', 'Audit logs and role policies', 'Custom API limits', 'Success manager and 99.99% SLA']
</script>

<template>
  <section class="bg-background">
    <div
      class="mx-auto max-w-6xl px-4"
      :class="page ? 'py-4' : 'py-4'"
    >
      <div class="mb-4 text-center">
        <p
          v-if="!page"
          class="text-muted-foreground text-xs font-medium uppercase tracking-wider"
        >
          Pricing
        </p>
        <component
          :is="page ? 'h1' : 'h2'"
          class="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl"
        >
          Plans for teams of every size
        </component>
        <p class="mx-auto mt-3 max-w-xl text-lg text-muted-foreground">
          No hidden fees. Cancel anytime. Save 20% with annual billing.
        </p>

        <div class="mt-4 inline-flex">
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
              <Badge variant="secondary">
                −20%
              </Badge>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <div class="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle class="text-base">
              Starter
            </CardTitle>
            <CardDescription>For small teams trying things out.</CardDescription>
            <div class="mt-4 flex items-baseline gap-1">
              <span class="text-4xl font-semibold tracking-tight tabular-nums">
                ${{ cycle === 'monthly' ? 9 : 7 }}
              </span>
              <span class="text-sm text-muted-foreground">/ user / month</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul class="space-y-3 text-sm">
              <li
                v-for="feature in starterFeatures"
                :key="feature"
                class="flex items-start gap-2"
              >
                <Check
                  class="text-success mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
                <span>{{ feature }}</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              class="w-full"
              variant="outline"
              @click="emit('subscribe', 'pro', cycle)"
            >
              Start free
            </Button>
          </CardFooter>
        </Card>

        <div class="relative">
          <Badge class="absolute -top-3 left-1/2 z-10 -translate-x-1/2 gap-1 shadow-sm">
            <Sparkles
              class="size-3"
              aria-hidden="true"
            />
            Most popular
          </Badge>
          <!-- WHY (Rule7): flat system -- shadow-sm only. The highlighted
               plan keeps its ring; elevation doesn't carry the emphasis. -->
          <Card class="border-primary shadow-sm ring-1 ring-primary/10">
            <CardHeader>
              <CardTitle class="text-base">
                Team
              </CardTitle>
              <CardDescription>For growing teams shipping every week.</CardDescription>
              <div class="mt-4 flex items-baseline gap-1">
                <span class="text-4xl font-semibold tracking-tight tabular-nums">
                  ${{ cycle === 'monthly' ? 29 : 24 }}
                </span>
                <span class="text-sm text-muted-foreground">/ user / month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul class="space-y-3 text-sm">
                <li
                  v-for="feature in teamFeatures"
                  :key="feature"
                  class="flex items-start gap-2"
                >
                  <Check
                    class="text-success mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{{ feature }}</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                class="w-full"
                @click="emit('subscribe', 'team', cycle)"
              >
                Start 14-day trial
              </Button>
            </CardFooter>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle class="text-base">
              Enterprise
            </CardTitle>
            <CardDescription>Security and controls for large organisations.</CardDescription>
            <div class="mt-4 flex items-baseline gap-1">
              <span class="text-4xl font-semibold tracking-tight">Custom</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul class="space-y-3 text-sm">
              <li
                v-for="feature in enterpriseFeatures"
                :key="feature"
                class="flex items-start gap-2"
              >
                <Check
                  class="text-success mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
                <span>{{ feature }}</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              class="w-full"
              variant="outline"
              @click="emit('contactSales')"
            >
              Talk to sales
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  </section>
</template>
