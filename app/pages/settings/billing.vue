<script setup lang="ts">
import { CheckCircle2, Download, CreditCard, ExternalLink, AlertCircle, Loader2 } from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { ApiResponse } from '~~/server/utils/response'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Billing · Settings' })

interface SubscriptionRow {
  status: string
  productId: string
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  canceledAt: string | null
  plan: 'pro' | 'team' | 'enterprise' | null
}

const route = useRoute()
const justCheckedOut = computed(() => route.query.status === 'success')

const { data: subRes, pending: subLoading, refresh: refreshSub } = await useFetch<ApiResponse<{ subscription: SubscriptionRow | null }>>('/api/me/subscription')

const subscription = computed<SubscriptionRow | null>(() =>
  subRes.value?.ok ? subRes.value.data.subscription : null,
)
const hasActiveSub = computed(() => subscription.value && ['active', 'trialing', 'past_due'].includes(subscription.value.status))

// Derive the displayed plan label from the real subscription, falling
// back to a "Free" presentation when the user hasn't checked out yet.
const plan = computed(() => {
  if (!subscription.value) return { name: 'Free', price: 0, cycle: '—', renews: null as string | null }
  const label = subscription.value.plan ? subscription.value.plan[0]!.toUpperCase() + subscription.value.plan.slice(1) : 'Subscribed'
  return {
    name: label,
    price: 0,
    cycle: '—',
    renews: subscription.value.currentPeriodEnd,
  }
})

const portalState = ref<'idle' | 'opening' | 'error'>('idle')
const portalError = ref<string | null>(null)

async function openPortal() {
  portalState.value = 'opening'
  portalError.value = null
  const res = await $fetch<ApiResponse<{ url: string }>>('/api/billing/portal', { method: 'POST' })
    .catch((err) => {
      const data = (err as { data?: { error?: { message?: string } } }).data
      return { ok: false, error: { code: 'INTERNAL', message: data?.error?.message ?? 'Could not open portal' } } as const
    })
  if (!res.ok) {
    portalError.value = res.error.message
    portalState.value = 'error'
    return
  }
  window.location.href = res.data.url
}

// If the user just landed back from a successful checkout, poll the
// subscription endpoint a few times — the webhook fires async on Polar's
// side and the row may not exist yet on first read.
onMounted(() => {
  if (!justCheckedOut.value) return
  let attempts = 0
  const interval = setInterval(async () => {
    attempts++
    await refreshSub()
    if (hasActiveSub.value || attempts >= 6) clearInterval(interval)
  }, 1500)
})

const usageThisCycle = [
  { label: 'API calls', used: 482300, limit: 1000000, unit: '' },
  { label: 'Compute (hours)', used: 127.4, limit: 250, unit: 'h' },
  { label: 'Storage', used: 38.2, limit: 100, unit: 'GB' },
  { label: 'Team seats', used: 8, limit: 25, unit: '' },
]

const invoices = [
  { id: 'INV-2031', date: '2026-05-01', period: 'Apr 2026', amount: 148.40, status: 'paid', method: 'Visa ··4242' },
  { id: 'INV-2018', date: '2026-04-01', period: 'Mar 2026', amount: 148.40, status: 'paid', method: 'Visa ··4242' },
  { id: 'INV-1994', date: '2026-03-01', period: 'Feb 2026', amount: 145.00, status: 'paid', method: 'Visa ··4242' },
  { id: 'INV-1972', date: '2026-02-01', period: 'Jan 2026', amount: 145.00, status: 'paid', method: 'Visa ··4242' },
  { id: 'INV-1948', date: '2026-01-01', period: 'Dec 2025', amount: 145.00, status: 'paid', method: 'Visa ··4242' },
  { id: 'INV-1923', date: '2025-12-01', period: 'Nov 2025', amount: 133.00, status: 'paid', method: 'Visa ··4242' },
]

const pct = (used: number, limit: number) => Math.min(100, Math.round((used / limit) * 100))
const fmt = (n: number, unit: string) => `${n.toLocaleString()}${unit}`
</script>

