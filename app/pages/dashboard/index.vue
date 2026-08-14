<script setup lang="ts">
import { ref } from 'vue'
import type { Range } from '@/composables/useDashboardData'
import {
  Users, DollarSign, Zap, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  ArrowRight, Sparkles,
} from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LineChart } from '@/components/ui/charts/line-chart'
import { BarChart } from '@/components/ui/charts/bar-chart'
import { AreaChart } from '@/components/ui/charts/area-chart'
import { FunnelChart } from '@/components/ui/charts/funnel-chart'
import { GaugeChart } from '@/components/ui/charts/gauge-chart'
import { TreemapChart } from '@/components/ui/charts/treemap-chart'
import { CalendarHeatmap } from '@/components/ui/charts/calendar-heatmap'
import { Sparkline } from '@/components/ui/charts/sparkline'
import { SectionCard } from '@/components/ui/section-card'
import { DataList, DataListItem } from '@/components/ui/data-list'
import { IconBox } from '@/components/ui/icon-box'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Dashboard' })

const range = ref<Range>('30d')

const {
  revenueSeries, requestsBlock, funnel, funnelOption, segments,
  segmentsVisibleCount, totalHeadcount, totalTeams, calendarData, calendarRange,
  topProducts, alerts, topCustomers, miniChrome, activities, totalMrr,
  totalDeploys, statusTone, formatK, kpi, rangeLabel,
} = useDashboardData(range)
</script>

