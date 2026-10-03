<script setup lang="ts">
import { BookOpen, Mail, MessageSquare, CheckCircle2 } from '@/lib/icon-pack'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Page, PageHeader, PageHeaderHeading, PageBody } from '@/components/ui/page'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
const title = useRouteLabel()
useHead({ title })

const faq = [
  { q: 'How do I invite someone to my workspace?', a: 'Go to Settings → Team and choose Invite member. Enter their email and pick a role. They get a link that stays valid for 7 days; you can resend or revoke it from the same page.' },
  { q: 'How do I rotate an API key without downtime?', a: 'Create the new key in Settings → API keys. Both keys work for the next 24 hours. Switch your services to the new key, check they are working, then revoke the old one.' },
  { q: 'What happens when we reach a plan limit?', a: 'You get an email at 80% and 100% of any limit. Seats and projects stop at the limit until you upgrade; API calls return a 429 response until the next billing period or until you raise the limit in Settings → Limits.' },
  { q: 'Can I change plans mid-cycle?', a: 'Yes. Upgrades take effect immediately and are prorated on your next invoice. Downgrades apply at the end of the current billing period.' },
  { q: 'How do I set up single sign-on?', a: 'SSO is available on the Enterprise plan. In Settings → Security, add your identity provider (Okta, Azure AD or Google Workspace) and verify your domain. Members are then asked to sign in through your provider.' },
  { q: 'Where can I download invoices?', a: 'Settings → Billing lists every invoice with a PDF download. Billing admins can also add a billing email so invoices are sent there automatically.' },
  { q: 'How do I export my data?', a: 'Workspace owners can export projects, tasks and members as CSV or JSON from Settings → General. Large exports are emailed as a download link when ready.' },
  { q: 'How do I delete my workspace?', a: 'Workspace owners can delete it from Settings → General. Your data is kept for 30 days in case you change your mind, then permanently removed.' },
]

const channels = [
  { icon: BookOpen, title: 'Documentation', description: 'Step-by-step guides for setup, billing, integrations and the API.', href: '#', meta: '75 pages', cta: 'Browse docs' },
  { icon: MessageSquare, title: 'Community', description: 'Ask questions and share tips with the team and other customers. Most questions get an answer within 4 hours.', href: '#', meta: '3,400 members', cta: 'Join the community' },
  { icon: Mail, title: 'Email support', description: 'On Team and Enterprise plans. Median reply time is 2.4 hours on business days.', href: 'mailto:support@uipkge.dev', meta: 'support@uipkge.dev', cta: 'Email us' },
]

const status = { level: 'all-systems-go', label: 'All systems operational', updated: '2 minutes ago' }
</script>

<template>
  <Page>
    <PageHeader>
      <PageHeaderHeading
        :title="title"
        description="Guides, community answers and help from our team."
      />
    </PageHeader>

    <PageBody class="space-y-4">
      <Card class="border-success/30 bg-success/5">
        <CardContent class="flex items-center gap-3 py-4">
          <CheckCircle2
            class="text-success size-5 shrink-0"
            aria-hidden="true"
          />
          <div class="flex-1 space-y-1">
            <p class="text-sm font-semibold">
              {{ status.label }}
            </p>
            <p class="text-muted-foreground text-xs">
              Updated {{ status.updated }}. <a
                href="#"
                class="text-foreground underline-offset-4 hover:underline"
              >View status page →</a>
            </p>
          </div>
        </CardContent>
      </Card>

      <div class="grid gap-4 lg:grid-cols-3">
        <Card
          v-for="c in channels"
          :key="c.title"
          class="flex flex-col"
        >
          <CardHeader>
            <div class="bg-primary/10 text-primary mb-2 flex size-10 items-center justify-center rounded-lg">
              <component
                :is="c.icon"
                class="size-5"
                aria-hidden="true"
              />
            </div>
            <CardTitle class="text-base">
              {{ c.title }}
            </CardTitle>
            <CardDescription>{{ c.description }}</CardDescription>
          </CardHeader>
          <CardContent class="mt-auto space-y-4">
            <Badge variant="secondary">
              {{ c.meta }}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              class="w-full"
              as="a"
              :href="c.href"
            >
              {{ c.cta }}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle class="text-base">
            Frequently asked
          </CardTitle>
          <CardDescription>Quick answers to the questions we hear most.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion
            type="single"
            collapsible
            class="w-full"
          >
            <AccordionItem
              v-for="(f, i) in faq"
              :key="i"
              :value="`item-${i}`"
            >
              <AccordionTrigger class="text-left text-sm">
                {{ f.q }}
              </AccordionTrigger>
              <AccordionContent class="text-muted-foreground text-sm leading-relaxed">
                {{ f.a }}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </PageBody>
  </Page>
</template>
