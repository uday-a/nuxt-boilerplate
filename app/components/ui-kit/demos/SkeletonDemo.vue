<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

const loading = ref(true)
let timer: ReturnType<typeof setTimeout> | undefined

function replay() {
  loading.value = true
  clearTimeout(timer)
  timer = setTimeout(() => (loading.value = false), 2000)
}

onMounted(replay)
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div class="space-y-4">
    <div
      v-if="loading"
      class="space-y-2"
    >
      <div class="flex items-center gap-2">
        <Skeleton class="size-10 rounded-full" />
        <div class="space-y-1">
          <Skeleton class="h-2 w-24" />
          <Skeleton class="h-2 w-32" />
        </div>
      </div>
      <Skeleton class="h-2 w-full" />
      <Skeleton class="h-2 w-3/4" />
    </div>
    <div
      v-else
      class="space-y-2 text-sm"
    >
      <div class="flex items-center gap-2">
        <Avatar class="size-10">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <div>
          <p class="font-medium">
            John Doe
          </p>
          <p class="text-muted-foreground text-xs">
            john.doe@example.com
          </p>
        </div>
      </div>
      <p class="text-muted-foreground">
        Content loaded.
      </p>
    </div>
    <Button
      variant="outline"
      size="sm"
      @click="replay"
    >
      Replay
    </Button>
  </div>
</template>
