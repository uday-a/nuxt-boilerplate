<script setup lang="ts">
import { computed, ref, useTemplateRef, type Component } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'
import { ExternalLink } from '@/lib/icon-pack'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { CatalogEntry } from '@/data/ui-catalog/catalog'
import { categoryKey, type UsedInLink } from '@/composables/useUiCatalog'
import InstallCommand from './InstallCommand.vue'

const props = defineProps<{
  entry: CatalogEntry
  usedIn: UsedInLink[]
  /** Async demo component; mounted the first time the card scrolls into view. */
  demo?: Component
}>()

const { t } = useI18n()

const STATUS_VARIANT = { 'installed': 'success', 'demo-only': 'warning', 'available': 'outline' } as const
const STATUS_KEY = { 'installed': 'installed', 'demo-only': 'demoOnly', 'available': 'available' } as const

const USED_IN_LIMIT = 8
const showAllUsage = ref(false)
const visibleUsedIn = computed(() => showAllUsage.value ? props.usedIn : props.usedIn.slice(0, USED_IN_LIMIT))

const demoEl = useTemplateRef<HTMLElement>('demoEl')
const demoVisible = ref(false)
const { stop } = useIntersectionObserver(demoEl, ([hit]) => {
  if (hit?.isIntersecting) {
    demoVisible.value = true
    stop()
  }
}, { rootMargin: '200px' })

const isInstalled = computed(() => props.entry.status !== 'available')
</script>

<template>
  <Card
    :id="entry.name"
    class="scroll-mt-20"
  >
    <CardHeader class="gap-2 space-y-0 p-4 pb-0">
      <div class="flex flex-wrap items-center gap-2">
        <CardTitle class="text-base">
          <a
            :href="`#${entry.name}`"
            class="focus-visible:ring-ring rounded-sm hover:underline focus-visible:ring-2 focus-visible:outline-none"
          >{{ entry.title }}</a>
        </CardTitle>
        <code class="text-muted-foreground font-mono text-xs">{{ entry.name }}</code>
        <div class="ml-auto flex items-center gap-1.5">
          <Badge variant="secondary">
            {{ t(`uiKit.category.${categoryKey(entry.category)}`) }}
          </Badge>
          <Badge :variant="STATUS_VARIANT[entry.status]">
            {{ t(`uiKit.status.${STATUS_KEY[entry.status]}`) }}
          </Badge>
        </div>
      </div>
      <CardDescription class="text-sm">
        {{ entry.whenToUse ?? entry.description }}
      </CardDescription>
      <p
        v-if="entry.whenToUse && entry.description"
        class="text-muted-foreground line-clamp-2 text-xs"
      >
        {{ entry.description }}
      </p>
    </CardHeader>

    <CardContent class="space-y-4 p-4">
      <div
        v-if="demo"
        ref="demoEl"
        class="bg-background min-h-24 rounded-lg border p-4"
        :aria-label="t('uiKit.card.demo')"
        role="group"
      >
        <component
          :is="demo"
          v-if="demoVisible"
        />
        <div
          v-else
          class="space-y-2"
          :aria-label="t('uiKit.card.loadingDemo')"
        >
          <Skeleton class="h-4 w-1/3" />
          <Skeleton class="h-16 w-full" />
        </div>
      </div>

      <p
        v-if="entry.partOf"
        class="text-muted-foreground text-xs"
      >
        <a
          :href="`#${entry.partOf}`"
          class="text-foreground underline-offset-4 hover:underline"
        >{{ t('uiKit.card.partOf') }}</a>
      </p>

      <div
        v-if="isInstalled"
        class="space-y-2"
      >
        <p class="text-muted-foreground text-xs font-medium tracking-wider uppercase">
          {{ t('uiKit.card.usedIn') }}
        </p>
        <p
          v-if="!usedIn.length"
          class="text-muted-foreground text-xs"
        >
          {{ t('uiKit.card.notUsed') }}
        </p>
        <ul
          v-else
          class="flex flex-wrap gap-1.5"
        >
          <li
            v-for="link in visibleUsedIn"
            :key="link.label"
          >
            <NuxtLink
              v-if="link.to"
              :to="link.to"
              class="hover:bg-accent focus-visible:ring-ring inline-flex rounded-md border px-2 py-0.5 text-xs transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              {{ link.label }}
            </NuxtLink>
            <span
              v-else
              class="text-muted-foreground inline-flex rounded-md border border-dashed px-2 py-0.5 text-xs"
            >{{ link.label }}</span>
          </li>
          <li v-if="usedIn.length > USED_IN_LIMIT && !showAllUsage">
            <button
              type="button"
              class="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex rounded-md px-2 py-0.5 text-xs tabular-nums focus-visible:ring-2 focus-visible:outline-none"
              @click="showAllUsage = true"
            >
              +{{ usedIn.length - USED_IN_LIMIT }}
            </button>
          </li>
        </ul>
      </div>

      <div class="space-y-2">
        <p class="text-muted-foreground text-xs font-medium tracking-wider uppercase">
          {{ entry.installCmd ? t('uiKit.card.install') : t('uiKit.card.source') }}
        </p>
        <InstallCommand
          v-if="entry.installCmd"
          :command="entry.installCmd"
        />
        <p
          v-else
          class="text-muted-foreground text-xs"
        >
          {{ t('uiKit.card.localBlock') }}
          <code class="font-mono">app/components/blocks/{{ entry.file }}</code>
        </p>
      </div>
    </CardContent>

    <CardFooter
      v-if="entry.docsUrl"
      class="p-4 pt-0"
    >
      <Button
        variant="ghost"
        size="sm"
        as-child
        class="text-muted-foreground -ml-2"
      >
        <a
          :href="entry.docsUrl"
          target="_blank"
          rel="noopener"
        >
          {{ t('uiKit.card.docs') }}
          <ExternalLink
            class="size-4"
            aria-hidden="true"
          />
        </a>
      </Button>
    </CardFooter>
  </Card>
</template>
