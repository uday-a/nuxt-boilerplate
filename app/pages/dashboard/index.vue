<script setup lang="ts">
import { UserPlus, CreditCard, GitBranch, AlertTriangle, CheckCircle2 } from 'lucide-vue-next'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Dashboard' })

const activity = [
  { id: 1, action: 'Olive Park accepted invite', detail: 'Joined Acme Inc as Member', time: '2m ago', icon: UserPlus, iconClass: 'text-emerald-500' },
  { id: 2, action: 'Northwind paid INV-2031', detail: '$2,400 USD via Visa ending 4242', time: '47m ago', icon: CreditCard, iconClass: 'text-primary' },
  { id: 3, action: 'Deploy succeeded on main', detail: 'commit 4e8a91c — Dashboard reset', time: '1h ago', icon: GitBranch, iconClass: 'text-blue-500' },
  { id: 4, action: 'Background workers degraded', detail: 'p95 latency 412ms over last 8m', time: '3h ago', icon: AlertTriangle, iconClass: 'text-amber-500' },
  { id: 5, action: 'Daily report sent to ops@acme.com', detail: '37 tasks closed, 12 opened', time: 'Yesterday', icon: CheckCircle2, iconClass: 'text-muted-foreground' },
]
</script>

<template>
  <div class="flex flex-col gap-6">
    <header class="flex items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p class="text-muted-foreground text-sm">Overview composed entirely from UIPKGE registry blocks.</p>
      </div>
    </header>

    <DashboardKpis />
    <ActivityFeed :items="activity" />
  </div>
</template>
