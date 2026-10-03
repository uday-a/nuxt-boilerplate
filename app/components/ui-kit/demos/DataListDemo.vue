<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { DataList, DataListItem } from '@/components/ui/data-list'
</script>

<template>
  <DataList>
    <DataListItem>
      <span class="text-muted-foreground text-sm">Status</span>
      <Badge variant="success">
        Active
      </Badge>
    </DataListItem>
    <DataListItem>
      <span class="text-muted-foreground text-sm">Region</span>
      <span class="font-mono text-sm">us-east-1</span>
    </DataListItem>
    <DataListItem>
      <span class="text-muted-foreground text-sm">Plan</span>
      <Badge>Pro</Badge>
    </DataListItem>
    <DataListItem>
      <span class="text-muted-foreground text-sm">Seats</span>
      <span class="text-sm tabular-nums">8 of 25</span>
    </DataListItem>
  </DataList>
</template>
