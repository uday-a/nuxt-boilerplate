<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowLeft, MailCheck } from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const { t } = useI18n()

withDefaults(
  defineProps<{
    signInHref?: string
  }>(),
  { signInHref: '/login' },
)

const emit = defineEmits<{
  (e: 'request', email: string): void
  (e: 'reset', password: string): void
}>()

type Stage = 'request' | 'sent' | 'reset' | 'done'
const stage = ref<Stage>('request')

const email = ref('')
const password = ref('')
const confirm = ref('')
const passwordsMatch = computed(() => !confirm.value || password.value === confirm.value)

function submitRequest() {
  if (!email.value) return
  emit('request', email.value)
  stage.value = 'sent'
}

function submitReset() {
  if (!password.value || !passwordsMatch.value) return
  emit('reset', password.value)
  stage.value = 'done'
}
</script>

<template>
  <div class="bg-background flex min-h-svh items-center justify-center p-6">
    <h1 class="sr-only">{{ t('auth.passwordReset.srTitle') }}</h1>
    <Card class="w-full max-w-sm">
      <template v-if="stage === 'request'">
        <CardHeader class="text-center">
          <CardTitle class="text-2xl">{{ t('auth.passwordReset.request.title') }}</CardTitle>
          <CardDescription>{{ t('auth.passwordReset.request.description') }}</CardDescription>
        </CardHeader>
        <CardContent>
          <form class="space-y-4" @submit.prevent="submitRequest">
            <div class="grid gap-2">
              <Label for="reset-email">{{ t('auth.passwordReset.request.emailLabel') }}</Label>
              <Input id="reset-email" v-model="email" type="email" :placeholder="t('auth.passwordReset.request.emailPlaceholder')" required />
            </div>
            <Button type="submit" class="w-full">{{ t('auth.passwordReset.request.submit') }}</Button>
          </form>
        </CardContent>
        <CardFooter class="justify-center">
          <a
            :href="signInHref"
            class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
          >
            <ArrowLeft class="size-3" />{{ t('auth.passwordReset.request.back') }}
          </a>
        </CardFooter>
      </template>

      <template v-else-if="stage === 'sent'">
        <CardContent class="space-y-4 pt-6 text-center">
          <div class="bg-primary/10 text-primary mx-auto flex size-12 items-center justify-center rounded-full">
            <MailCheck class="size-6" />
          </div>
          <div class="space-y-1">
            <h3 class="text-lg font-semibold">{{ t('auth.passwordReset.sent.title') }}</h3>
            <p class="text-muted-foreground text-sm">
              {{ t('auth.passwordReset.sent.descriptionPrefix') }} <span class="text-foreground font-medium">{{ email }}</span>{{ t('auth.passwordReset.sent.descriptionSuffix') }}
            </p>
          </div>
          <Button variant="outline" class="w-full" @click="stage = 'reset'">{{ t('auth.passwordReset.sent.openDemo') }}</Button>
          <button
            class="text-muted-foreground hover:text-foreground text-xs underline-offset-4 hover:underline"
            @click="stage = 'request'"
          >
            {{ t('auth.passwordReset.sent.wrongEmail') }}
          </button>
        </CardContent>
      </template>

      <template v-else-if="stage === 'reset'">
        <CardHeader class="text-center">
          <CardTitle class="text-2xl">{{ t('auth.passwordReset.reset.title') }}</CardTitle>
          <CardDescription>{{ t('auth.passwordReset.reset.description') }}</CardDescription>
        </CardHeader>
        <CardContent>
          <form class="space-y-4" @submit.prevent="submitReset">
            <div class="grid gap-2">
              <Label for="reset-pw">{{ t('auth.passwordReset.reset.passwordLabel') }}</Label>
              <Input id="reset-pw" v-model="password" type="password" autocomplete="new-password" required />
            </div>
            <div class="grid gap-2">
              <Label for="reset-confirm">{{ t('auth.passwordReset.reset.confirmLabel') }}</Label>
              <Input
                id="reset-confirm"
                v-model="confirm"
                type="password"
                autocomplete="new-password"
                :aria-invalid="!passwordsMatch"
                required
              />
              <p v-if="!passwordsMatch" class="text-destructive text-xs">{{ t('auth.passwordReset.reset.passwordsMismatch') }}</p>
            </div>
            <Button type="submit" class="w-full">{{ t('auth.passwordReset.reset.submit') }}</Button>
          </form>
        </CardContent>
      </template>

      <template v-else>
        <CardContent class="space-y-4 pt-6 text-center">
          <div class="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <MailCheck class="size-6" />
          </div>
          <div class="space-y-1">
            <h3 class="text-lg font-semibold">{{ t('auth.passwordReset.done.title') }}</h3>
            <p class="text-muted-foreground text-sm">
              {{ t('auth.passwordReset.done.description') }}
            </p>
          </div>
          <a :href="signInHref"><Button class="w-full">{{ t('auth.passwordReset.done.submit') }}</Button></a>
        </CardContent>
      </template>
    </Card>
  </div>
</template>
