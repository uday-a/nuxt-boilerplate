<script setup lang="ts">
import { Minus, Plus, RotateCcw } from '@/lib/icon-pack'
import { Button } from '@/components/ui/button'

// Zoom in / out / reset-to-fit for LeafletMap overlays. Sits inside a
// `relative isolate` card; the parent wires the events to its map ref.

defineEmits<{ zoomIn: [], zoomOut: [], reset: [] }>()
const { t } = useI18n()
</script>

<template>
  <div class="bg-card/90 absolute right-3 bottom-3 z-[800] flex flex-col overflow-hidden rounded-md border backdrop-blur-sm">
    <Button
      variant="ghost"
      size="icon"
      class="size-8 rounded-none"
      :aria-label="t('dashboard.locations.controls.zoomIn')"
      :title="t('dashboard.locations.controls.zoomIn')"
      @click="$emit('zoomIn')"
    >
      <Plus class="size-4" />
    </Button>
    <Button
      variant="ghost"
      size="icon"
      class="size-8 rounded-none border-t"
      :aria-label="t('dashboard.locations.controls.zoomOut')"
      :title="t('dashboard.locations.controls.zoomOut')"
      @click="$emit('zoomOut')"
    >
      <Minus class="size-4" />
    </Button>
    <Button
      variant="ghost"
      size="icon"
      class="size-8 rounded-none border-t"
      :aria-label="t('dashboard.locations.controls.reset')"
      :title="t('dashboard.locations.controls.reset')"
      @click="$emit('reset')"
    >
      <RotateCcw class="size-4" />
    </Button>
  </div>
</template>
