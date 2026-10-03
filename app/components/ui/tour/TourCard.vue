<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { X } from '@/lib/icon-pack'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { TargetRect } from './use-tour-target'

const props = withDefaults(
  defineProps<{
    title: string
    description?: string
    cover?: string
    rect: TargetRect | null
    total: number
    current: number
    prevText?: string
    nextText?: string
    finishText?: string
    type?: 'default' | 'primary'
    zIndex: number
    /** Optional link button, e.g. { label: 'Star on GitHub', href }. */
    action?: { label: string, href: string }
    /** When true, move focus into the card (on open / step change). */
    autofocus?: boolean
  }>(),
  {
    prevText: 'Previous',
    nextText: 'Next',
    finishText: 'Finish',
    type: 'default',
    autofocus: false,
  },
)

defineEmits<{
  (e: 'prev'): void
  (e: 'next'): void
  (e: 'finish'): void
  (e: 'skip'): void
}>()

const isLast = computed(() => props.current === props.total - 1)
const isFirst = computed(() => props.current === 0)

const titleId = useId()
const descriptionId = useId()
const cardRef = ref<HTMLElement | null>(null)
/** Measured card height used for placement; falls back to estimate until laid out. */
const measuredHeight = ref(0)
let resizeObs: ResizeObserver | null = null

const FOCUSABLE
  = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function focusCard() {
  nextTick(() => {
    cardRef.value?.focus()
  })
}

function measureCard() {
  const el = cardRef.value
  if (!el) return
  measuredHeight.value = el.getBoundingClientRect().height
}

function attachResizeObserver() {
  resizeObs?.disconnect()
  resizeObs = null
  const el = cardRef.value
  if (!el || typeof ResizeObserver === 'undefined') {
    measureCard()
    return
  }
  resizeObs = new ResizeObserver(() => measureCard())
  resizeObs.observe(el)
  measureCard()
}

onMounted(() => {
  attachResizeObserver()
  if (props.autofocus) focusCard()
})

watch(
  () => [props.current, props.title, props.description, props.cover] as const,
  () => {
    if (props.autofocus) focusCard()
    // Re-measure after step content swaps (title/cover/description).
    nextTick(attachResizeObserver)
  },
)

onBeforeUnmount(() => {
  resizeObs?.disconnect()
  resizeObs = null
})

/** Keep Tab cycling inside the dialog while aria-modal is asserted. */
function onKeydown(e: KeyboardEvent) {
  if (e.key !== 'Tab' || !cardRef.value) return
  // Prefer getClientRects over offsetParent — fixed-position descendants report null offsetParent.
  const list = Array.from(cardRef.value.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    el => el.getClientRects().length > 0,
  )
  if (list.length === 0) return
  const first = list[0]!
  const last = list[list.length - 1]!
  if (e.shiftKey) {
    if (document.activeElement === first || document.activeElement === cardRef.value) {
      e.preventDefault()
      last.focus()
    }
  }
  else if (document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}

const cardStyle = computed(() => {
  const cardWidth = 320
  const margin = 12
  const edgePadding = 8
  // Prefer measured height; estimate only before first layout (cover makes card taller).
  const cardHeight = measuredHeight.value || (props.cover ? 320 : 200)
  if (!props.rect) {
    return {
      position: 'fixed' as const,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: `${cardWidth}px`,
      zIndex: props.zIndex + 1,
    }
  }
  const { x, y, width, height } = props.rect
  const viewportH = typeof window !== 'undefined' ? window.innerHeight : 768
  const viewportW = typeof window !== 'undefined' ? window.innerWidth : 1024
  const clampTop = (v: number) => Math.min(Math.max(edgePadding, v), viewportH - cardHeight - edgePadding)
  // Targets hugging the left edge (sidebar items) get the card beside them,
  // so it doesn't cover the neighbouring items.
  const placeRight = x + width < viewportW * 0.35 && x + width + margin + cardWidth <= viewportW - edgePadding
  if (placeRight) {
    return {
      position: 'fixed' as const,
      top: `${clampTop(y + height / 2 - cardHeight / 2)}px`,
      left: `${x + width + margin}px`,
      width: `${cardWidth}px`,
      zIndex: props.zIndex + 1,
    }
  }
  const placeBelow = y + height + margin + cardHeight < viewportH
  const top = clampTop(placeBelow ? y + height + margin : y - margin - cardHeight)
  let left = x
  if (left + cardWidth > viewportW - edgePadding) {
    left = viewportW - cardWidth - edgePadding
  }
  if (left < edgePadding) left = edgePadding
  return {
    position: 'fixed' as const,
    top: `${top}px`,
    left: `${left}px`,
    width: `${cardWidth}px`,
    zIndex: props.zIndex + 1,
  }
})

defineExpose({ focus: focusCard, el: cardRef })
</script>

<template>
  <div
    ref="cardRef"
    data-slot="tour-card"
    role="dialog"
    aria-modal="true"
    :aria-labelledby="titleId"
    :aria-describedby="description ? descriptionId : undefined"
    tabindex="-1"
    :class="
      cn(
        'relative space-y-3 rounded-lg border p-4 shadow-lg outline-none',
        type === 'primary' ? 'bg-primary text-primary-foreground border-primary' : 'bg-popover text-popover-foreground',
      )
    "
    :style="cardStyle"
    @keydown="onKeydown"
  >
    <button
      type="button"
      class="hover:bg-foreground/10 focus-visible:ring-ring absolute top-2 right-2 inline-flex size-8 items-center justify-center rounded focus-visible:ring-2 focus-visible:outline-none"
      aria-label="Close tour"
      @click="$emit('skip')"
    >
      <X
        class="size-4"
        aria-hidden="true"
      />
    </button>

    <img
      v-if="cover"
      :src="cover"
      alt=""
      class="w-full rounded-md"
    >

    <div>
      <div
        :id="titleId"
        class="pr-6 font-semibold"
      >
        {{ title }}
      </div>
      <div
        v-if="description"
        :id="descriptionId"
        class="mt-1 text-sm opacity-90"
      >
        {{ description }}
      </div>
      <Button
        v-if="action"
        as="a"
        :href="action.href"
        target="_blank"
        rel="noopener noreferrer"
        size="sm"
        variant="outline"
        class="mt-3 w-full"
      >
        {{ action.label }}
      </Button>
    </div>

    <div class="flex items-center justify-between gap-2 pt-2">
      <div
        class="text-xs tabular-nums opacity-70"
        aria-live="polite"
        aria-atomic="true"
      >
        {{ current + 1 }} / {{ total }}
      </div>
      <div class="flex gap-2">
        <Button
          v-if="!isFirst"
          size="sm"
          :variant="type === 'primary' ? 'secondary' : 'outline'"
          @click="$emit('prev')"
        >
          {{ prevText }}
        </Button>
        <Button
          v-if="!isLast"
          size="sm"
          :variant="type === 'primary' ? 'secondary' : 'default'"
          @click="$emit('next')"
        >
          {{ nextText }}
        </Button>
        <Button
          v-else
          size="sm"
          :variant="type === 'primary' ? 'secondary' : 'default'"
          @click="$emit('finish')"
        >
          {{ finishText }}
        </Button>
      </div>
    </div>
  </div>
</template>
