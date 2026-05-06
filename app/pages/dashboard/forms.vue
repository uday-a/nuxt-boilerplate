<script setup lang="ts">
import { ref } from 'vue'
import { Bell, Check, Loader2, Languages } from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Account settings' })

// Single bundled form for the demo. State lives in plain refs -- swap
// for @tanstack/vue-form when validation logic gets non-trivial. Each
// field is bound via v-model so the primitives demonstrate their full
// controlled API.

const profile = ref({
  name: 'Alex Morgan',
  email: 'alex@acme.example',
  bio: 'Eng lead. Owns the platform team. Coffee → code → repeat.',
})

const account = ref({
  password: '',
  timezone: 'utc',
  visibility: 'team' as 'private' | 'team' | 'public',
})

// Language preference is owned by @nuxtjs/i18n: changes flush to the
// i18n cookie immediately and persist across reloads — no Save needed.
const { locale, locales, setLocale } = useI18n()
const languageOptions = computed(() =>
  (unref(locales) as { code: string, name?: string }[]).map(l => ({
    code: l.code,
    label: l.name || l.code.toUpperCase(),
  })),
)
// reka-ui's Select emits `AcceptableValue` (object | string | number | boolean
// | null); we only ever bind string locale codes, so coerce.
async function onLocaleChange(next: unknown) {
  if (typeof next === 'string') await setLocale(next as 'en' | 'es')
}

const notifications = ref({
  email: true,
  push: false,
  weekly: ['product', 'security'] as string[],
})

const NOTIFICATION_OPTIONS = [
  { value: 'product', label: 'Product updates' },
  { value: 'security', label: 'Security alerts' },
  { value: 'billing', label: 'Billing & receipts' },
  { value: 'marketing', label: 'Marketing & promotions' },
]

const billing = ref({
  seats: 12,
})

const submitting = ref(false)
const savedAt = ref<string | null>(null)

function toggleNotification(value: string, checked: boolean) {
  const next = new Set(notifications.value.weekly)
  if (checked) next.add(value)
  else next.delete(value)
  notifications.value.weekly = Array.from(next)
}

async function onSubmit(e: Event) {
  e.preventDefault()
  submitting.value = true
  // Fake latency so the loading state is visible.
  await new Promise(r => setTimeout(r, 700))
  submitting.value = false
  savedAt.value = new Date().toLocaleTimeString()
}
</script>

