<script setup lang="ts">
import type { SliderRootProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { computed, ref, watch } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import {
  SliderRange,
  SliderRoot,
  SliderThumb,
  SliderTrack,
  TooltipArrow,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from 'reka-ui'
import { cn } from '@/lib/utils'

export interface SliderMark {
  label: string
  style?: Record<string, string>
}

type ModelValue = number | number[] | [number, number] | null | undefined

const props = withDefaults(
  defineProps<
    Omit<SliderRootProps, 'modelValue' | 'defaultValue' | 'inverted'> & {
      class?: HTMLAttributes['class']
      modelValue?: ModelValue
      defaultValue?: ModelValue
      /** Enable dual-thumb range selection */
      range?: boolean
      /** Vertical orientation */
      vertical?: boolean
      /** Height when vertical (px or css value) */
      height?: string | number
      /** Tick marks with labels */
      marks?: Record<number, string | SliderMark>
      /** Show tooltip on drag/focus. Boolean or formatter function */
      tooltip?: boolean | ((value: number) => string)
      /** Show dots at each step */
      dots?: boolean
      /** Reverse direction (right-to-left or bottom-to-top) */
      reverse?: boolean
      /** Highlight the track between thumbs/min (default true) */
      included?: boolean
      /** Size variant */
      size?: 'small' | 'default'
    }
  >(),
  {
    min: 0,
    max: 100,
    step: 1,
    included: true,
    size: 'default',
    tooltip: true,
  }
)

const emits = defineEmits<{
  'update:modelValue': [value: number | number[] | [number, number]]
  'valueCommit': [payload: number | number[] | [number, number]]
}>()

/* ── normalize value to number[] for Reka UI ── */
const innerValue = ref<number[]>([])

watch(
  () => props.modelValue,
  (v) => {
    const dflt = props.range ? [props.min, props.max] : [props.min]
    if (v == null) {
      innerValue.value = dflt
      return
    }
    if (props.range) {
      const arr = Array.isArray(v) ? v : [v, props.max]
      innerValue.value = [arr[0] ?? props.min, arr[1] ?? props.max]
    } else {
      innerValue.value = Array.isArray(v) ? v : [v]
    }
  },
  { immediate: true }
)

function handleUpdate(val: number[] | undefined) {
  if (!val) return
  innerValue.value = val
  if (props.range) {
    emits('update:modelValue', [val[0], val[1]] as [number, number])
  } else if (Array.isArray(props.modelValue)) {
    // backward-compat: consumer passed an array, emit an array
    emits('update:modelValue', val)
  } else {
    emits('update:modelValue', val[0] ?? props.min)
  }
}

function handleCommit(val: number[] | undefined) {
  if (!val) return
  if (props.range) {
    emits('valueCommit', [val[0], val[1]] as [number, number])
  } else if (Array.isArray(props.modelValue)) {
    emits('valueCommit', val)
  } else {
    emits('valueCommit', val[0] ?? props.min)
  }
}

/* ── layout helpers ── */
const orientation = computed(() => {
  if (props.vertical) return 'vertical'
  return props.orientation ?? 'horizontal'
})

const isHorizontal = computed(() => orientation.value === 'horizontal')

const trackSize = computed(() =>
  props.size === 'small'
    ? isHorizontal.value ? 'h-1' : 'w-1'
    : isHorizontal.value ? 'h-1.5' : 'w-1.5'
)

const thumbSize = computed(() =>
  props.size === 'small' ? 'size-3' : 'size-4'
)

/* ── marks ── */
const markList = computed(() => {
  if (!props.marks) return []
  const entries = Object.entries(props.marks).map(([key, val]) => {
    const num = Number(key)
    const label = typeof val === 'string' ? val : val.label
    const style = typeof val === 'string' ? undefined : val.style
    const pct = ((num - props.min) / (props.max - props.min)) * 100
    return { value: num, label, style, pct }
  })
  entries.sort((a, b) => a.value - b.value)
  return entries
})

/* ── step dots ── */
const dotList = computed(() => {
  if (!props.dots) return []
  const list: number[] = []
  const count = Math.floor((props.max - props.min) / props.step)
  for (let i = 0; i <= count; i++) {
    list.push(props.min + i * props.step)
  }
  return list
})

/* ── tooltip ── */
const showTooltip = computed(() => props.tooltip !== false)

function formatTooltip(v: number) {
  if (typeof props.tooltip === 'function') return props.tooltip(v)
  return String(v)
}

/* ── delegated reka props ── */
const delegated = reactiveOmit(
  props,
  'class',
  'modelValue',
  'defaultValue',
  'range',
  'vertical',
  'height',
  'marks',
  'tooltip',
  'dots',
  'reverse',
  'included',
  'size'
)

const rootProps = computed(() => ({
  ...delegated,
  modelValue: innerValue.value,
  orientation: orientation.value,
  inverted: props.reverse,
}))
</script>

<template>
  <TooltipProvider>
    <div
      :class="cn('relative w-full', !isHorizontal && 'flex flex-col items-center')"
      :style="
        !isHorizontal && height
          ? { height: typeof height === 'number' ? `${height}px` : height }
          : undefined
      "
    >
      <SliderRoot
        v-slot="{ modelValue: thumbs }"
        data-uipkge
        data-slot="slider"
        :class="
          cn(
            'relative flex touch-none select-none data-[disabled]:opacity-50',
            isHorizontal
              ? 'w-full items-center'
              : 'h-full min-h-44 flex-col justify-center',
            props.class
          )
        "
        v-bind="rootProps"
        @update:model-value="handleUpdate"
        @value-commit="handleCommit"
      >
        <!-- Track -->
        <SliderTrack
          data-uipkge
          data-slot="slider-track"
          :class="
            cn(
              'bg-muted relative grow overflow-hidden rounded-full',
              trackSize
            )
          "
        >
          <SliderRange
            v-if="included"
            data-uipkge
            data-slot="slider-range"
            :class="
              cn(
                'bg-primary absolute',
                isHorizontal ? 'h-full' : 'w-full'
              )
            "
          />
        </SliderTrack>

        <!-- Step dots -->
        <template v-if="dotList.length">
          <div
            v-for="dot in dotList"
            :key="dot"
            :class="
              cn(
                'absolute rounded-full border border-primary/40 bg-background',
                isHorizontal
                  ? 'top-1/2 size-1.5 -translate-y-1/2'
                  : 'left-1/2 size-1.5 -translate-x-1/2',
                props.size === 'small' && 'size-1'
              )
            "
            :style="
              isHorizontal
                ? {
                    left: `${((dot - min) / (max - min)) * 100}%`,
                    transform: 'translateX(-50%) translateY(-50%)',
                  }
                : {
                    bottom: `${((dot - min) / (max - min)) * 100}%`,
                    transform: 'translateX(-50%) translateY(50%)',
                  }
            "
          />
        </template>

        <!-- Marks -->
        <div
          v-if="markList.length"
          :class="
            cn(
              'pointer-events-none absolute',
              isHorizontal
                ? 'top-full mt-2.5 h-5 w-full'
                : 'left-full top-0 ml-3 h-full w-20'
            )
          "
        >
          <span
            v-for="mark in markList"
            :key="mark.value"
            class="absolute whitespace-nowrap text-xs text-muted-foreground"
            :style="{
              ...mark.style,
              ...(isHorizontal
                ? { left: `${mark.pct}%`, transform: 'translateX(-50%)' }
                : { bottom: `${mark.pct}%`, transform: 'translateY(50%)' }),
            }"
          >
            {{ mark.label }}
          </span>
        </div>

        <!-- Thumbs (with tooltips) -->
        <template v-for="(_, idx) in thumbs" :key="idx">
          <TooltipRoot
            v-if="showTooltip"
            :delay-duration="0"
          >
            <TooltipTrigger as-child>
              <SliderThumb
                :index="idx"
                data-uipkge
                data-slot="slider-thumb"
                :class="
                  cn(
                    'block shrink-0 rounded-full border border-primary bg-white shadow-sm ring-ring/50 transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50',
                    thumbSize
                  )
                "
              />
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent
                :side="isHorizontal ? 'top' : 'right'"
                :side-offset="4"
                class="z-50 w-fit rounded-md bg-foreground px-2 py-1 text-xs text-background"
              >
                {{ formatTooltip(thumbs?.[idx] ?? 0) }}
                <TooltipArrow
                  class="size-2.5 rotate-45 rounded-[2px] bg-foreground fill-foreground"
                />
              </TooltipContent>
            </TooltipPortal>
          </TooltipRoot>

          <SliderThumb
            v-else
            :index="idx"
            data-uipkge
            data-slot="slider-thumb"
            :class="
              cn(
                'block shrink-0 rounded-full border border-primary bg-white shadow-sm ring-ring/50 transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50',
                thumbSize
              )
            "
          />
        </template>
      </SliderRoot>
    </div>
  </TooltipProvider>
</template>
