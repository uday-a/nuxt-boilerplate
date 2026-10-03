<script setup lang="ts">
import { Separator } from '@/components/ui/separator'
</script>

<template>
  <div class="space-y-2">
    <p class="text-sm font-medium">
      Workspace
    </p>
    <p class="text-muted-foreground text-xs">
      Settings shared by every member.
    </p>
    <Separator class="my-4" />
    <div class="flex h-5 items-center gap-4 text-sm">
      <span>General</span>
      <Separator orientation="vertical" />
      <span>Members</span>
      <Separator orientation="vertical" />
      <span>Billing</span>
    </div>
  </div>
</template>