<template>
  <form
    class="space-y-4"
    @submit="onSubmit"
  >
    <header class="flex items-end justify-between gap-4">
      <div class="space-y-1">
        <h1 class="text-2xl font-semibold tracking-tight">
          Account settings
        </h1>
        <p class="text-muted-foreground text-sm">
          Update your profile, notification preferences, and billing.
        </p>
      </div>
      <div class="flex items-center gap-3">
        <span
          v-if="savedAt"
          class="text-muted-foreground inline-flex items-center gap-1 text-xs"
        >
          <Check class="size-3 text-emerald-600" />Saved at {{ savedAt }}
        </span>
        <Button
          type="submit"
          size="sm"
          :disabled="submitting"
          class="gap-1.5"
        >
          <Loader2
            v-if="submitting"
            class="size-3.5 animate-spin"
          />
          {{ submitting ? 'Saving…' : 'Save changes' }}
        </Button>
      </div>
    </header>

    <!-- Profile -->
    <Card>
      <CardHeader class="pb-3">
        <CardTitle class="text-base">
          Profile
        </CardTitle>
        <CardDescription>Public information shown alongside your activity.</CardDescription>
      </CardHeader>
      <CardContent class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-1.5">
          <Label for="name">Full name</Label>
          <Input
            id="name"
            v-model="profile.name"
            placeholder="Jane Doe"
          />
        </div>
        <div class="space-y-1.5">
          <Label for="email">Work email</Label>
          <Input
            id="email"
            v-model="profile.email"
            type="email"
            placeholder="you@company.com"
          />
        </div>
        <div class="space-y-1.5 sm:col-span-2">
          <Label for="bio">Short bio</Label>
          <Textarea
            id="bio"
            v-model="profile.bio"
            :rows="3"
            :maxlength="280"
            placeholder="Tell people what you work on…"
          />
          <p class="text-muted-foreground text-[11px] tabular-nums">
            {{ profile.bio.length }} / 280
          </p>
        </div>
      </CardContent>
    </Card>

    <!-- Account -->
    <Card>
      <CardHeader class="pb-3">
        <CardTitle class="text-base">
          Account
        </CardTitle>
        <CardDescription>Security and visibility settings.</CardDescription>
      </CardHeader>
      <CardContent class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-1.5">
          <Label for="password">New password</Label>
          <Input
            id="password"
            v-model="account.password"
            type="password"
            placeholder="Leave blank to keep current"
            show-password-toggle
          />
        </div>
        <div class="space-y-1.5">
          <Label for="tz">Timezone</Label>
          <Select v-model="account.timezone">
            <SelectTrigger id="tz">
              <SelectValue placeholder="Pick a timezone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="utc">
                UTC · Coordinated Universal Time
              </SelectItem>
              <SelectItem value="pst">
                PST · Pacific (UTC−8)
              </SelectItem>
              <SelectItem value="est">
                EST · Eastern (UTC−5)
              </SelectItem>
              <SelectItem value="cet">
                CET · Central European (UTC+1)
              </SelectItem>
              <SelectItem value="jst">
                JST · Japan (UTC+9)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="space-y-1.5 sm:col-span-2">
          <Label
            for="language"
            class="inline-flex items-center gap-1.5"
          >
            <Languages class="size-3.5" />Language
          </Label>
          <Select
            :model-value="locale"
            @update:model-value="onLocaleChange"
          >
            <SelectTrigger
              id="language"
              class="w-full"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="opt in languageOptions"
                :key="opt.code"
                :value="opt.code"
              >
                {{ opt.label }}
              </SelectItem>
            </SelectContent>
          </Select>
          <p class="text-muted-foreground text-xs">
            Switches the UI immediately and is saved in your i18n cookie — no need to hit Save.
          </p>
        </div>
        <div class="space-y-2 sm:col-span-2">
          <Label>Profile visibility</Label>
          <!-- Only pass column-count utilities -- RadioGroup applies the
               `class` prop to BOTH its outer wrapper AND the inner
               RadioGroupRoot, so adding `grid` here would create a
               nested grid and shrink each card to ~1/9 width. The
               inner Root already has `grid gap-3` by default. -->
          <RadioGroup
            v-model="account.visibility"
            class="sm:grid-cols-3"
          >
            <label class="hover:bg-muted/50 has-[[data-state=checked]]:border-primary flex w-full cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors">
              <RadioGroupItem
                value="private"
                class="mt-0.5"
              />
              <div class="flex-1 space-y-0.5">
                <div class="text-sm font-medium leading-none">Private</div>
                <div class="text-muted-foreground text-xs">Only you can see this profile.</div>
              </div>
            </label>
            <label class="hover:bg-muted/50 has-[[data-state=checked]]:border-primary flex w-full cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors">
              <RadioGroupItem
                value="team"
                class="mt-0.5"
              />
              <div class="flex-1 space-y-0.5">
                <div class="text-sm font-medium leading-none">Team</div>
                <div class="text-muted-foreground text-xs">Anyone in your workspace.</div>
              </div>
            </label>
            <label class="hover:bg-muted/50 has-[[data-state=checked]]:border-primary flex w-full cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors">
              <RadioGroupItem
                value="public"
                class="mt-0.5"
              />
              <div class="flex-1 space-y-0.5">
                <div class="text-sm font-medium leading-none">Public</div>
                <div class="text-muted-foreground text-xs">Anyone with the link.</div>
              </div>
            </label>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>

    <!-- Notifications -->
    <Card>
      <CardHeader class="pb-3">
        <CardTitle class="text-base">
          Notifications
        </CardTitle>
        <CardDescription>Pick the channels and topics you want to hear about.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-5">
        <div class="flex items-center justify-between gap-4">
          <div class="space-y-0.5">
            <Label
              for="notify-email"
              class="inline-flex items-center gap-1.5"
            ><Bell class="size-3.5" />Email notifications</Label>
            <p class="text-muted-foreground text-xs">
              Daily digest of activity in your workspace.
            </p>
          </div>
          <Switch
            id="notify-email"
            v-model="notifications.email"
          />
        </div>
        <Separator />
        <div class="flex items-center justify-between gap-4">
          <div class="space-y-0.5">
            <Label for="notify-push">Push notifications</Label>
            <p class="text-muted-foreground text-xs">
              Real-time on mobile when something needs your attention.
            </p>
          </div>
          <Switch
            id="notify-push"
            v-model="notifications.push"
          />
        </div>
        <Separator />
        <div class="space-y-2">
          <Label>Weekly digest topics</Label>
          <div class="grid gap-2 sm:grid-cols-2">
            <label
              v-for="opt in NOTIFICATION_OPTIONS"
              :key="opt.value"
              class="hover:bg-muted/50 flex w-full cursor-pointer items-center gap-2.5 rounded-md border p-2.5 text-sm transition-colors"
            >
              <Checkbox
                :model-value="notifications.weekly.includes(opt.value)"
                @update:model-value="(v) => toggleNotification(opt.value, Boolean(v))"
              />
              {{ opt.label }}
            </label>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Billing -->
    <Card>
      <CardHeader class="pb-3">
        <CardTitle class="text-base">
          Billing
        </CardTitle>
        <CardDescription>Seats and plan size. Charged monthly at $12/seat.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <div class="flex items-baseline justify-between">
            <Label for="billing-seats">Team seats</Label>
            <span class="text-sm tabular-nums">{{ billing.seats }} seats · ${{ (billing.seats * 12).toLocaleString() }}/mo</span>
          </div>
          <Slider
            id="billing-seats"
            v-model="billing.seats"
            :min="1"
            :max="50"
            :step="1"
            aria-label="Team seats"
          />
          <div class="text-muted-foreground flex justify-between text-[11px] tabular-nums">
            <span>1</span>
            <span>50</span>
          </div>
        </div>
      </CardContent>
    </Card>
  </form>
</template>
