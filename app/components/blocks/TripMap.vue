<script setup lang="ts">
import TripMapCanvas from './TripMapCanvas.vue'

interface Marker {
  lat: number
  lng: number
  label: string
  detail?: string
}

withDefaults(
  defineProps<{
    markers: Marker[]
    height?: string
    centre?: { lat: number, lng: number }
    zoom?: number
  }>(),
  {
    height: '380px',
    centre: () => ({ lat: 20, lng: 0 }),
    zoom: 2,
  },
)
</script>

<template>
  <ClientOnly>
    <TripMapCanvas
      :markers="markers"
      :height="height"
      :centre="centre"
      :zoom="zoom"
    />
    <template #fallback>
      <div
        class="bg-muted/40 text-muted-foreground flex w-full items-center justify-center rounded-lg border text-xs"
        :style="{ height }"
      >
        Loading map…
      </div>
    </template>
  </ClientOnly>
</template>
