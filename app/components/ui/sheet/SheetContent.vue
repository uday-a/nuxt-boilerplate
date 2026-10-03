<script setup lang="ts">
import type { DialogContentEmits, DialogContentProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { X } from '@/lib/icon-pack'
import { DialogClose, DialogContent, DialogPortal, useForwardPropsEmits } from 'reka-ui'
import { cn } from '@/lib/utils'
import SheetOverlay from './SheetOverlay.vue'

// SFC compiler quirk: when the extension type is a *named* interface
// in an intersection (`DialogContentProps & ExtraProps`), the runtime
// extractor occasionally drops fields from the named interface --
// `side` then warns "accessed during render but not defined on
// instance" every time the FilterSheet mounts. Inlining the literal
// keeps the extractor happy. DialogContentProps stays in the
// intersection so reka-ui's typed props (asChild, trapFocus, etc.)
// flow through useForwardPropsEmits below.
defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<
    DialogContentProps & {
      class?: HTMLAttributes['class']
      side?: 'top' | 'right' | 'bottom' | 'left'
    }
  >(),
  { side: 'right' },
)
const emits = defineEmits<DialogContentEmits>()

const delegatedProps = reactiveOmit(props, 'class', 'side')

const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <DialogPortal>
    <SheetOverlay />
    <DialogContent
      data-uipkge
      data-slot="sheet-content"
      :class="
        cn(
          'bg-background motion-safe:data-[state=open]:animate-in motion-safe:data-[state=closed]:animate-out fixed z-50 flex flex-col gap-0 shadow-lg transition ease-in-out motion-safe:data-[state=closed]:duration-200 motion-safe:data-[state=open]:duration-200',
          side === 'right'
            && 'motion-safe:data-[state=closed]:slide-out-to-right motion-safe:data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm',
          side === 'left'
            && 'motion-safe:data-[state=closed]:slide-out-to-left motion-safe:data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm',
          side === 'top'
            && 'motion-safe:data-[state=closed]:slide-out-to-top motion-safe:data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b',
          side === 'bottom'
            && 'motion-safe:data-[state=closed]:slide-out-to-bottom motion-safe:data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t',
          props.class,
        )
      "
      v-bind="{ ...$attrs, ...forwarded }"
    >
      <slot />

      <DialogClose
        data-slot="sheet-close"
        class="text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-ring/50 absolute top-3 right-3 inline-flex size-8 items-center justify-center rounded-md transition-colors outline-none focus-visible:ring-[3px] disabled:pointer-events-none"
      >
        <X
          class="size-4"
          aria-hidden="true"
        />
        <span class="sr-only">Close</span>
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>
