<script setup lang="ts">
import type { AccordionContentProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { AccordionContent as RkAccordionContent } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps<AccordionContentProps & { class?: HTMLAttributes['class'] }>()
const delegated = reactiveOmit(props, 'class')
</script>

<template>
  <RkAccordionContent
    data-uipkge
    data-slot="accordion-content"
    v-bind="delegated"
    :class="
      cn(
        'overflow-hidden text-sm text-muted-foreground',
        'data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down'
      )
    "
  >
    <div :class="cn('pb-4 pt-0', props.class)">
      <slot />
    </div>
  </RkAccordionContent>
</template>
