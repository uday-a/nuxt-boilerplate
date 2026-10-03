<script setup lang="ts">
import { AlertTriangle, ChevronRight } from '@/lib/icon-pack'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Page, PageHeader, PageHeaderHeading, PageBody } from '@/components/ui/page'
import { SAMPLE_PLAN, SAMPLE_USAGE, usagePct, usageText } from '@/lib/usage-mock'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
const title = useRouteLabel()
useHead({ title })

// Same sample meters as Settings -> Billing, so both pages agree.
const quotas = SAMPLE_USAGE
// Quotas at or over the UsageBar destructive threshold get a callout.
const critical = computed(() => quotas.filter(q => usagePct(q) >= 90))

const rateLimits = [
  { endpoint: '/v1/projects', perMinute: 600, burst: 100 },
  { endpoint: '/v1/deploys', perMinute: 300, burst: 60 },
  { endpoint: '/v1/events', perMinute: 3000, burst: 500 },
  { endpoint: '/v1/customers', perMinute: 600, burst: 100 },
  { endpoint: '/v1/batch', perMinute: 10, burst: 5 },
  { endpoint: '/v1/files/upload', perMinute: 60, burst: 20 },
]
</script>

<template>
  <Page>
    <PageHeader>
      <PageHeaderHeading
        :title="title"
        description="Quotas and rate limits for your workspace."
      />
    </PageHeader>

    <PageBody class="max-w-3xl space-y-4">
      <DemoDataBanner message="Sample usage data. Connect metering to see live quotas." />

      <Card
        v-for="q in critical"
        :key="q.id"
        class="border-destructive/30 bg-destructive/5"
      >
        <CardContent class="flex items-start gap-4 p-4">
          <AlertTriangle
            class="text-destructive mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
          <div class="flex-1 space-y-1">
            <p class="text-sm font-semibold">
              {{ q.label }} approaching limit
            </p>
            <p class="text-muted-foreground text-xs tabular-nums">
              {{ q.used.toLocaleString() }} of {{ q.limit.toLocaleString() }} used. Archive unused items or upgrade to raise the cap.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
          >
            Review
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="text-base">
            Quotas
          </CardTitle>
          <CardDescription>Cycle quotas reset on the 1st. Workspace totals don't reset.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <UsageBar
            v-for="q in quotas"
            :key="q.id"
            :label="q.label"
            :used="q.used"
            :limit="q.limit"
            :value-text="usageText(q)"
            :scope="q.period === 'cycle' ? 'this cycle' : 'workspace total'"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="text-base">
            Rate limits
          </CardTitle>
          <CardDescription>Per-API-key limits on the {{ SAMPLE_PLAN.name }} plan. Multiple keys multiply your effective ceiling.</CardDescription>
        </CardHeader>
        <CardContent class="divide-y">
          <div
            v-for="r in rateLimits"
            :key="r.endpoint"
            class="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
          >
            <p class="font-mono text-sm">
              {{ r.endpoint }}
            </p>
            <div class="text-right">
              <p class="text-sm font-medium tabular-nums">
                {{ r.perMinute.toLocaleString() }} <span class="text-muted-foreground font-normal">/ min</span>
              </p>
              <p class="text-muted-foreground text-xs tabular-nums">
                Burst {{ r.burst }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <NuxtLink
        to="/pricing"
        class="group focus-visible:ring-ring/50 block rounded-xl outline-none focus-visible:ring-[3px]"
      >
        <Card class="group-hover:bg-muted/40 transition-colors">
          <CardContent class="flex items-center justify-between gap-4 p-4">
            <div class="space-y-1">
              <p class="text-sm font-semibold">
                Need higher limits?
              </p>
              <p class="text-muted-foreground text-xs">
                Enterprise lifts all caps and adds dedicated capacity in your region.
              </p>
            </div>
            <ChevronRight
              class="text-muted-foreground size-4"
              aria-hidden="true"
            />
          </CardContent>
        </Card>
      </NuxtLink>
    </PageBody>
  </Page>
</template>
