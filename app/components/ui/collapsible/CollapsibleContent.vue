<script setup lang="ts">
import type { CollapsibleContentProps } from 'reka-ui'
import { CollapsibleContent } from 'reka-ui'

const props = defineProps<CollapsibleContentProps>()
</script>

<template>
  <CollapsibleContent data-uipkge data-slot="collapsible-content" v-bind="props">
    <slot />
  </CollapsibleContent>
</template>