<template>
  <div class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-semibold tracking-tight">
        Billing
      </h1>
      <p class="text-muted-foreground text-sm">
        Plan, usage, payment method, and invoice history.
      </p>
    </header>

    <div class="grid gap-4 lg:grid-cols-[2fr_1fr]">
      <Card>
        <CardHeader>
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-1">
              <CardDescription class="text-xs uppercase tracking-wider">
                Current plan
              </CardDescription>
              <CardTitle class="text-2xl">
                {{ plan.name }}
              </CardTitle>
            </div>
            <Badge
              v-if="plan.renews"
              variant="secondary"
              class="text-[10px]"
            >
              Renews {{ new Date(plan.renews).toLocaleDateString() }}
            </Badge>
          </div>
        </CardHeader>
        <CardContent class="space-y-3">
          <div
            v-if="justCheckedOut && !hasActiveSub"
            class="border-primary/30 bg-primary/5 flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
          >
            <Loader2 class="text-primary size-4 animate-spin" />
            Finalising your subscription… (Polar's webhook usually arrives in a second or two.)
          </div>
          <div
            v-else-if="subscription"
            class="flex items-baseline gap-1"
          >
            <span class="text-3xl font-semibold tabular-nums capitalize">{{ subscription.status }}</span>
          </div>
          <div
            v-else
            class="text-muted-foreground text-sm"
          >
            You're on the free tier. Upgrade for more seats, integrations, and priority support.
          </div>
          <div class="flex flex-wrap gap-2 pt-2">
            <template v-if="hasActiveSub">
              <Button
                :disabled="portalState === 'opening'"
                @click="openPortal"
              >
                <Loader2
                  v-if="portalState === 'opening'"
                  class="size-4 animate-spin"
                />
                <CreditCard
                  v-else
                  class="size-4"
                />
                Manage subscription
              </Button>
            </template>
            <template v-else>
              <Button as-child>
                <NuxtLink to="/pricing">
                  View plans
                </NuxtLink>
              </Button>
            </template>
          </div>
          <div
            v-if="portalError"
            class="text-destructive flex items-center gap-2 text-sm"
          >
            <AlertCircle class="size-4" />
            {{ portalError }}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="text-base">
            Payment method
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-3">
          <div class="bg-muted/40 flex items-center gap-3 rounded-lg border p-3">
            <CreditCard class="text-muted-foreground size-5" />
            <div class="flex-1">
              <p class="text-sm font-medium">
                Visa ending in 4242
              </p>
              <p class="text-muted-foreground text-xs">
                Expires 09 / 28
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            class="w-full"
          >
            Update card
          </Button>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">
          Usage this cycle
        </CardTitle>
        <CardDescription>Resets {{ plan.renews }}. Anything over the cap is billed at the overage rate (see plan details).</CardDescription>
      </CardHeader>
      <CardContent class="space-y-5">
        <div
          v-for="u in usageThisCycle"
          :key="u.label"
          class="space-y-2"
        >
          <div class="flex items-baseline justify-between">
            <span class="text-sm font-medium">{{ u.label }}</span>
            <span class="text-muted-foreground text-xs tabular-nums">{{ fmt(u.used, u.unit) }} / {{ fmt(u.limit, u.unit) }}</span>
          </div>
          <div class="bg-muted h-2 overflow-hidden rounded-full">
            <div
              class="bg-primary h-full rounded-full transition-all"
              :style="{ width: pct(u.used, u.limit) + '%' }"
            />
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">
          Invoices
        </CardTitle>
        <CardDescription>PDF downloads stay available for 7 years.</CardDescription>
      </CardHeader>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Issued</TableHead>
            <TableHead>Period</TableHead>
            <TableHead class="text-right">
              Amount
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead class="text-right">
              PDF
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
            v-for="inv in invoices"
            :key="inv.id"
          >
            <TableCell class="font-mono text-xs">
              {{ inv.id }}
            </TableCell>
            <TableCell class="text-muted-foreground text-xs tabular-nums">
              {{ inv.date }}
            </TableCell>
            <TableCell class="text-xs">
              {{ inv.period }}
            </TableCell>
            <TableCell class="text-right tabular-nums">
              ${{ inv.amount.toFixed(2) }}
            </TableCell>
            <TableCell>
              <span class="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-xs capitalize">
                <CheckCircle2 class="size-3" />
                {{ inv.status }}
              </span>
            </TableCell>
            <TableCell class="text-muted-foreground text-xs">
              {{ inv.method }}
            </TableCell>
            <TableCell class="text-right">
              <Button
                variant="ghost"
                size="icon"
                class="size-7"
              >
                <Download class="size-3.5" />
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>
  </div>
</template>
