<script setup lang="ts">
import { ChevronDown, Star } from '@/lib/icon-pack'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

// Rendered from ai_docs/design-rules.md. Swatch classes resolve to the
// theme's CSS variables, so they follow light/dark live.
const { t } = useI18n()

const colourGroups = [
  {
    key: 'neutrals',
    swatches: [
      { token: 'background', class: 'bg-background' },
      { token: 'card', class: 'bg-card' },
      { token: 'muted', class: 'bg-muted' },
      { token: 'accent', class: 'bg-accent' },
      { token: 'border', class: 'bg-border' },
      { token: 'muted-foreground', class: 'bg-muted-foreground' },
      { token: 'foreground', class: 'bg-foreground' },
    ],
  },
  {
    key: 'primary',
    swatches: [
      { token: 'primary', class: 'bg-primary' },
      { token: 'primary-foreground', class: 'bg-primary-foreground' },
      { token: 'ring', class: 'bg-ring' },
    ],
  },
  {
    key: 'status',
    swatches: [
      { token: 'success', class: 'bg-success' },
      { token: 'warning', class: 'bg-warning' },
      { token: 'info', class: 'bg-info' },
      { token: 'destructive', class: 'bg-destructive' },
    ],
  },
  {
    key: 'chart',
    swatches: [
      { token: 'chart-1', class: 'bg-chart-1' },
      { token: 'chart-2', class: 'bg-chart-2' },
      { token: 'chart-3', class: 'bg-chart-3' },
      { token: 'chart-4', class: 'bg-chart-4' },
      { token: 'chart-5', class: 'bg-chart-5' },
    ],
  },
]

const typeRoles = [
  { key: 'h1', classes: 'text-2xl font-semibold tracking-tight', sample: 'Projects' },
  { key: 'cardTitle', classes: 'text-base font-semibold', sample: 'Monthly revenue' },
  { key: 'body', classes: 'text-sm', sample: 'Invoices are sent on the 1st.' },
  { key: 'meta', classes: 'text-xs text-muted-foreground', sample: 'Updated 2 min ago' },
  { key: 'eyebrow', classes: 'text-xs font-medium uppercase tracking-wider text-muted-foreground', sample: 'Active users' },
  { key: 'metric', classes: 'text-2xl font-semibold tracking-tight tabular-nums', sample: '$84,230' },
]

const gaps = [
  { key: 'inline', token: 'gap-1.5 / gap-2', bar: 'w-2' },
  { key: 'field', token: 'gap-2', bar: 'w-2' },
  { key: 'card', token: 'gap-4 / space-y-4', bar: 'w-4' },
  { key: 'section', token: 'gap-4 / space-y-4', bar: 'w-6' },
]

const iconSizes = [
  { key: 'xs', token: 'size-3.5', class: 'size-3.5' },
  { key: 'sm', token: 'size-4', class: 'size-4' },
  { key: 'box', token: 'size-5', class: 'size-5' },
  { key: 'empty', token: 'size-10', class: 'size-10' },
]
</script>

<template>
  <!-- Collapsed by default: search is the page's main job, foundations
       are the reference you open when you need them. -->
  <Collapsible v-slot="{ open }">
    <Card>
      <CollapsibleTrigger class="hover:bg-muted/50 focus-visible:ring-ring w-full rounded-[inherit] text-left transition-colors focus-visible:ring-2 focus-visible:outline-none">
        <CardHeader>
          <CardTitle class="text-base">
            {{ t('uiKit.foundations.title') }}
          </CardTitle>
          <CardDescription>{{ t('uiKit.foundations.description') }}</CardDescription>
          <CardAction class="self-center">
            <ChevronDown
              :class="['text-muted-foreground size-4 shrink-0 transition-transform duration-200', open && 'rotate-180']"
              aria-hidden="true"
            />
          </CardAction>
        </CardHeader>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <CardContent class="space-y-4 p-4 pt-0">
          <section class="space-y-2">
            <h3 class="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              {{ t('uiKit.foundations.colour') }}
            </h3>
            <p class="text-muted-foreground max-w-3xl text-xs">
              {{ t('uiKit.foundations.colourRule') }}
            </p>
            <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div
                v-for="group in colourGroups"
                :key="group.key"
                class="space-y-2"
              >
                <p class="text-xs font-medium">
                  {{ t(`uiKit.foundations.${group.key}`) }}
                </p>
                <ul class="flex flex-wrap gap-2">
                  <li
                    v-for="s in group.swatches"
                    :key="s.token"
                    class="flex w-20 flex-col gap-1"
                  >
                    <span
                      :class="['h-8 w-full rounded-md border', s.class]"
                      aria-hidden="true"
                    />
                    <code class="text-muted-foreground font-mono text-xs">{{ s.token }}</code>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <section class="space-y-2">
              <h3 class="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                {{ t('uiKit.foundations.type') }}
              </h3>
              <ul class="space-y-2">
                <li
                  v-for="role in typeRoles"
                  :key="role.key"
                  class="flex items-baseline justify-between gap-2"
                >
                  <span :class="['truncate', role.classes]">{{ role.sample }}</span>
                  <span class="text-muted-foreground shrink-0 text-xs">{{ t(`uiKit.foundations.roles.${role.key}`) }}</span>
                </li>
              </ul>
            </section>

            <section class="space-y-2">
              <h3 class="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                {{ t('uiKit.foundations.spacing') }}
              </h3>
              <ul class="space-y-1.5">
                <li
                  v-for="g in gaps"
                  :key="g.key"
                  class="flex items-center gap-2 text-xs"
                >
                  <span
                    :class="['bg-primary h-3 shrink-0 rounded-sm', g.bar]"
                    aria-hidden="true"
                  />
                  <code class="font-mono">{{ g.token }}</code>
                  <span class="text-muted-foreground ml-auto">{{ t(`uiKit.foundations.gaps.${g.key}`) }}</span>
                </li>
              </ul>
            </section>
            <section class="space-y-2">
              <h3 class="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                {{ t('uiKit.foundations.icons') }}
              </h3>
              <ul class="space-y-1.5">
                <li
                  v-for="i in iconSizes"
                  :key="i.key"
                  class="flex items-center gap-2 text-xs"
                >
                  <span class="flex w-10 shrink-0 justify-center">
                    <Star
                      :class="i.class"
                      aria-hidden="true"
                    />
                  </span>
                  <code class="font-mono">{{ i.token }}</code>
                  <span class="text-muted-foreground ml-auto">{{ t(`uiKit.foundations.iconUses.${i.key}`) }}</span>
                </li>
              </ul>
            </section>
          </div>
        </CardContent>
      </CollapsibleContent>
    </Card>
  </Collapsible>
</template>
