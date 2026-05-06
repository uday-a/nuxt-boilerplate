<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

interface Marker {
  lat: number
  lng: number
  label: string
  detail?: string
}

const props = withDefaults(
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

// This component lives INSIDE <ClientOnly> in TripMap.vue so it only
// mounts client-side. That guarantees `el` is attached and the DOM
// node exists by the time onMounted fires (the parent ClientOnly
// resolved before this child instantiated). Doing all of this on the
// outer TripMap.vue meant onMounted fired against the fallback's DOM
// and `el.value` was null.

const el = ref<HTMLDivElement | null>(null)
let map: any = null
let layer: any = null

onMounted(async () => {
  if (!el.value) return
  const L = (await import('leaflet')).default

  // Default Leaflet marker icon resolution prepends `imagePath` to the
  // returned URL, which doubled our absolute Vite-emitted paths and
  // produced 404s. Deleting `_getIconUrl` on the prototype disables
  // that prepend; then `mergeOptions` supplies the final URLs directly.
  // Pattern documented at https://github.com/Leaflet/Leaflet/issues/4968.
  const [iconRetina, iconUrl, shadowUrl] = await Promise.all([
    import('leaflet/dist/images/marker-icon-2x.png?url').then(m => m.default),
    import('leaflet/dist/images/marker-icon.png?url').then(m => m.default),
    import('leaflet/dist/images/marker-shadow.png?url').then(m => m.default),
  ])
  delete (L.Icon.Default.prototype as any)._getIconUrl
  ;(L.Icon.Default as any).mergeOptions({ iconRetinaUrl: iconRetina, iconUrl, shadowUrl })

  map = L.map(el.value, { zoomControl: true, attributionControl: true }).setView(
    [props.centre.lat, props.centre.lng],
    props.zoom,
  )

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map)

  drawMarkers(L)
})

function drawMarkers(L: any) {
  if (!map) return
  if (layer) map.removeLayer(layer)
  layer = L.featureGroup(
    props.markers.map(m =>
      L.marker([m.lat, m.lng]).bindPopup(
        `<strong>${escapeHtml(m.label)}</strong>${m.detail ? `<br><span style="opacity:.7">${escapeHtml(m.detail)}</span>` : ''}`,
      ),
    ),
  ).addTo(map)
  if (props.markers.length >= 2) {
    map.fitBounds(layer.getBounds(), { padding: [40, 40] })
  }
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' }[c] as string))
}

watch(
  () => props.markers,
  async () => {
    if (!map) return
    const L = (await import('leaflet')).default
    drawMarkers(L)
  },
  { deep: true },
)

onBeforeUnmount(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<template>
  <div
    ref="el"
    class="bg-muted/40 z-0 w-full overflow-hidden rounded-lg border"
    :style="{ height }"
  />
</template>

<style>
@import 'leaflet/dist/leaflet.css';

.leaflet-container .leaflet-control-zoom a {
  width: 30px;
  height: 30px;
  line-height: 30px;
  font-size: 18px;
}
.leaflet-container .leaflet-control-attribution {
  font-size: 10px;
}
</style>
