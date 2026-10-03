<script setup lang="ts">
import { ref } from 'vue'
import { Label } from '@/components/ui/label'
import { PinInput, PinInputGroup, PinInputSeparator, PinInputSlot } from '@/components/ui/pin-input'

const otpValue = ref<string[]>([])
</script>

<template>
  <div class="space-y-2">
    <Label>Verification code</Label>
    <PinInput
      v-model="otpValue"
      class="flex gap-2"
      otp
    >
      <PinInputGroup>
        <PinInputSlot :index="0" />
        <PinInputSlot :index="1" />
        <PinInputSlot :index="2" />
        <PinInputSeparator />
        <PinInputSlot :index="3" />
        <PinInputSlot :index="4" />
        <PinInputSlot :index="5" />
      </PinInputGroup>
    </PinInput>
  </div>
</template>
