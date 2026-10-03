<script setup lang="ts">
import { Copy, X } from '@/lib/icon-pack'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        size="sm"
      >
        Popover
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-56">
      <p class="text-sm font-medium">
        Quick actions
      </p>
      <p class="text-muted-foreground mt-1 text-xs">
        Choose an action for this item.
      </p>
      <Separator class="my-2" />
      <div class="space-y-1">
        <button class="hover:bg-accent flex w-full items-center gap-1.5 rounded px-2 py-1 text-xs">
          <Copy
            class="size-3.5"
            aria-hidden="true"
          />Copy
        </button>
        <button class="hover:bg-accent text-destructive flex w-full items-center gap-1.5 rounded px-2 py-1 text-xs">
          <X
            class="size-3.5"
            aria-hidden="true"
          />Remove
        </button>
      </div>
    </PopoverContent>
  </Popover>
</template>
