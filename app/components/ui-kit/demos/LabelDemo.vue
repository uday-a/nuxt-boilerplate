<script setup lang="ts">
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
</script>

<template>
  <div class="max-w-xs space-y-2">
    <Label for="ui-kit-label-workspace">Workspace name</Label>
    <Input
      id="ui-kit-label-workspace"
      placeholder="Acme Inc"
    />
  </div>
</template>
