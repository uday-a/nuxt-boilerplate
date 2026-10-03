<script setup lang="ts">
import { ThemeSwitch } from '@/components/ui/theme-switch'
</script>

<template>
  <div class="space-y-4">
    <ThemeSwitch
      model-value="light"
      variant="cards"
    />
    <div class="flex flex-wrap items-center gap-4">
      <ThemeSwitch
        model-value="dark"
        variant="icons"
      />
      <ThemeSwitch
        model-value="system"
        variant="pill"
      />
    </div>
  </div>
</template>
