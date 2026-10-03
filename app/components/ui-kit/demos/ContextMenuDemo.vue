<script setup lang="ts">
import {
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuShortcut, ContextMenuTrigger,
} from '@/components/ui/context-menu'
</script>

<template>
  <ContextMenu>
    <ContextMenuTrigger class="text-muted-foreground flex h-24 items-center justify-center rounded-md border border-dashed text-sm">
      Right-click here
    </ContextMenuTrigger>
    <ContextMenuContent class="w-48">
      <ContextMenuItem>
        Open
        <ContextMenuShortcut>⌘O</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem>
        Duplicate
        <ContextMenuShortcut>⌘D</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem class="text-destructive">
        Delete
      </ContextMenuItem>
    </ContextMenuContent>
  </ContextMenu>
</template>
