<script setup lang="ts">
import { ref } from 'vue'
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
    signUpHref?: string
    forgotPasswordHref?: string
    oauthProviders?: Array<'github' | 'google'>
  }>(),
  {
    // Defaults intentionally undefined — template falls back to $t() so
    // translations win unless a parent explicitly passes a string prop.
    title: undefined,
    description: undefined,
    signUpHref: '/sign-up',
    forgotPasswordHref: '/forgot-password',
    oauthProviders: () => ['github', 'google'],
  },
)

const emit = defineEmits<{
  (e: 'submit', payload: { email: string; password: string; remember: boolean }): void
  (e: 'oauth', provider: 'github' | 'google'): void
}>()

const email = ref('')
const password = ref('')
const remember = ref(false)

function onSubmit() {
  emit('submit', { email: email.value, password: password.value, remember: remember.value })
}
</script>

<template>
  <div class="bg-background flex min-h-svh items-center justify-center p-6">
    <Card class="w-full max-w-sm">
      <CardHeader class="text-center">
        <h1 class="text-2xl leading-none font-semibold tracking-tight">{{ title ?? t('auth.signIn.title') }}</h1>
        <CardDescription>{{ description ?? t('auth.signIn.description') }}</CardDescription>
      </CardHeader>
      <CardContent>
        <form class="space-y-4" @submit.prevent="onSubmit">
          <div class="grid gap-2">
            <Label for="email">{{ t('auth.signIn.emailLabel') }}</Label>
            <Input
              id="email"
              v-model="email"
              type="email"
              :placeholder="t('auth.signIn.emailPlaceholder')"
              autocomplete="email"
              required
            />
          </div>
          <div class="grid gap-2">
            <div class="flex items-center justify-between">
              <Label for="password">{{ t('auth.signIn.passwordLabel') }}</Label>
              <a
                :href="forgotPasswordHref"
                class="text-muted-foreground hover:text-foreground text-xs underline-offset-4 hover:underline"
              >
                {{ t('auth.signIn.forgotPassword') }}
              </a>
            </div>
            <Input id="password" v-model="password" type="password" autocomplete="current-password" required />
          </div>
          <div class="flex items-center gap-2">
            <Checkbox id="remember" v-model="remember" />
            <Label for="remember" class="text-sm font-normal">{{ t('auth.signIn.rememberMe') }}</Label>
          </div>
          <Button type="submit" class="w-full">{{ t('auth.signIn.submit') }}</Button>
        </form>

        <template v-if="oauthProviders.length > 0">
          <div class="my-6 flex items-center gap-3">
            <Separator class="flex-1" />
            <span class="text-muted-foreground text-xs uppercase">{{ t('auth.signIn.orContinueWith') }}</span>
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
          {{ t('auth.signIn.noAccount') }}
          <a :href="signUpHref" class="text-foreground font-medium underline-offset-4 hover:underline">{{ t('auth.signIn.signUpLink') }}</a>
        </p>
      </CardFooter>
    </Card>
  </div>
</template>
