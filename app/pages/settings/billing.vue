<script setup lang="ts">
import { CheckCircle2, Copy, Download, CreditCard, AlertCircle, Loader2 } from '@/lib/icon-pack'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { toast } from 'vue-sonner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Page, PageHeader, PageHeaderHeading, PageBody } from '@/components/ui/page'
import { SAMPLE_INVOICES, SAMPLE_PLAN, SAMPLE_USAGE, usageText } from '@/lib/usage-mock'
import type { ApiResponse } from '~~/server/utils/response'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
const { locale, t } = useI18n()
const title = useRouteLabel()
useHead({ title })

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

const { data: subRes, refresh: refreshSub } = await useFetch<ApiResponse<{ subscription: SubscriptionRow | null }>>('/api/me/subscription')

const subscription = computed<SubscriptionRow | null>(() =>
  subRes.value?.ok ? subRes.value.data.subscription : null,
)
const hasActiveSub = computed(() => subscription.value && ['active', 'trialing', 'past_due'].includes(subscription.value.status))

// Derive the displayed plan from the real subscription. Without one the
// page shows the shared sample plan (lib/usage-mock) so plan, usage and
// invoices agree with each other and with Settings -> Limits.
const isSample = computed(() => !subscription.value)
const plan = computed(() => {
  if (!subscription.value) return { name: SAMPLE_PLAN.name, price: SAMPLE_PLAN.price as number | null, renews: SAMPLE_PLAN.renews as string | null }
  const label = subscription.value.plan ? subscription.value.plan[0]!.toUpperCase() + subscription.value.plan.slice(1) : 'Subscribed'
  return {
    name: label,
    price: null,
    renews: subscription.value.currentPeriodEnd,
  }
})
const renewsLabel = computed(() =>
  plan.value.renews ? new Date(plan.value.renews).toLocaleDateString(locale.value, { month: 'short', day: 'numeric', year: 'numeric' }) : null,
)

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
// side and the row may not exist yet on first read. The handle lives
// outside onMounted so onUnmounted can clear it: navigating away mid-poll
// would otherwise leak the interval (and its $fetch) until attempts run out.
let pollTimer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  if (!justCheckedOut.value) return
  let attempts = 0
  pollTimer = setInterval(async () => {
    attempts++
    await refreshSub()
    if (hasActiveSub.value || attempts >= 6) {
      if (pollTimer) clearInterval(pollTimer)
      pollTimer = null
    }
  }, 1500)
})
onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
  pollTimer = null
})

const usageThisCycle = SAMPLE_USAGE.filter(u => u.billable)
const invoices = SAMPLE_INVOICES

// WHY (Rule67): the invoice id carries a copy button (clipboard with a
// textarea fallback for non-secure contexts) so ids leave the page intact.
async function copyInvoiceId(id: string) {
  try {
    await navigator.clipboard.writeText(id)
  }
  catch {
    const ta = document.createElement('textarea')
    ta.value = id
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    ta.remove()
  }
  toast.success(t('dashboard.billing.copied'))
}
</script>

