<script setup lang="ts">
import { Hash, Plane, Hotel, Receipt, MapPin, Calendar, DollarSign } from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Travel · Projects' })

const kpis = [
  { label: 'Upcoming trips', value: '7', icon: Plane, tone: 'text-blue-600' },
  { label: 'Travelers active', value: '12', icon: MapPin, tone: 'text-emerald-600' },
  { label: 'YTD spend', value: '$48.2k', icon: DollarSign, tone: 'text-violet-600' },
  { label: 'Unsubmitted reports', value: '4', icon: Receipt, tone: 'text-amber-600' },
]

const trips = [
  { traveler: 'Marcus Rivera', dest: 'Berlin', purpose: 'Customer onsite — Sentinel Labs', depart: '2026-05-20', return: '2026-05-23', status: 'confirmed', cost: 2840 },
  { traveler: 'Alice Chen', dest: 'San Francisco', purpose: 'Vue Conf 2026', depart: '2026-05-28', return: '2026-06-01', status: 'confirmed', cost: 3120 },
  { traveler: 'Sarah Connor', dest: 'London', purpose: 'Board meeting Q2', depart: '2026-06-03', return: '2026-06-05', status: 'confirmed', cost: 4210 },
  { traveler: 'David Kim', dest: 'Tokyo', purpose: 'Apex Logistics kickoff', depart: '2026-06-10', return: '2026-06-15', status: 'pending', cost: 5680 },
  { traveler: 'Eva Johnson', dest: 'Toronto', purpose: 'Workshop — Acme Education', depart: '2026-06-18', return: '2026-06-20', status: 'pending', cost: 1240 },
  { traveler: 'Frank Lee', dest: 'Singapore', purpose: 'Olympus Robotics review', depart: '2026-06-22', return: '2026-06-28', status: 'confirmed', cost: 6420 },
  { traveler: 'Olive Park', dest: 'New York', purpose: 'Recruiting fair (UX)', depart: '2026-07-01', return: '2026-07-03', status: 'confirmed', cost: 1820 },
]

const expenses = [
  { trip: 'Berlin · Marcus', category: 'Flights', amount: 1240, status: 'approved' },
  { trip: 'Berlin · Marcus', category: 'Hotel', amount: 880, status: 'approved' },
  { trip: 'Berlin · Marcus', category: 'Meals', amount: 320, status: 'pending' },
  { trip: 'San Francisco · Alice', category: 'Flights', amount: 980, status: 'pending' },
  { trip: 'San Francisco · Alice', category: 'Conference fee', amount: 1200, status: 'approved' },
  { trip: 'London · Sarah', category: 'Flights', amount: 2400, status: 'approved' },
]

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  confirmed: 'default',
  pending: 'secondary',
  approved: 'default',
}
</script>

<template>
  <div class="space-y-6">
    <header class="space-y-2">
      <div class="flex items-center gap-2">
        <Hash class="text-muted-foreground size-4" />
        <h1 class="text-2xl font-semibold tracking-tight">Travel</h1>
      </div>
      <p class="text-muted-foreground text-sm">Trip booking, expense capture, and per-traveler spend.</p>
    </header>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card v-for="k in kpis" :key="k.label">
        <CardHeader class="flex flex-row items-start justify-between space-y-0 pb-2">
          <CardDescription class="text-xs uppercase tracking-wider">{{ k.label }}</CardDescription>
          <component :is="k.icon" :class="['size-4', k.tone]" />
        </CardHeader>
        <CardContent>
          <p class="text-2xl font-semibold tabular-nums">{{ k.value }}</p>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle class="text-base flex items-center gap-2"><Calendar class="size-4" /> Upcoming trips</CardTitle>
        <CardDescription>{{ trips.length }} trips on the books for the next 8 weeks.</CardDescription>
      </CardHeader>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Traveler</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>Purpose</TableHead>
            <TableHead>Dates</TableHead>
            <TableHead>Status</TableHead>
            <TableHead class="text-right">Cost</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="t in trips" :key="t.traveler + t.dest">
            <TableCell class="font-medium">{{ t.traveler }}</TableCell>
            <TableCell>{{ t.dest }}</TableCell>
            <TableCell class="text-muted-foreground line-clamp-1 max-w-[280px] text-xs">{{ t.purpose }}</TableCell>
            <TableCell class="text-muted-foreground text-xs tabular-nums">{{ t.depart }} → {{ t.return }}</TableCell>
            <TableCell><Badge :variant="statusVariant[t.status]" class="text-[10px] capitalize">{{ t.status }}</Badge></TableCell>
            <TableCell class="text-right tabular-nums">${{ t.cost.toLocaleString() }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="text-base flex items-center gap-2"><Receipt class="size-4" /> Recent expenses</CardTitle>
      </CardHeader>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Trip</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead class="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="(e, i) in expenses" :key="i">
            <TableCell class="text-sm">{{ e.trip }}</TableCell>
            <TableCell><Badge variant="outline" class="text-[10px]">{{ e.category }}</Badge></TableCell>
            <TableCell><Badge :variant="statusVariant[e.status]" class="text-[10px] capitalize">{{ e.status }}</Badge></TableCell>
            <TableCell class="text-right tabular-nums">${{ e.amount.toLocaleString() }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>
  </div>
</template>
