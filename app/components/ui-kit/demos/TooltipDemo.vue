<script setup lang="ts">
import { AlertCircle } from '@/lib/icon-pack'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
</script>

<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger as-child>
        <Button
          variant="ghost"
          size="icon"
          class="size-8"
          aria-label="More information"
        >
          <AlertCircle
            class="size-4"
            aria-hidden="true"
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent><p>More information about this feature</p></TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>
