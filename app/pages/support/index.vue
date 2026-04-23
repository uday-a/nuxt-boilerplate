<script setup lang="ts">
import { LifeBuoy, BookOpen, Mail, MessageSquare, ExternalLink, CheckCircle2 } from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Support' })

const faq = [
  { q: 'My API call returned a 429. What\'s the right backoff?', a: 'Exponential backoff with full jitter, capped at 30 seconds. Use the Retry-After header value as the starting point — we set it precisely for your current bucket. The SDK does this automatically; only worry about it if you\'re hitting the REST API directly.' },
  { q: 'How do I rotate my API key without an outage?', a: 'Generate the new key in Settings → API keys. Both keys are valid for the next 24 hours. Switch your production environment to the new key, verify it\'s working, then revoke the old one. There is no downtime if you do this in order.' },
  { q: 'Can I run the SDK on Cloudflare Workers / edge runtimes?', a: 'Yes. The SDK is ESM-only with no Node-specific dependencies. The one quirk: SSE streaming requires you to pass { fetch: (req) => fetch(req, { duplex: \'half\' }) } in the client constructor — the default fetch on Workers needs this hint.' },
  { q: 'How does the batch endpoint handle partial failures?', a: 'Each prompt in a batch is processed independently. The response is a list where each element is either a success or an error object — you process them like a result-of-T array. One bad prompt does not fail the whole batch and does not get charged.' },
  { q: 'Are my prompts used to train your models?', a: 'No. By default, prompts and completions are retained for 30 days for abuse review only, then deleted. Enterprise accounts can opt for zero retention via a contractual amendment.' },
  { q: 'What\'s the difference between sessions and contexts?', a: 'Sessions hold conversation state (the message list, tool history). Contexts hold static data (files, knowledge base entries) that you reference from many sessions. Use a session when the state belongs to one user-conversation. Use a context when the same documents are read by many sessions.' },
  { q: 'How do I cap costs per workspace?', a: 'Settings → Limits lets you set a hard monthly spending cap. When you hit it, API calls return 402 Payment Required until the next billing cycle or until you raise the cap. Soft caps (email warning at 80% / 100%) are also configurable.' },
  { q: 'Why does Explorer cost so much more than Genesis?', a: 'Explorer\'s million-token context is a more expensive model to serve. If your prompt fits in under 128K tokens, Genesis will give you very similar output quality at one-half the cost and one-third the latency. The model card has a guide for when each is appropriate.' },
]

const channels = [
  { icon: BookOpen, title: 'Documentation', description: 'Self-serve guides for 90% of questions.', href: '/documentation', meta: '75 pages', cta: 'Browse docs' },
  { icon: MessageSquare, title: 'Community Discord', description: 'Async Q&A with the team and other builders. Typically responded to within 4 hours.', href: '#', meta: '3,400 members', cta: 'Join Discord' },
  { icon: Mail, title: 'Email support', description: 'Pro and Enterprise. Median response time: 2.4 hours during business days.', href: 'mailto:support@uipkge.dev', meta: 'support@uipkge.dev', cta: 'Email us' },
]

const status = { level: 'all-systems-go', label: 'All systems operational', updated: '2 minutes ago' }
</script>

<template>
  <div class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-semibold tracking-tight">Support</h1>
      <p class="text-muted-foreground text-sm">Documentation, community, and human help — pick whichever gets you unstuck fastest.</p>
    </header>

    <Card class="border-emerald-500/30 bg-emerald-500/5">
      <CardContent class="flex items-center gap-3 py-4">
        <CheckCircle2 class="text-emerald-500 size-5 shrink-0" />
        <div class="flex-1 space-y-0.5">
          <p class="text-sm font-semibold">{{ status.label }}</p>
          <p class="text-muted-foreground text-xs">Updated {{ status.updated }}. <a href="#" class="text-foreground underline-offset-4 hover:underline">View status page →</a></p>
        </div>
      </CardContent>
    </Card>

    <div class="grid gap-4 lg:grid-cols-3">
      <Card v-for="c in channels" :key="c.title">
        <CardHeader>
          <div class="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
            <component :is="c.icon" class="size-5" />
          </div>
          <CardTitle class="text-base pt-3">{{ c.title }}</CardTitle>
          <CardDescription>{{ c.description }}</CardDescription>
        </CardHeader>
        <CardContent class="space-y-3">
          <Badge variant="secondary" class="text-[10px]">{{ c.meta }}</Badge>
          <Button variant="outline" size="sm" class="w-full gap-1.5" as="a" :href="c.href">
            {{ c.cta }}
            <ExternalLink class="size-3" />
          </Button>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle class="text-base flex items-center gap-2"><LifeBuoy class="size-4" /> Frequently asked</CardTitle>
        <CardDescription>Eight questions that account for ~70% of inbound tickets.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible class="w-full">
          <AccordionItem v-for="(f, i) in faq" :key="i" :value="`item-${i}`">
            <AccordionTrigger class="text-left text-sm">{{ f.q }}</AccordionTrigger>
            <AccordionContent class="text-muted-foreground text-sm leading-relaxed">{{ f.a }}</AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  </div>
</template>
