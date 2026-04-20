<script setup lang="ts">
withDefaults(defineProps<{ columns?: 2 | 3 | 4 }>(), { columns: 4 })
</script>

<template>
  <div
    :class="[
      'grid gap-4 md:grid-cols-2',
      columns === 3 ? 'lg:grid-cols-3' : columns === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-4',
    ]"
  >
    <slot />
  </div>
</template>
