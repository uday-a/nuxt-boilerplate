<script setup lang="ts">
import { Loader2, Plus, Trash2 } from '@/lib/icon-pack'
import { Button } from '@/components/ui/button'
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm">
        <Plus
          class="size-4"
          aria-hidden="true"
        />New project
      </Button>
      <Button
        size="sm"
        variant="outline"
      >
        Outline
      </Button>
      <Button
        size="sm"
        variant="secondary"
      >
        Secondary
      </Button>
      <Button
        size="sm"
        variant="ghost"
      >
        Ghost
      </Button>
      <Button
        size="sm"
        variant="link"
      >
        Link
      </Button>
      <Button
        size="sm"
        variant="destructive"
      >
        <Trash2
          class="size-4"
          aria-hidden="true"
        />Delete
      </Button>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <Button size="xs">
        Extra small
      </Button>
      <Button size="sm">
        Small
      </Button>
      <Button>Default</Button>
      <Button
        size="icon"
        variant="outline"
        aria-label="Add"
      >
        <Plus
          class="size-4"
          aria-hidden="true"
        />
      </Button>
      <Button
        size="sm"
        disabled
      >
        <Loader2
          class="size-4 animate-spin"
          aria-hidden="true"
        />Saving
      </Button>
    </div>
  </div>
</template>
