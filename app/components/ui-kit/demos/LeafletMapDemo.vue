<script setup lang="ts">
import { LeafletMap, LeafletMarker, LeafletPopup } from '@/components/ui/leaflet-map'

const offices = [
  { city: 'New York', lngLat: [-74.006, 40.7128] as [number, number] },
  { city: 'London', lngLat: [-0.1276, 51.5072] as [number, number] },
  { city: 'Berlin', lngLat: [13.405, 52.52] as [number, number] },
]
</script>

<template>
  <LeafletMap
    variant="muted"
    :center="[-30, 45]"
    :zoom="1.6"
    :min-zoom="1.4"
    :scroll-wheel-zoom="false"
    :navigation="false"
    class="h-56 w-full overflow-hidden rounded-lg border"
  >
    <LeafletMarker
      v-for="office in offices"
      :key="office.city"
      :lng-lat="office.lngLat"
      anchor="center"
    >
      <span class="bg-primary ring-primary/20 block size-3.5 rounded-full ring-4" />
      <LeafletPopup :offset="[0, -10]">
        <p class="text-foreground text-sm font-semibold">
          {{ office.city }}
        </p>
      </LeafletPopup>
    </LeafletMarker>
  </LeafletMap>
</template>
