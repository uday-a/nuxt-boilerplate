<script setup lang="ts">
import { BarChart3, Calendar, FileCheck2, ShieldCheck, Users, Wallet } from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
</script>

<template>
  <section class="bg-background">
    <div class="mx-auto max-w-6xl px-6 py-24">
      <div class="mb-12 max-w-2xl space-y-3">
        <p class="text-sm font-medium uppercase tracking-widest text-primary">
          Features
        </p>
        <h2 class="text-3xl font-semibold tracking-tight sm:text-4xl">
          Everything teams need, nothing they don't.
        </h2>
        <p class="text-lg text-muted-foreground">
          Six modules that work together out of the box. Pay only for what you use.
        </p>
      </div>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader class="space-y-3">
            <div class="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users class="size-5" />
            </div>
            <CardTitle class="text-base">
              Employee directory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-sm text-muted-foreground">
              Single source of truth for people, roles and reporting lines — searchable
              and exportable.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader class="space-y-3">
            <div class="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Wallet class="size-5" />
            </div>
            <CardTitle class="text-base">
              Payroll
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-sm text-muted-foreground">
              Multi-currency runs with automatic tax filing and direct deposit. Pause and
              resume in one click.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader class="space-y-3">
            <div class="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BarChart3 class="size-5" />
            </div>
            <CardTitle class="text-base">
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-sm text-muted-foreground">
              OKRs, 1:1s, 360 reviews and continuous feedback all linked to the org chart.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader class="space-y-3">
            <div class="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileCheck2 class="size-5" />
            </div>
            <CardTitle class="text-base">
              Onboarding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-sm text-muted-foreground">
              34 templated tasks split across pre-start, day 1, week 1, month 1 and
              90-day milestones.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader class="space-y-3">
            <div class="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Calendar class="size-5" />
            </div>
            <CardTitle class="text-base">
              Time off
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-sm text-muted-foreground">
              Accrual-based leave with manager approval workflow and shared team calendar.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader class="space-y-3">
            <div class="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck class="size-5" />
            </div>
            <CardTitle class="text-base">
              Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-sm text-muted-foreground">
              GDPR, SOC2 and HIPAA-ready audit trails. Right-to-erasure built in.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
</template>
