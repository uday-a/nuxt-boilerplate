<script setup lang="ts">
import { computed } from 'vue'
import { routeLabel } from '@/lib/breadcrumb-labels'

// Nuxt's auto-imported useRoute (not vue-router's): the vue-router one
// resolved to undefined in this layout during page transitions.
const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const breadcrumbs = computed(() => {
  const parts = (route?.path ?? '').split('/').filter(Boolean)
  if (parts.length === 0) return [{ label: t('nav.items.dashboard') }]
  return parts.map((_, i) => {
    const path = '/' + parts.slice(0, i + 1).join('/')
    return { label: routeLabel(path, t), href: i < parts.length - 1 ? path : undefined }
  })
})

const { user: sessionUser, clear } = useUserSession()
const user = computed(() => {
  const u = sessionUser.value as { firstName?: string, lastName?: string, email?: string, profilePictureUrl?: string, avatar?: string | null, name?: string, login?: string } | undefined
  if (!u) return { name: 'Guest', email: '', avatar: '' }
  const name = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.name || u.login || u.email || 'Guest'
  return { name, email: u.email ?? '', avatar: u.avatar ?? u.profilePictureUrl ?? '' }
})

async function onProfileSelect(key: string) {
  if (key === 'logout') {
    await clear()
    await $fetch('/auth/logout', { method: 'POST' }).catch(() => undefined)
    await router.push('/login')
    return
  }
  if (key === 'account') router.push('/settings/account')
  if (key === 'billing') router.push('/settings/billing')
  if (key === 'settings') router.push('/settings')
}

function onCommandSelect(item: { label: string, hint?: string }) {
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
