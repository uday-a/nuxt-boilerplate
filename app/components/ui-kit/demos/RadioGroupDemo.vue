<script setup lang="ts">
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
</script>

<template>
  <RadioGroup
    default-value="comfortable"
    aria-label="Density"
  >
    <div class="flex items-center gap-2">
      <RadioGroupItem
        id="ui-kit-radio-compact"
        value="compact"
      />
      <Label
        for="ui-kit-radio-compact"
        class="text-sm font-normal"
      >Compact</Label>
    </div>
    <div class="flex items-center gap-2">
      <RadioGroupItem
        id="ui-kit-radio-comfortable"
        value="comfortable"
      />
      <Label
        for="ui-kit-radio-comfortable"
        class="text-sm font-normal"
      >Comfortable</Label>
    </div>
    <div class="flex items-center gap-2">
      <RadioGroupItem
        id="ui-kit-radio-spacious"
        value="spacious"
      />
      <Label
        for="ui-kit-radio-spacious"
        class="text-sm font-normal"
      >Spacious</Label>
    </div>
  </RadioGroup>
</template>
