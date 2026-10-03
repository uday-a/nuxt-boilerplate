<script setup lang="ts">
import { Plus } from '@/lib/icon-pack'
import { Button } from '@/components/ui/button'
import { Page, PageBody, PageHeader } from '@/components/ui/page'
</script>

<template>
  <!-- PageHeaderHeading renders the page's h1, so this preview uses a plain
       title to keep one h1 per page. Real pages use PageHeaderHeading. -->
  <Page class="space-y-4">
    <PageHeader>
      <p class="text-2xl font-semibold tracking-tight">
        Projects
      </p>
      <p class="text-muted-foreground mt-1 text-sm">
        Every project in this workspace.
      </p>
      <template #actions>
        <Button size="sm">
          <Plus
            class="size-4"
            aria-hidden="true"
          />New project
        </Button>
      </template>
    </PageHeader>
    <PageBody class="text-muted-foreground rounded-md border border-dashed p-4 text-sm">
      PageBody content
    </PageBody>
  </Page>
</template>
