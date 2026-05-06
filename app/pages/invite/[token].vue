<script setup lang="ts">
import { Mail, Users } from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

definePageMeta({ auth: false, layout: false })

const route = useRoute()
const token = computed(() => String(route.params.token))

const { loggedIn } = useUserSession()

// Placeholder until /api/invite/[token] exists. Replace with a real fetch
// that resolves the token to workspace + inviter info, or 404s.
const invite = ref({
  workspace: 'Acme Inc',
  role: 'Member',
  inviter: { name: 'Alice Chen', email: 'alice@acme.com' },
  email: 'you@acme.com',
})

useHead(() => ({ title: `Join ${invite.value.workspace}` }))

const initials = computed(() =>
  invite.value.inviter.name
    .split(' ')
    .map(s => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase(),
)

function accept() {
  if (!loggedIn.value) {
    navigateTo(`/login?next=/invite/${token.value}`)
    return
  }
  // POST /api/invite/[token]/accept when backend lands.
  navigateTo('/dashboard')
}

function decline() {
  navigateTo('/')
}
</script>

<template>
  <div class="bg-background text-foreground min-h-screen">
    <main class="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <Card>
        <CardHeader class="items-center text-center">
          <Avatar class="size-12">
            <AvatarFallback>{{ initials }}</AvatarFallback>
          </Avatar>
          <CardTitle class="pt-3 text-xl">
            Join {{ invite.workspace }}
          </CardTitle>
          <CardDescription>
            <span class="text-foreground font-medium">{{ invite.inviter.name }}</span>
            invited you to join <span class="text-foreground font-medium">{{ invite.workspace }}</span> as a {{ invite.role }}.
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-3">
          <div class="text-muted-foreground flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
            <Mail class="size-4" />
            <span>Invited email: <span class="text-foreground">{{ invite.email }}</span></span>
          </div>
          <div class="text-muted-foreground flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
            <Users class="size-4" />
            <span>Role: <span class="text-foreground">{{ invite.role }}</span></span>
          </div>
          <div class="flex flex-col gap-2 pt-2">
            <Button
              class="w-full"
              @click="accept"
            >
              Accept invite
            </Button>
            <Button
              variant="ghost"
              class="w-full"
              @click="decline"
            >
              Decline
            </Button>
          </div>
          <p class="text-muted-foreground text-center text-xs">
            Token: <code>{{ token }}</code>
          </p>
        </CardContent>
      </Card>
    </main>
  </div>
</template>
