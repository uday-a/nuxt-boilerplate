<script setup lang="ts">
import { ref } from 'vue'
import { Check, Sparkles } from 'lucide-vue-next'
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

const cycle = ref<Cycle>('monthly')

// Plan keys match `Plan` in server/utils/polar.ts so the parent page
// can pass them straight to /api/billing/checkout.
const emit = defineEmits<{
  subscribe: [plan: Plan, cycle: Cycle]
  contactSales: []
}>()
</script>

<template>
  <section class="bg-background">
    <div class="mx-auto max-w-6xl px-6 py-24">
      <div class="mb-10 text-center">
        <p class="text-sm font-medium uppercase tracking-widest text-primary">
          Pricing
        </p>
        <h2 class="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Plans for teams of every size
        </h2>
        <p class="mx-auto mt-3 max-w-xl text-lg text-muted-foreground">
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
              <span class="text-4xl font-semibold tracking-tight">
                ${{ cycle === 'monthly' ? 9 : 7 }}
              </span>
              <span class="text-sm text-muted-foreground">/ user / month</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul class="space-y-3 text-sm">
              <li class="flex items-start gap-2">
                <Check class="mt-0.5 size-4 shrink-0 text-[var(--success)]" />
                <span>Up to 10 employees</span>
              </li>
              <li class="flex items-start gap-2">
                <Check class="mt-0.5 size-4 shrink-0 text-[var(--success)]" />
                <span>Core HR + directory</span>
              </li>
              <li class="flex items-start gap-2">
                <Check class="mt-0.5 size-4 shrink-0 text-[var(--success)]" />
                <span>Time off + holidays</span>
              </li>
              <li class="flex items-start gap-2">
                <Check class="mt-0.5 size-4 shrink-0 text-[var(--success)]" />
                <span>Email support</span>
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
            <Sparkles class="size-3" /> Most popular
          </Badge>
          <Card class="border-primary shadow-lg ring-1 ring-primary/10">
            <CardHeader>
              <CardTitle class="text-xl">
                Team
              </CardTitle>
              <CardDescription>For growing companies scaling people ops.</CardDescription>
              <div class="mt-4 flex items-baseline gap-1">
                <span class="text-4xl font-semibold tracking-tight">
                  ${{ cycle === 'monthly' ? 29 : 24 }}
                </span>
                <span class="text-sm text-muted-foreground">/ user / month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul class="space-y-3 text-sm">
                <li class="flex items-start gap-2">
                  <Check class="mt-0.5 size-4 shrink-0 text-[var(--success)]" />
                  <span>Unlimited employees</span>
                </li>
                <li class="flex items-start gap-2">
                  <Check class="mt-0.5 size-4 shrink-0 text-[var(--success)]" />
                  <span>Payroll + tax filing</span>
                </li>
                <li class="flex items-start gap-2">
                  <Check class="mt-0.5 size-4 shrink-0 text-[var(--success)]" />
                  <span>Onboarding workflows</span>
                </li>
                <li class="flex items-start gap-2">
                  <Check class="mt-0.5 size-4 shrink-0 text-[var(--success)]" />
                  <span>Performance reviews</span>
                </li>
                <li class="flex items-start gap-2">
                  <Check class="mt-0.5 size-4 shrink-0 text-[var(--success)]" />
                  <span>Slack + priority support</span>
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
              <li class="flex items-start gap-2">
                <Check class="mt-0.5 size-4 shrink-0 text-[var(--success)]" />
                <span>Everything in Team</span>
              </li>
              <li class="flex items-start gap-2">
                <Check class="mt-0.5 size-4 shrink-0 text-[var(--success)]" />
                <span>SSO + SCIM provisioning</span>
              </li>
              <li class="flex items-start gap-2">
                <Check class="mt-0.5 size-4 shrink-0 text-[var(--success)]" />
                <span>Audit logs + role policies</span>
              </li>
              <li class="flex items-start gap-2">
                <Check class="mt-0.5 size-4 shrink-0 text-[var(--success)]" />
                <span>Dedicated success manager</span>
              </li>
              <li class="flex items-start gap-2">
                <Check class="mt-0.5 size-4 shrink-0 text-[var(--success)]" />
                <span>99.99% SLA</span>
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
