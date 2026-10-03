<script setup lang="ts">
import { ref } from 'vue'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'

const sliderValue = ref([65])
</script>

<template>
  <div class="max-w-sm space-y-2">
    <Label for="ui-kit-slider">Slider (<span class="tabular-nums">{{ sliderValue[0] }}%</span>)</Label>
    <Slider
      id="ui-kit-slider"
      v-model="sliderValue"
      :min="0"
      :max="100"
      :step="1"
      aria-label="Demo slider"
    />
  </div>
</template>
