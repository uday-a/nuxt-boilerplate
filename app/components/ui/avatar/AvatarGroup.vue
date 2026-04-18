<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

export interface AvatarGroupProps {
  class?: HTMLAttributes['class']
  max?: number
  overlap?: boolean
  size?: 'xs' | 'sm' | 'default' | 'lg' | 'xl' | '2xl'
  total?: number
}

const props = withDefaults(defineProps<AvatarGroupProps>(), {
  overlap: true,
  size: 'default',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

function handleClick(event: MouseEvent) {
  emit('click', event)
}
</script>

<template>
  <div
    :class="cn('flex items-center', overlap ? '-space-x-2' : 'gap-1', props.class)"
    data-uipkge
    data-slot="avatar-group"
    @click="handleClick"
  >
    <slot :max="max" :size="size" />
    <template v-if="max && ($slots.default?.()?.length || 0) > max">
      <div
        :class="
          cn(
            'bg-muted ring-background relative flex shrink-0 overflow-hidden rounded-full ring-2',
            size === 'xs'
              ? 'size-4 text-[8px]'
              : size === 'sm'
                ? 'size-6 text-xs'
                : size === 'default'
                  ? 'size-8 text-sm'
                  : size === 'lg'
                    ? 'size-12 text-base'
                    : size === 'xl'
                      ? 'size-16 text-lg'
                      : 'size-20 text-xl'
          )
        "
      >
        <slot name="overflow" :count="($slots.default?.()?.length || 0) - max + 1" />
        <span v-if="!$slots['overflow']" class="flex size-full items-center justify-center font-medium">
          +{{ ($slots.default?.()?.length || 0) - max + 1 }}
        </span>
      </div>
    </template>
  </div>
</template>
