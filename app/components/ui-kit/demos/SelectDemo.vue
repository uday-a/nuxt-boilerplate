<script setup lang="ts">
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
</script>

<template>
  <div class="max-w-xs space-y-2">
    <Label for="ui-kit-select">Plan</Label>
    <Select default-value="pro">
      <SelectTrigger id="ui-kit-select">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="free">
          Free
        </SelectItem>
        <SelectItem value="pro">
          Pro
        </SelectItem>
        <SelectItem value="enterprise">
          Enterprise
        </SelectItem>
      </SelectContent>
    </Select>
  </div>
</template>
