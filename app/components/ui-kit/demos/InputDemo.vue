<script setup lang="ts">
import { Mail } from '@/lib/icon-pack'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-2">
    <div class="space-y-2">
      <Label for="ui-kit-input-email">Text input</Label>
      <Input
        id="ui-kit-input-email"
        :prefix-icon="Mail"
        placeholder="name@example.com"
      />
    </div>
    <div class="space-y-2">
      <Label for="ui-kit-input-password">Password</Label>
      <Input
        id="ui-kit-input-password"
        type="password"
        model-value="secret123"
        show-password-toggle
      />
    </div>
  </div>
</template>
