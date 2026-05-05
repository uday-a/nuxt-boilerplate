<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Account · Settings' })

const { user } = useUserSession()

const name = ref(user.value?.name ?? '')
const email = ref(user.value?.email ?? '')
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const initials = computed(() =>
  (name.value || 'U')
    .split(' ')
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase(),
)
</script>

<template>
  <div class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-semibold tracking-tight">Account</h1>
      <p class="text-muted-foreground text-sm">Your personal profile and credentials.</p>
    </header>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">Profile</CardTitle>
        <CardDescription>How you appear in the workspace.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex items-center gap-4">
          <Avatar class="size-16">
            <AvatarImage v-if="user?.avatar" :src="user.avatar" :alt="name" />
            <AvatarFallback>{{ initials }}</AvatarFallback>
          </Avatar>
          <div class="space-y-1">
            <Button variant="outline" size="sm">Upload photo</Button>
            <p class="text-muted-foreground text-xs">PNG or JPG, up to 2MB.</p>
          </div>
        </div>
        <div class="grid gap-2">
          <Label for="acct-name">Full name</Label>
          <Input id="acct-name" v-model="name" />
        </div>
        <div class="grid gap-2">
          <Label for="acct-email">Email</Label>
          <Input id="acct-email" v-model="email" type="email" />
          <p class="text-muted-foreground text-xs">Changing your email requires reverification.</p>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">Password</CardTitle>
        <CardDescription>Use 12+ characters with a mix of letters, numbers, and symbols.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="grid gap-2">
          <Label for="pw-current">Current password</Label>
          <Input id="pw-current" v-model="currentPassword" type="password" />
        </div>
        <div class="grid gap-2">
          <Label for="pw-new">New password</Label>
          <Input id="pw-new" v-model="newPassword" type="password" />
        </div>
        <div class="grid gap-2">
          <Label for="pw-confirm">Confirm new password</Label>
          <Input id="pw-confirm" v-model="confirmPassword" type="password" />
        </div>
      </CardContent>
    </Card>

    <Card class="border-destructive/40">
      <CardHeader>
        <CardTitle class="text-base text-destructive">Danger zone</CardTitle>
        <CardDescription>Irreversible account actions.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex items-start justify-between gap-6">
          <div class="space-y-0.5">
            <p class="text-sm font-medium">Delete account</p>
            <p class="text-muted-foreground text-xs">Permanently remove your account and all personal data. Workspace data is retained per your billing plan.</p>
          </div>
          <Button variant="destructive">Delete account</Button>
        </div>
        <Separator />
        <div class="flex items-start justify-between gap-6">
          <div class="space-y-0.5">
            <p class="text-sm font-medium">Export data</p>
            <p class="text-muted-foreground text-xs">Download a JSON archive of your personal data.</p>
          </div>
          <Button variant="outline">Request export</Button>
        </div>
      </CardContent>
    </Card>

    <div class="flex justify-end gap-2">
      <Button variant="outline">Cancel</Button>
      <Button>Save changes</Button>
    </div>
  </div>
</template>
