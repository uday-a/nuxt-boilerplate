<script setup lang="ts">
import { FolderOpen } from '@/lib/icon-pack'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
</script>

<template>
  <EmptyState
    :icon="FolderOpen"
    title="No projects yet"
    description="Create a project to start tracking deploys and usage."
    heading-tag="h4"
    class="py-4"
  >
    <Button
      size="sm"
      class="mt-4"
    >
      New project
    </Button>
  </EmptyState>
</template>
