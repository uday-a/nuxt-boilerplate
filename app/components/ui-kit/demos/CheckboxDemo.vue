<script setup lang="ts">
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-center gap-2">
      <Checkbox id="ui-kit-terms" />
      <Label
        for="ui-kit-terms"
        class="text-sm font-normal"
      >Accept terms</Label>
    </div>
    <div class="flex items-center gap-2">
      <Checkbox
        id="ui-kit-news"
        default-checked
      />
      <Label
        for="ui-kit-news"
        class="text-sm font-normal"
      >Newsletter</Label>
    </div>
  </div>
</template>