<template>
  <div class="space-y-6">
    <!-- Header row: title + range tabs + CTA -->
    <header class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div class="space-y-1">
        <h1 class="text-2xl font-bold tracking-tight">
          Dashboard
        </h1>
        <p class="text-muted-foreground text-sm">
          Real-time overview of revenue, traffic, and operations.
        </p>
      </div>
      <div class="flex items-center gap-2">
        <Tabs v-model="range">
          <TabsList class="h-9">
            <TabsTrigger
              value="24h"
              class="text-xs px-2.5"
            >
              24h
            </TabsTrigger>
            <TabsTrigger
              value="7d"
              class="text-xs px-2.5"
            >
              7d
            </TabsTrigger>
            <TabsTrigger
              value="30d"
              class="text-xs px-2.5"
            >
              30d
            </TabsTrigger>
            <TabsTrigger
              value="qtd"
              class="text-xs px-2.5"
            >
              QTD
            </TabsTrigger>
            <TabsTrigger
              value="ytd"
              class="text-xs px-2.5"
            >
              YTD
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Button
          size="sm"
          class="gap-1.5 h-9"
        >
          <Sparkles class="size-4" />Insights
        </Button>
      </div>
    </header>

    <!-- KPI strip: 6 tiles, each with a different mini-chart shape so
         the row reads as variety instead of "six identical sparklines". -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <DashboardKpiTile
        label="MRR"
        :value="`$${formatK(totalMrr)}`"
        :delta="kpi.mrr.delta"
        :icon="TrendingUp"
      >
        <Sparkline
          :data="kpi.spark.revenue"
          :height="36"
          class="mt-2"
        />
      </DashboardKpiTile>

      <DashboardKpiTile
        label="Active users"
        value="12,847"
        :delta="kpi.users.delta"
        :icon="Users"
      >
        <BarChart
          :data="kpi.spark.users.map((v, i) => ({ x: i, y: v }))"
          :height="36"
          :option="miniChrome"
          class="mt-2"
        />
      </DashboardKpiTile>

      <DashboardKpiTile
        label="Requests / min"
        value="2,484"
        :delta="kpi.rpm.delta"
        :icon="Zap"
      >
        <AreaChart
          :data="kpi.spark.requests.map((v, i) => ({ x: i, y: v }))"
          :height="36"
          :option="miniChrome"
          class="mt-2"
        />
      </DashboardKpiTile>

      <DashboardKpiTile
        label="Conversion"
        value="7.4%"
        :delta="kpi.conversion.delta"
        :icon="TrendingUp"
      >
        <BarChart
          :data="kpi.spark.conversion.map((v, i) => ({ x: i, y: v }))"
          :height="36"
          :option="miniChrome"
          class="mt-2"
        />
      </DashboardKpiTile>

      <!-- Avg latency: rising is bad, so delta tone is negative. -->
      <DashboardKpiTile
        label="Avg latency"
        value="412ms"
        :delta="kpi.latency.delta"
        delta-tone="negative"
        :icon="Zap"
      >
        <AreaChart
          :data="kpi.spark.latency.map((v, i) => ({ x: i, y: v }))"
          :height="36"
          :option="miniChrome"
          class="mt-2"
        />
      </DashboardKpiTile>

      <!-- Churn: down is good, so delta stays positive even though it's
           a negative number. -->
      <DashboardKpiTile
        label="Churn"
        value="1.8%"
        :delta="kpi.churn.delta"
        :icon="TrendingDown"
      >
        <div class="space-y-1.5 pt-2">
          <Progress
            :model-value="98.2"
            class="h-1.5"
          />
          <div class="flex justify-between text-xs text-muted-foreground tabular-nums">
            <span>Retained 98.2%</span>
            <span>Target 99%</span>
          </div>
        </div>
      </DashboardKpiTile>
    </div>

    <!-- Charts row 1: revenue line (wide) + funnel + gauge -->
    <div class="grid gap-4 lg:grid-cols-6">
      <Card class="lg:col-span-2">
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-3">
          <div>
            <CardTitle class="text-base font-semibold">
              Revenue vs expenses
            </CardTitle>
            <CardDescription>
              {{ rangeLabel }} · in USD
            </CardDescription>
          </div>
          <Badge
            variant="outline"
          >
            MRR {{ kpi.mrr.delta }}
          </Badge>
        </CardHeader>
        <CardContent class="pb-3">
          <LineChart
            :data="revenueSeries"
            x-field="x"
            :y-field="['revenue', 'expenses']"
            :height="300"
          />
        </CardContent>
      </Card>
      <Card class="lg:col-span-2">
        <CardHeader class="pb-3">
          <CardTitle class="text-base font-semibold">
            Conversion funnel
          </CardTitle>
          <CardDescription>
            {{ rangeLabel }} · 1.8% end-to-end
          </CardDescription>
        </CardHeader>
        <CardContent class="pb-3">
          <FunnelChart
            :data="funnel"
            :height="300"
            :option="funnelOption"
          />
        </CardContent>
      </Card>
      <Card class="lg:col-span-2">
        <CardHeader class="pb-3">
          <CardTitle class="text-base font-semibold">
            Quota
          </CardTitle>
          <CardDescription>
            API · monthly
          </CardDescription>
        </CardHeader>
        <CardContent class="pb-2">
          <GaugeChart
            :value="68"
            unit="%"
            :height="300"
          />
        </CardContent>
      </Card>
    </div>

    <!-- Charts row 2: bar chart + treemap + alerts list -->
    <div class="grid gap-4 lg:grid-cols-6">
      <Card class="lg:col-span-2">
        <CardHeader class="pb-3">
          <CardTitle class="text-base font-semibold">
            {{ requestsBlock.title }}
          </CardTitle>
          <CardDescription>
            {{ requestsBlock.subtitle }}
          </CardDescription>
        </CardHeader>
        <CardContent class="pb-3">
          <BarChart
            :data="requestsBlock.data"
            x-field="x"
            y-field="y"
            :height="200"
          />
        </CardContent>
      </Card>
      <Card class="lg:col-span-2">
        <CardHeader class="pb-3">
          <CardTitle class="text-base font-semibold">
            Headcount by team
          </CardTitle>
          <CardDescription>
            {{ totalHeadcount }} people across {{ totalTeams }} teams
          </CardDescription>
        </CardHeader>
        <CardContent class="pb-3">
          <TreemapChart
            :data="segments"
            :height="200"
          />
        </CardContent>
      </Card>
      <Card class="lg:col-span-2">
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-3">
          <div>
            <CardTitle class="text-base font-semibold">
              Active alerts
            </CardTitle>
            <CardDescription>
              3 open · 12 resolved today
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            class="text-xs gap-1 h-8"
          >
            All<ArrowRight class="size-3.5" />
          </Button>
        </CardHeader>
        <CardContent class="space-y-3 pb-3">
          <div
            v-for="(a, i) in alerts"
            :key="i"
            class="flex items-start gap-3 border-l-2 border-muted pl-3"
          >
            <component
              :is="a.icon"
              :class="['mt-0.5 size-4 shrink-0', a.tone]"
            />
            <div class="min-w-0 flex-1 space-y-0.5">
              <p class="truncate text-sm font-medium">
                {{ a.title }}
              </p>
              <p class="text-muted-foreground line-clamp-1 text-xs">
                {{ a.detail }}
              </p>
              <p class="text-muted-foreground/70 text-xs">
                {{ a.age }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Calendar heatmap (full width, dense) -->
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle class="text-base font-semibold">
            Deploy activity · last 365 days
          </CardTitle>
          <CardDescription>
            {{ totalDeploys.toLocaleString() }} deploys · longest streak 18 days
          </CardDescription>
        </div>
        <div class="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Less</span>
          <div class="flex gap-0.5">
            <span class="size-2.5 rounded-sm bg-muted" />
            <span class="size-2.5 rounded-sm bg-amber-200" />
            <span class="size-2.5 rounded-sm bg-amber-400" />
            <span class="size-2.5 rounded-sm bg-amber-600" />
            <span class="size-2.5 rounded-sm bg-amber-800" />
          </div>
          <span>More</span>
        </div>
      </CardHeader>
      <CardContent class="pb-3">
        <CalendarHeatmap
          :data="calendarData"
          :range="calendarRange"
          :height="160"
        />
      </CardContent>
    </Card>

    <!-- Bottom row: top products + customer list + recent activity -->
    <div class="grid gap-4 lg:grid-cols-6">
      <Card class="lg:col-span-2">
        <CardHeader class="pb-3">
          <CardTitle class="text-base font-semibold">
            Top products by MRR
          </CardTitle>
          <CardDescription>
            5 products · ${{ formatK(totalMrr) }} total
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-3 pb-3">
          <div
            v-for="p in topProducts"
            :key="p.name"
            class="space-y-1"
          >
            <div class="flex items-baseline justify-between gap-3">
              <span class="truncate text-sm font-medium">{{ p.name }}</span>
              <div class="flex items-baseline gap-1.5">
                <span class="text-sm font-semibold tabular-nums">${{ formatK(p.mrr) }}</span>
                <span :class="['text-xs font-medium', p.up ? 'text-emerald-600' : 'text-rose-600']">
                  <component
                    :is="p.up ? ArrowUpRight : ArrowDownRight"
                    class="inline size-3"
                  />{{ p.change }}
                </span>
              </div>
            </div>
            <Progress
              :model-value="(p.mrr / totalMrr) * 100"
              class="h-1.5"
            />
          </div>
        </CardContent>
      </Card>

      <Card class="lg:col-span-2">
        <CardHeader class="pb-3">
          <CardTitle class="text-base font-semibold">
            Top customers
          </CardTitle>
          <CardDescription>
            By MRR · 6 of 142 accounts
          </CardDescription>
        </CardHeader>
        <CardContent class="divide-y pb-1">
          <div
            v-for="c in topCustomers"
            :key="c.name"
            class="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
          >
            <Avatar class="size-8">
              <AvatarFallback class="bg-primary/10 text-primary text-xs font-semibold">
                {{ c.avatar }}
              </AvatarFallback>
            </Avatar>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium">
                {{ c.name }}
              </p>
              <p class="text-muted-foreground text-xs">
                {{ c.plan }} · <span :class="['inline-block size-1.5 rounded-full', statusTone[c.status]]" /> {{ c.status }}
              </p>
            </div>
            <span class="text-sm font-semibold tabular-nums whitespace-nowrap">${{ formatK(c.mrr) }}</span>
          </div>
        </CardContent>
      </Card>

      <SectionCard
        title="Recent activity"
        description="Live feed across products"
        class="lg:col-span-2"
      >
        <DataList>
          <DataListItem
            v-for="(item, i) in activities"
            :key="i"
          >
            <div class="flex items-center gap-3">
              <IconBox
                :icon="item.icon"
                variant="muted"
                :icon-class="item.iconClass"
              />
              <div>
                <p class="text-sm font-medium">
                  {{ item.title }}
                </p>
                <p class="text-muted-foreground text-xs">
                  {{ item.detail }}
                </p>
              </div>
            </div>
            <span class="text-muted-foreground ml-3 text-xs whitespace-nowrap">{{ item.age }}</span>
          </DataListItem>
        </DataList>
      </SectionCard>
    </div>
  </div>
</template>
