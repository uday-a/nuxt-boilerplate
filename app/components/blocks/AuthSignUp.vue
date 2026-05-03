<script setup lang="ts">
import { computed, ref } from 'vue'
import { Github, Chrome } from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'

const { t } = useI18n()

withDefaults(
  defineProps<{
    title?: string
    description?: string
    signInHref?: string
    termsHref?: string
    privacyHref?: string
    oauthProviders?: Array<'github' | 'google'>
  }>(),
  {
    title: undefined,
    description: undefined,
    signInHref: '/login',
    termsHref: '#',
    privacyHref: '#',
    oauthProviders: () => ['github', 'google'],
  },
)

const emit = defineEmits<{
  (e: 'submit', payload: { name: string; email: string; password: string }): void
  (e: 'oauth', provider: 'github' | 'google'): void
}>()

const name = ref('')
const email = ref('')
const password = ref('')
const confirm = ref('')
const accept = ref(false)

const passwordsMatch = computed(() => !confirm.value || password.value === confirm.value)
const canSubmit = computed(() => name.value && email.value && password.value && passwordsMatch.value && accept.value)

function onSubmit() {
  if (!canSubmit.value) return
  emit('submit', { name: name.value, email: email.value, password: password.value })
}
</script>

<template>
  <div class="bg-background flex min-h-svh items-center justify-center p-6">
    <Card class="w-full max-w-md">
      <CardHeader class="text-center">
        <h1 class="text-2xl leading-none font-semibold tracking-tight">{{ title ?? t('auth.signUp.title') }}</h1>
        <CardDescription>{{ description ?? t('auth.signUp.description') }}</CardDescription>
      </CardHeader>
      <CardContent>
        <form class="space-y-4" @submit.prevent="onSubmit">
          <div class="grid gap-2">
            <Label for="signup-name">{{ t('auth.signUp.nameLabel') }}</Label>
            <Input id="signup-name" v-model="name" autocomplete="name" required />
          </div>
          <div class="grid gap-2">
            <Label for="signup-email">{{ t('auth.signUp.emailLabel') }}</Label>
            <Input
              id="signup-email"
              v-model="email"
              type="email"
              :placeholder="t('auth.signUp.emailPlaceholder')"
              autocomplete="email"
              required
            />
          </div>
          <div class="grid gap-2">
            <Label for="signup-password">{{ t('auth.signUp.passwordLabel') }}</Label>
            <Input id="signup-password" v-model="password" type="password" autocomplete="new-password" required />
            <p class="text-muted-foreground text-xs">{{ t('auth.signUp.passwordHint') }}</p>
          </div>
          <div class="grid gap-2">
            <Label for="signup-confirm">{{ t('auth.signUp.confirmLabel') }}</Label>
            <Input
              id="signup-confirm"
              v-model="confirm"
              type="password"
              autocomplete="new-password"
              :aria-invalid="!passwordsMatch"
              required
            />
            <p v-if="!passwordsMatch" class="text-destructive text-xs">{{ t('auth.signUp.passwordsMismatch') }}</p>
          </div>
          <div class="flex items-start gap-2">
            <Checkbox id="signup-accept" v-model="accept" />
            <Label for="signup-accept" class="text-sm leading-snug font-normal">
              {{ t('auth.signUp.agreePrefix') }}
              <a :href="termsHref" class="text-foreground underline-offset-4 hover:underline">{{ t('auth.signUp.termsLink') }}</a>
              {{ t('auth.signUp.agreeJoiner') }}
              <a :href="privacyHref" class="text-foreground underline-offset-4 hover:underline">{{ t('auth.signUp.privacyLink') }}</a>.
            </Label>
          </div>
          <Button type="submit" class="w-full" :disabled="!canSubmit">{{ t('auth.signUp.submit') }}</Button>
        </form>

        <template v-if="oauthProviders.length > 0">
          <div class="my-6 flex items-center gap-3">
            <Separator class="flex-1" />
            <span class="text-muted-foreground text-xs uppercase">{{ t('auth.signUp.orContinueWith') }}</span>
            <Separator class="flex-1" />
          </div>
          <div class="grid gap-2" :class="oauthProviders.length > 1 ? 'sm:grid-cols-2' : ''">
            <Button v-if="oauthProviders.includes('github')" variant="outline" type="button" @click="emit('oauth', 'github')">
              <Github class="mr-2 size-4" />GitHub
            </Button>
            <Button v-if="oauthProviders.includes('google')" variant="outline" type="button" @click="emit('oauth', 'google')">
              <Chrome class="mr-2 size-4" />Google
            </Button>
          </div>
        </template>
      </CardContent>
      <CardFooter class="justify-center">
        <p class="text-muted-foreground text-sm">
          {{ t('auth.signUp.hasAccount') }}
          <a :href="signInHref" class="text-foreground font-medium underline-offset-4 hover:underline">{{ t('auth.signUp.signInLink') }}</a>
        </p>
      </CardFooter>
    </Card>
  </div>
</template>
