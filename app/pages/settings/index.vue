<script setup lang="ts">
import { Settings2, UserCircle, ShieldCheck, KeyRound, Bell, Plug, Users, History, CreditCard, Gauge } from '@/lib/icon-pack'
import { Card } from '@/components/ui/card'
import { IconBox } from '@/components/ui/icon-box'
import { Page, PageHeader, PageHeaderHeading, PageBody } from '@/components/ui/page'
import { SAMPLE_PLAN, SAMPLE_USAGE, usagePct } from '@/lib/usage-mock'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
const title = useRouteLabel()
useHead({ title })

const { t, locale } = useI18n()

const apiCalls = SAMPLE_USAGE.find(u => u.id === 'api-calls')!
const renews = new Date(SAMPLE_PLAN.renews).toLocaleDateString(locale.value, { month: 'short', day: 'numeric' })

// Titles come from the same nav.items.* labels as the sidebar and the
// page H1, so a card never names its page differently.
const sections = computed(() => [
  { slug: 'general', icon: Settings2, title: t('nav.items.general'), description: 'Workspace name, URL, locale and defaults.', meta: 'Acme Inc' },
  { slug: 'account', icon: UserCircle, title: t('nav.items.account'), description: 'Profile, email, password and account deletion.', meta: 'Personal' },
  { slug: 'security', icon: ShieldCheck, title: t('nav.items.security'), description: 'Two-factor auth and active sessions.', meta: '2 active sessions' },
  { slug: 'api-keys', icon: KeyRound, title: t('nav.items.apiKeys'), description: 'Scoped keys for scripts, CLIs and integrations.', meta: 'Read or read-write scopes' },
  { slug: 'notifications', icon: Bell, title: t('nav.items.notifications'), description: 'Email and in-app delivery preferences.', meta: 'Email · in-app' },
  { slug: 'integrations', icon: Plug, title: t('nav.items.integrations'), description: 'Connected apps and webhooks.', meta: '1 connected' },
  { slug: 'team', icon: Users, title: t('nav.items.team'), description: 'Members, roles and invitations.', meta: '8 members · 2 pending' },
  { slug: 'activity', icon: History, title: t('nav.items.activityLog'), description: 'Audit trail of sign-ins and changes.', meta: 'Workspace-wide' },
  { slug: 'billing', icon: CreditCard, title: t('nav.items.billing'), description: 'Plan, payment method and invoices.', meta: `${SAMPLE_PLAN.name} · renews ${renews}` },
  { slug: 'limits', icon: Gauge, title: t('nav.items.limits'), description: 'Quotas and per-key rate limits.', meta: `${usagePct(apiCalls)}% of API calls used` },
])
</script>

<template>
  <Page>
    <PageHeader>
      <PageHeaderHeading
        :title="title"
        description="Workspace configuration. Changes apply to all members."
      />
    </PageHeader>

    <PageBody>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <NuxtLink
          v-for="s in sections"
          :key="s.slug"
          :to="`/settings/${s.slug}`"
          class="group focus-visible:ring-ring/50 block rounded-xl outline-none focus-visible:ring-[3px]"
        >
          <Card class="group-hover:border-foreground/20 group-hover:bg-muted/40 flex h-full flex-row items-start gap-4 p-4 transition-colors">
            <IconBox
              :icon="s.icon"
              size="md"
              aria-hidden="true"
            />
            <div class="min-w-0 flex-1 space-y-1">
              <p class="text-sm font-semibold">
                {{ s.title }}
              </p>
              <p class="text-muted-foreground text-xs">
                {{ s.description }}
              </p>
              <p class="text-muted-foreground pt-1 text-xs tabular-nums">
                {{ s.meta }}
              </p>
            </div>
          </Card>
        </NuxtLink>
      </div>
    </PageBody>
  </Page>
</template>
