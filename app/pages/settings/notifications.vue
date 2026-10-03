<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Page, PageHeader, PageHeaderHeading, PageBody } from '@/components/ui/page'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
const title = useRouteLabel()
useHead({ title })

type Channel = { email: boolean, inApp: boolean }
const prefs = reactive<Record<string, Channel>>({
  mentions: { email: true, inApp: true },
  comments: { email: false, inApp: true },
  invites: { email: true, inApp: true },
  weeklyDigest: { email: true, inApp: false },
  productUpdates: { email: false, inApp: true },
  billing: { email: true, inApp: true },
})

const rows: { key: keyof typeof prefs, label: string, description: string }[] = [
  { key: 'mentions', label: 'Mentions', description: 'When someone @-mentions you in a comment or document.' },
  { key: 'comments', label: 'Comments on your items', description: 'New replies on threads you created or are subscribed to.' },
  { key: 'invites', label: 'Workspace invites', description: 'When you’re invited to a workspace or project.' },
  { key: 'weeklyDigest', label: 'Weekly digest', description: 'Mondays · top activity, usage, and outstanding tasks.' },
  { key: 'productUpdates', label: 'Product updates', description: 'New features, changelog highlights.' },
  { key: 'billing', label: 'Billing & invoices', description: 'Receipts, failed payments, plan changes.' },
]
</script>

<template>
  <Page>
    <PageHeader>
      <PageHeaderHeading
        :title="title"
        description="Pick which channels receive which events."
      />
    </PageHeader>

    <PageBody class="max-w-3xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle class="text-base">
            Delivery preferences
          </CardTitle>
          <CardDescription>Critical security alerts always send to email and can’t be disabled.</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-[1fr_auto_auto] items-end gap-x-4 gap-y-1 pb-2 text-xs font-medium text-muted-foreground">
            <span>Event</span>
            <span class="px-1 text-center">Email</span>
            <span class="px-1 text-center">In-app</span>
          </div>
          <Separator />
          <div
            v-for="(r, i) in rows"
            :key="r.key"
          >
            <div class="grid grid-cols-[1fr_auto_auto] items-center gap-x-4 py-3">
              <div class="space-y-0.5">
                <Label
                  :for="`pref-${r.key}-email`"
                  class="text-sm font-medium"
                >{{ r.label }}</Label>
                <p class="text-muted-foreground text-xs">
                  {{ r.description }}
                </p>
              </div>
              <Switch
                :id="`pref-${r.key}-email`"
                v-model="prefs[r.key]!.email"
              />
              <Switch
                :id="`pref-${r.key}-inapp`"
                v-model="prefs[r.key]!.inApp"
              />
            </div>
            <Separator v-if="i < rows.length - 1" />
          </div>
        </CardContent>
      </Card>

      <div class="flex items-center justify-end gap-2">
        <Button variant="outline">
          Reset
        </Button>
        <Button>Save preferences</Button>
      </div>
    </PageBody>
  </Page>
</template>