<template>
  <Page>
    <PageHeader>
      <PageHeaderHeading
        :title="title"
        description="Plan, usage, payment method, and invoice history."
      />
    </PageHeader>

    <PageBody class="space-y-4">
      <DemoDataBanner
        v-if="isSample"
        message="Sample billing data. Your plan and invoices appear here once you subscribe."
      />

      <div class="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardDescription class="text-xs font-medium tracking-wider uppercase">
              Current plan
            </CardDescription>
            <CardTitle class="text-base">
              {{ plan.name }}
            </CardTitle>
            <CardAction>
              <Badge variant="secondary">
                {{ renewsLabel ? `Renews ${renewsLabel}` : 'No renewal date' }}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent class="space-y-4">
            <div
              v-if="justCheckedOut && !hasActiveSub"
              class="border-primary/30 bg-primary/5 flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
            >
              <Loader2
                class="text-primary size-4 animate-spin"
                aria-hidden="true"
              />
              Finalising your subscription…
            </div>
            <p
              v-else-if="subscription"
              class="text-sm capitalize"
            >
              {{ subscription.status }}
            </p>
            <p
              v-else-if="plan.price !== null"
              class="text-sm"
            >
              <span class="text-2xl font-semibold tracking-tight tabular-nums">${{ plan.price }}</span>
              <span class="text-muted-foreground"> / {{ SAMPLE_PLAN.cycle }}</span>
            </p>
            <div class="flex flex-wrap gap-2">
              <Button
                v-if="hasActiveSub"
                :disabled="portalState === 'opening'"
                @click="openPortal"
              >
                <Loader2
                  v-if="portalState === 'opening'"
                  class="size-4 animate-spin"
                  aria-hidden="true"
                />
                <CreditCard
                  v-else
                  class="size-4"
                  aria-hidden="true"
                />
                Manage subscription
              </Button>
              <Button
                v-else
                as-child
              >
                <NuxtLink to="/pricing">
                  Change plan
                </NuxtLink>
              </Button>
            </div>
            <div
              v-if="portalError"
              class="text-destructive flex items-center gap-2 text-sm"
            >
              <AlertCircle
                class="size-4"
                aria-hidden="true"
              />
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
          <CardContent class="space-y-4">
            <div class="flex items-center gap-4">
              <CreditCard
                class="text-muted-foreground size-5"
                aria-hidden="true"
              />
              <div class="flex-1">
                <p class="text-sm font-medium">
                  Visa ending in 4242
                </p>
                <p class="text-muted-foreground text-xs tabular-nums">
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
          <CardDescription>
            {{ renewsLabel ? `Resets ${renewsLabel}.` : 'Resets at the start of each billing cycle.' }}
            Anything over the cap is billed at the overage rate.
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <UsageBar
            v-for="u in usageThisCycle"
            :key="u.id"
            :label="u.label"
            :used="u.used"
            :limit="u.limit"
            :value-text="usageText(u)"
            :scope="u.period === 'cycle' ? 'this cycle' : 'workspace total'"
          />
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
                {{ t('dashboard.billing.amount') }}
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
                <span class="inline-flex items-center gap-1.5">
                  {{ inv.id }}
                  <button
                    type="button"
                    class="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex items-center rounded p-0.5 focus-visible:ring-2 focus-visible:outline-none"
                    :aria-label="t('dashboard.billing.copyAria', { id: inv.id })"
                    :title="t('dashboard.billing.copyAria', { id: inv.id })"
                    @click="copyInvoiceId(inv.id)"
                  >
                    <Copy
                      class="size-3.5"
                      aria-hidden="true"
                    />
                  </button>
                </span>
              </TableCell>
              <TableCell class="text-muted-foreground text-xs tabular-nums">
                {{ inv.date }}
              </TableCell>
              <TableCell>
                {{ inv.period }}
              </TableCell>
              <TableCell class="text-right text-sm tabular-nums">
                ${{ inv.amount.toFixed(2) }}
              </TableCell>
              <TableCell>
                <span class="text-success flex items-center gap-1.5 text-xs capitalize">
                  <CheckCircle2
                    class="size-3.5"
                    aria-hidden="true"
                  />
                  {{ inv.status }}
                </span>
              </TableCell>
              <TableCell class="text-muted-foreground text-xs">
                {{ inv.method }}
              </TableCell>
              <TableCell class="text-right">
                <!-- WHY (Rule76/87): the download trigger is 32px with both
                     an accessible name and a tooltip. -->
                <TooltipProvider :delay-duration="300">
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <Button
                        variant="ghost"
                        size="icon"
                        class="size-8"
                        :aria-label="t('dashboard.billing.downloadAria', { id: inv.id })"
                      >
                        <Download
                          class="size-4"
                          aria-hidden="true"
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{{ t('dashboard.billing.downloadAria', { id: inv.id }) }}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </PageBody>
  </Page>
</template>
