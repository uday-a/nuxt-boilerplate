<script setup lang="ts">
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
</script>

<template>
  <div class="max-w-xs space-y-2">
    <div class="flex items-center justify-between">
      <Label
        for="ui-kit-switch-notifications"
        class="text-sm font-normal"
      >Notifications</Label>
      <Switch
        id="ui-kit-switch-notifications"
        default-checked
      />
    </div>
    <div class="flex items-center justify-between">
      <Label
        for="ui-kit-switch-digest"
        class="text-sm font-normal"
      >Weekly digest</Label>
      <Switch id="ui-kit-switch-digest" />
    </div>
  </div>
</template>
