<script setup lang="ts">
import { ref, watch } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { Search } from '@/lib/icon-pack'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { CATALOG_CATEGORIES, type CatalogCategory, type CatalogStatus } from '@/data/ui-catalog/catalog'
import { categoryKey } from '@/composables/useUiCatalog'

defineProps<{ count: number }>()

const q = defineModel<string>('q', { required: true })
const category = defineModel<CatalogCategory | 'all'>('category', { required: true })
const status = defineModel<CatalogStatus | 'all'>('status', { required: true })

const { t } = useI18n()

// Type into a local ref; push to the URL once typing pauses.
const draft = ref(q.value)
watch(q, (value) => {
  if (value !== draft.value) draft.value = value
})
watchDebounced(draft, (value) => {
  q.value = value.trim()
}, { debounce: 200 })

const statusOptions: { value: CatalogStatus | 'all', key: string }[] = [
  { value: 'all', key: 'all' },
  { value: 'installed', key: 'installed' },
  { value: 'available', key: 'available' },
  { value: 'demo-only', key: 'demoOnly' },
]

function onStatus(value: unknown) {
  // ToggleGroup emits '' when the pressed item is clicked again; keep one selected.
  if (typeof value === 'string' && value) status.value = value as CatalogStatus | 'all'
}
</script>

<template>
  <div class="flex flex-col gap-2 lg:flex-row lg:items-center">
    <div class="min-w-0 flex-1">
      <Input
        v-model="draft"
        type="search"
        :prefix-icon="Search"
        :placeholder="t('uiKit.toolbar.searchPlaceholder')"
        :aria-label="t('uiKit.toolbar.searchLabel')"
        allow-clear
      />
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <Select v-model="category">
        <SelectTrigger
          class="w-full sm:w-48"
          :aria-label="t('uiKit.toolbar.category')"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            {{ t('uiKit.category.all') }}
          </SelectItem>
          <SelectItem
            v-for="c in CATALOG_CATEGORIES"
            :key="c"
            :value="c"
          >
            {{ t(`uiKit.category.${categoryKey(c)}`) }}
          </SelectItem>
        </SelectContent>
      </Select>
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        :model-value="status"
        :aria-label="t('uiKit.toolbar.status')"
        @update:model-value="onStatus"
      >
        <ToggleGroupItem
          v-for="opt in statusOptions"
          :key="opt.value"
          :value="opt.value"
          class="px-3 text-xs"
        >
          {{ t(`uiKit.status.${opt.key}`) }}
        </ToggleGroupItem>
      </ToggleGroup>
      <p
        class="text-muted-foreground text-xs tabular-nums"
        aria-live="polite"
      >
        {{ t('uiKit.toolbar.results', count) }}
      </p>
    </div>
  </div>
</template>
