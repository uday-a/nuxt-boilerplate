<script setup lang="ts">
import { Check, ArrowRight } from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

definePageMeta({ middleware: 'auth', layout: false })
useHead({ title: 'Welcome · Acme' })

const steps = ['Profile', 'Workspace', 'Invite'] as const
const step = ref<0 | 1 | 2>(0)

const fullName = ref('')
const role = ref('')
const workspaceName = ref('')
const workspaceSize = ref('1-5')
const invites = ref('')

function next() {
  if (step.value < 2) step.value = (step.value + 1) as 0 | 1 | 2
  else navigateTo('/dashboard')
}
function back() {
  if (step.value > 0) step.value = (step.value - 1) as 0 | 1 | 2
}
function skip() {
  navigateTo('/dashboard')
}
</script>

<template>
  <div class="bg-background text-foreground min-h-screen">
    <main class="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-12">
      <ol class="mb-6 flex items-center gap-3 text-xs">
        <li v-for="(label, i) in steps" :key="label" class="flex items-center gap-2">
          <span
            class="flex size-6 items-center justify-center rounded-full border text-[11px] font-medium"
            :class="i < step ? 'bg-primary text-primary-foreground border-primary' : i === step ? 'border-foreground text-foreground' : 'text-muted-foreground'"
          >
            <Check v-if="i < step" class="size-3" />
            <template v-else>{{ i + 1 }}</template>
          </span>
          <span :class="i === step ? 'font-medium' : 'text-muted-foreground'">{{ label }}</span>
          <ArrowRight v-if="i < steps.length - 1" class="text-muted-foreground size-3" />
        </li>
      </ol>

      <Card>
        <CardHeader>
          <CardTitle class="text-xl">
            <template v-if="step === 0">Tell us about you</template>
            <template v-else-if="step === 1">Create your workspace</template>
            <template v-else>Invite your team</template>
          </CardTitle>
          <CardDescription>
            <template v-if="step === 0">Helps us tailor the dashboard to your role.</template>
            <template v-else-if="step === 1">Where all your work will live. You can rename it later.</template>
            <template v-else>Optional. You can invite more people anytime from Settings → Team.</template>
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <template v-if="step === 0">
            <div class="grid gap-2">
              <Label for="onb-name">Full name</Label>
              <Input id="onb-name" v-model="fullName" placeholder="Ada Lovelace" />
            </div>
            <div class="grid gap-2">
              <Label>Your role</Label>
              <Select v-model="role">
                <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="engineer">Engineering</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="pm">Product</SelectItem>
                  <SelectItem value="ops">Operations</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </template>

          <template v-else-if="step === 1">
            <div class="grid gap-2">
              <Label for="onb-ws">Workspace name</Label>
              <Input id="onb-ws" v-model="workspaceName" placeholder="Acme Inc" />
            </div>
            <div class="grid gap-2">
              <Label>Team size</Label>
              <Select v-model="workspaceSize">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-5">1–5</SelectItem>
                  <SelectItem value="6-20">6–20</SelectItem>
                  <SelectItem value="21-100">21–100</SelectItem>
                  <SelectItem value="100+">100+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </template>

          <template v-else>
            <div class="grid gap-2">
              <Label for="onb-invites">Emails (comma-separated)</Label>
              <Input id="onb-invites" v-model="invites" placeholder="alice@acme.com, bob@acme.com" />
              <p class="text-muted-foreground text-xs">We’ll send each one an invite link.</p>
            </div>
          </template>
        </CardContent>
      </Card>

      <div class="mt-6 flex items-center justify-between">
        <Button v-if="step > 0" variant="ghost" @click="back">Back</Button>
        <Button v-else variant="ghost" @click="skip">Skip setup</Button>
        <Button @click="next">
          {{ step === 2 ? 'Finish' : 'Continue' }}
        </Button>
      </div>
    </main>
  </div>
</template>
