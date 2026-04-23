<script setup lang="ts">
import { CheckCircle2, Download, CreditCard, ExternalLink } from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Billing · Settings' })

const plan = {
  name: 'Pro',
  price: 49,
  seats: 8,
  seatPrice: 12,
  cycle: 'monthly',
  renews: '2026-06-01',
}

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
      <h1 class="text-2xl font-semibold tracking-tight">Billing</h1>
      <p class="text-muted-foreground text-sm">Plan, usage, payment method, and invoice history.</p>
    </header>

    <div class="grid gap-4 lg:grid-cols-[2fr_1fr]">
      <Card>
        <CardHeader>
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-1">
              <CardDescription class="text-xs uppercase tracking-wider">Current plan</CardDescription>
              <CardTitle class="text-2xl">{{ plan.name }}</CardTitle>
            </div>
            <Badge variant="secondary" class="text-[10px]">Renews {{ plan.renews }}</Badge>
          </div>
        </CardHeader>
        <CardContent class="space-y-3">
          <div class="flex items-baseline gap-1">
            <span class="text-3xl font-semibold tabular-nums">${{ plan.price + plan.seats * plan.seatPrice }}</span>
            <span class="text-muted-foreground text-sm">/ {{ plan.cycle }}</span>
          </div>
          <p class="text-muted-foreground text-xs">
            Base ${{ plan.price }} + {{ plan.seats }} seats × ${{ plan.seatPrice }}/seat. Billed in advance, prorated on seat changes.
          </p>
          <div class="flex flex-wrap gap-2 pt-2">
            <Button>Upgrade to Enterprise</Button>
            <Button variant="outline">Change plan</Button>
            <Button variant="ghost" class="text-muted-foreground">Cancel subscription</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="text-base">Payment method</CardTitle>
        </CardHeader>
        <CardContent class="space-y-3">
          <div class="bg-muted/40 flex items-center gap-3 rounded-lg border p-3">
            <CreditCard class="text-muted-foreground size-5" />
            <div class="flex-1">
              <p class="text-sm font-medium">Visa ending in 4242</p>
              <p class="text-muted-foreground text-xs">Expires 09 / 28</p>
            </div>
          </div>
          <Button variant="outline" size="sm" class="w-full">Update card</Button>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">Usage this cycle</CardTitle>
        <CardDescription>Resets {{ plan.renews }}. Anything over the cap is billed at the overage rate (see plan details).</CardDescription>
      </CardHeader>
      <CardContent class="space-y-5">
        <div v-for="u in usageThisCycle" :key="u.label" class="space-y-2">
          <div class="flex items-baseline justify-between">
            <span class="text-sm font-medium">{{ u.label }}</span>
            <span class="text-muted-foreground text-xs tabular-nums">{{ fmt(u.used, u.unit) }} / {{ fmt(u.limit, u.unit) }}</span>
          </div>
          <div class="bg-muted h-2 overflow-hidden rounded-full">
            <div class="bg-primary h-full rounded-full transition-all" :style="{ width: pct(u.used, u.limit) + '%' }" />
          </div>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">Invoices</CardTitle>
        <CardDescription>PDF downloads stay available for 7 years.</CardDescription>
      </CardHeader>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Issued</TableHead>
            <TableHead>Period</TableHead>
            <TableHead class="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead class="text-right">PDF</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="inv in invoices" :key="inv.id">
            <TableCell class="font-mono text-xs">{{ inv.id }}</TableCell>
            <TableCell class="text-muted-foreground text-xs tabular-nums">{{ inv.date }}</TableCell>
            <TableCell class="text-xs">{{ inv.period }}</TableCell>
            <TableCell class="text-right tabular-nums">${{ inv.amount.toFixed(2) }}</TableCell>
            <TableCell>
              <span class="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-xs capitalize">
                <CheckCircle2 class="size-3" />
                {{ inv.status }}
              </span>
            </TableCell>
            <TableCell class="text-muted-foreground text-xs">{{ inv.method }}</TableCell>
            <TableCell class="text-right">
              <Button variant="ghost" size="icon" class="size-7"><Download class="size-3.5" /></Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>
  </div>
</template>
