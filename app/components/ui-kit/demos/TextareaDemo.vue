<script setup lang="ts">
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
</script>

<template>
  <div class="space-y-2">
    <Label for="ui-kit-textarea">Message</Label>
    <Textarea
      id="ui-kit-textarea"
      placeholder="Enter your message..."
      rows="3"
    />
  </div>
</template>
