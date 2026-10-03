<script setup lang="ts">
import { Fingerprint, Mail, Palette, Settings } from '@/lib/icon-pack'
import { IconBox } from '@/components/ui/icon-box'
</script>

<template>
  <div class="flex gap-2">
    <IconBox :icon="Mail" />
    <IconBox
      :icon="Settings"
      variant="muted"
    />
    <IconBox
      :icon="Palette"
      variant="muted"
    />
    <IconBox
      :icon="Fingerprint"
      variant="custom"
    />
  </div>
</template>
