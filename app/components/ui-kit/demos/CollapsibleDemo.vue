<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

const repos = ['acme/web-app', 'acme/api-gateway', 'acme/billing-service']
</script>

<template>
  <Collapsible>
    <div class="flex items-center justify-between">
      <p class="text-sm font-medium">
        3 repositories connected
      </p>
      <CollapsibleTrigger as-child>
        <Button
          variant="ghost"
          size="sm"
        >
          Toggle
        </Button>
      </CollapsibleTrigger>
    </div>
    <CollapsibleContent class="mt-2 space-y-2">
      <div
        v-for="repo in repos"
        :key="repo"
        class="rounded-md border px-3 py-2 font-mono text-xs"
      >
        {{ repo }}
      </div>
    </CollapsibleContent>
  </Collapsible>
</template>
