<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tour, type TourStep } from '@/components/ui/tour'

const open = ref(false)
const current = ref(0)
const searchEl = useTemplateRef<HTMLElement>('searchEl')
const createEl = useTemplateRef<HTMLElement>('createEl')

const steps: TourStep[] = [
  { target: () => searchEl.value, title: 'Search', description: 'Find any project by name.' },
  { target: () => createEl.value, title: 'Create', description: 'Start a new project here.' },
]

function start() {
  current.value = 0
  open.value = true
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center gap-2">
      <div
        ref="searchEl"
        class="flex-1"
      >
        <Input
          placeholder="Search projects"
          aria-label="Search projects"
        />
      </div>
      <div ref="createEl">
        <Button size="sm">
          New project
        </Button>
      </div>
    </div>
    <Button
      variant="outline"
      size="sm"
      @click="start"
    >
      Start tour
    </Button>
    <Tour
      v-model:open="open"
      v-model:current="current"
      :steps="steps"
    />
  </div>
</template>
