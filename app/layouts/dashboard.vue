<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const router = useRouter()

const breadcrumbs = computed(() => {
  const parts = route.path.split('/').filter(Boolean)
  if (parts.length === 0) return [{ label: 'Dashboard' }]
  return parts.map((p, i) => ({
    label: p.charAt(0).toUpperCase() + p.slice(1),
    href: i < parts.length - 1 ? '/' + parts.slice(0, i + 1).join('/') : undefined,
  }))
})

const { user: sessionUser, clear } = useUserSession()
const user = computed(() => {
  const u = sessionUser.value as { firstName?: string; lastName?: string; email?: string; profilePictureUrl?: string } | undefined
  if (!u) return { name: 'Guest', email: '', avatar: '' }
  const name = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email || 'Guest'
  return { name, email: u.email ?? '', avatar: u.profilePictureUrl ?? '' }
})

async function onProfileSelect(key: string) {
  if (key === 'logout') {
    await clear()
    await $fetch('/auth/logout', { method: 'POST' }).catch(() => undefined)
    await router.push('/login')
    return
  }
  if (key === 'account') router.push('/dashboard/profile')
  if (key === 'billing') router.push('/dashboard/billing')
  if (key === 'settings') router.push('/dashboard/settings')
}

function onCommandSelect(item: { label: string; hint?: string }) {
  if (item.hint) router.push(item.hint)
}
</script>

<template>
  <DashboardLayout
    :breadcrumbs="breadcrumbs"
    :user="user"
    @profile-select="onProfileSelect"
    @command-select="onCommandSelect"
  >
    <slot />
  </DashboardLayout>
</template>
