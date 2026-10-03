<script setup lang="ts">
import { Image as ImageIcon, Link as LinkIcon, List, ListOrdered } from '@/lib/icon-pack'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
</script>

<template>
  <ToggleGroup
    type="single"
    default-value="list"
  >
    <ToggleGroupItem
      value="list"
      aria-label="Bulleted list"
    >
      <List class="size-4" />
    </ToggleGroupItem>
    <ToggleGroupItem
      value="ordered"
      aria-label="Numbered list"
    >
      <ListOrdered class="size-4" />
    </ToggleGroupItem>
    <ToggleGroupItem
      value="link"
      aria-label="Link"
    >
      <LinkIcon class="size-4" />
    </ToggleGroupItem>
    <ToggleGroupItem
      value="image"
      aria-label="Image"
    >
      <ImageIcon class="size-4" />
    </ToggleGroupItem>
  </ToggleGroup>
</template>
