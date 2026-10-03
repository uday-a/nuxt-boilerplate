<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ShieldCheck, RotateCw } from '@/lib/icon-pack'
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PinInput, PinInputGroup, PinInputSlot } from '@/components/ui/pin-input'

const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    title?: string
    description?: string
    continueHref?: string
    recoveryHref?: string
    demoCode?: string
  }>(),
  {
    title: undefined,
    description: undefined,
    continueHref: '/',
    recoveryHref: '#',
    demoCode: '123456',
  },
)

const emit = defineEmits<{
  (e: 'verify', code: string): void
  (e: 'resend'): void
  (e: 'continue'): void
}>()

const code = ref<string[]>([])
const verifying = ref(false)
const verified = ref(false)
const error = ref('')
const resendIn = ref(0)

const joined = computed(() => code.value.join(''))

watch(joined, (val) => {
  if (val.length === 6) {
    error.value = ''
    verifying.value = true
    emit('verify', val)
    setTimeout(() => {
      verifying.value = false
      if (val === props.demoCode) verified.value = true
      else {
        error.value = t('auth.mfa.invalidCode', { code: props.demoCode })
        code.value = []
      }
    }, 700)
  }
})

function startResendCooldown() {
  resendIn.value = 30
  emit('resend')
  const t = setInterval(() => {
    resendIn.value -= 1
    if (resendIn.value <= 0) clearInterval(t)
  }, 1000)
}
</script>

<template>
  <div class="bg-background flex min-h-svh items-center justify-center p-4">
    <Card class="w-full max-w-sm">
      <template v-if="!verified">
        <CardHeader class="text-center">
          <div class="bg-primary/10 text-primary mx-auto mb-2 flex size-12 items-center justify-center rounded-full">
            <ShieldCheck
              class="size-6"
              aria-hidden="true"
            />
          </div>
          <h1 class="text-2xl leading-tight font-semibold tracking-tight">
            {{ title ?? t('auth.mfa.title') }}
          </h1>
          <CardDescription>{{ description ?? t('auth.mfa.description') }}</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex justify-center">
            <PinInput
              v-model="code"
              otp
              :disabled="verifying"
            >
              <PinInputGroup>
                <PinInputSlot
                  v-for="i in 6"
                  :key="i"
                  :index="i - 1"
                />
              </PinInputGroup>
            </PinInput>
          </div>
          <p
            v-if="verifying"
            class="text-muted-foreground text-center text-sm"
          >
            {{ t('auth.mfa.verifying') }}
          </p>
          <p
            v-if="error"
            class="text-destructive text-center text-sm"
          >
            {{ error }}
          </p>
          <div class="text-center">
            <button
              v-if="resendIn === 0"
              type="button"
              class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs underline-offset-4 hover:underline"
              @click="startResendCooldown"
            >
              <RotateCw
                class="size-3.5"
                aria-hidden="true"
              />{{ t('auth.mfa.resend') }}
            </button>
            <p
              v-else
              class="text-muted-foreground text-xs"
            >
              {{ t('auth.mfa.resendCooldown', { seconds: resendIn }) }}
            </p>
          </div>
        </CardContent>
        <CardFooter class="justify-center">
          <p class="text-muted-foreground text-xs">
            {{ t('auth.mfa.lostDevicePrefix') }}
            <a
              :href="recoveryHref"
              class="text-foreground underline-offset-4 hover:underline"
            >{{ t('auth.mfa.recoveryLink') }}</a>
          </p>
        </CardFooter>
      </template>

      <template v-else>
        <CardContent class="space-y-4 pt-4 text-center">
          <div class="mx-auto flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
            <ShieldCheck
              class="size-6"
              aria-hidden="true"
            />
          </div>
          <div class="space-y-1">
            <h3 class="text-2xl font-semibold tracking-tight">
              {{ t('auth.mfa.verifiedTitle') }}
            </h3>
            <p class="text-muted-foreground text-sm">
              {{ t('auth.mfa.verifiedDescription') }}
            </p>
          </div>
          <Button
            as-child
            class="w-full"
          >
            <a
              :href="continueHref"
              @click="emit('continue')"
            >{{ t('auth.mfa.continue') }}</a>
          </Button>
        </CardContent>
      </template>
    </Card>
  </div>
</template>
