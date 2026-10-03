<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { SectionCard } from '@/components/ui/section-card'
</script>

<template>
  <SectionCard
    title="Account details"
    description="Your workspace identity"
  >
    <div class="flex items-center justify-between text-sm">
      <span class="text-muted-foreground">Plan</span>
      <Badge>Pro</Badge>
    </div>
  </SectionCard>
</template>
