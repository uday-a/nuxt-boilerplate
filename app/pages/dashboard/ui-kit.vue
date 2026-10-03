<script setup lang="ts">
import { defineAsyncComponent, nextTick, onMounted, type Component } from 'vue'
import { SearchX } from '@/lib/icon-pack'
import { Page, PageHeader, PageHeaderHeading, PageBody } from '@/components/ui/page'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { demoNameFor } from '@/data/ui-catalog/catalog'
import FinderToolbar from '@/components/ui-kit/FinderToolbar.vue'
import FoundationsPanel from '@/components/ui-kit/FoundationsPanel.vue'
import CatalogCard from '@/components/ui-kit/CatalogCard.vue'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const title = useRouteLabel()
useHead({ title })

const { t } = useI18n()
const route = useRoute()
const { results, q, category, status, usedInLinks, clearFilters } = useUiCatalog()

// One chunk per demo, loaded only when its card scrolls into view
// (CatalogCard mounts it), so leaflet, tiptap and echarts stay out of the
// initial page JS.
const demoLoaders = import.meta.glob<Component>('@/components/ui-kit/demos/*Demo.vue', { import: 'default' })
const demos = new Map<string, Component>()
for (const [path, loader] of Object.entries(demoLoaders)) {
  const name = path.split('/').pop()!.replace(/\.vue$/, '')
  demos.set(name, defineAsyncComponent(loader))
}
const demoFor = (name: string, kind: 'ui' | 'block') => kind === 'ui' ? demos.get(demoNameFor(name)) : undefined

// Deep links (#range-calendar) scroll to the card once it has rendered.
onMounted(async () => {
  if (!route.hash) return
  await nextTick()
  document.getElementById(decodeURIComponent(route.hash.slice(1)))?.scrollIntoView({ block: 'start' })
})
</script>

<template>
  <Page>
    <PageHeader>
      <PageHeaderHeading
        :title="title"
        :description="t('uiKit.description')"
      />
    </PageHeader>

    <PageBody class="space-y-4">
      <FoundationsPanel />
      <FinderToolbar
        v-model:q="q"
        v-model:category="category"
        v-model:status="status"
        :count="results.length"
      />

      <EmptyState
        v-if="!results.length"
        :icon="SearchX"
        :title="t('uiKit.empty.title')"
        :description="t('uiKit.empty.description')"
        heading-tag="h2"
      >
        <Button
          variant="outline"
          size="sm"
          class="mt-4"
          @click="clearFilters"
        >
          {{ t('uiKit.empty.clear') }}
        </Button>
      </EmptyState>

      <div
        v-else
        class="grid items-start gap-4 xl:grid-cols-2"
      >
        <CatalogCard
          v-for="entry in results"
          :key="`${entry.kind}:${entry.name}`"
          :entry="entry"
          :used-in="usedInLinks(entry.usedIn)"
          :demo="demoFor(entry.name, entry.kind)"
        />
      </div>
    </PageBody>
  </Page>
</template>
