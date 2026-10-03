<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <Badge>Pro</Badge>
    <Badge variant="secondary">
      Draft
    </Badge>
    <Badge variant="outline">
      v2.4.0
    </Badge>
    <Badge variant="success">
      Paid
    </Badge>
    <Badge variant="warning">
      Due soon
    </Badge>
    <Badge variant="info">
      Beta
    </Badge>
    <Badge variant="destructive">
      Failed
    </Badge>
  </div>
</template>
