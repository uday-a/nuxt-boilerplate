<script setup lang="ts">
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getInitials } from '@/composables/useKanban'
import { cn } from '@/lib/utils'

defineProps<{
  name: string
  color: string
  size?: 'xs' | 'sm' | 'md'
  class?: string
}>()

const sizeMap = {
  xs: { avatar: 'size-6', text: 'text-[8px]' },
  sm: { avatar: 'size-7', text: 'text-[9px]' },
  md: { avatar: 'size-8', text: 'text-[11px]' },
}
</script>

<template>
  <Avatar :class="cn(sizeMap[size ?? 'sm'].avatar, 'shrink-0', $props.class)">
    <AvatarFallback :class="[sizeMap[size ?? 'sm'].text, 'font-bold', color]">
      {{ getInitials(name) }}
    </AvatarFallback>
  </Avatar>
</template>
