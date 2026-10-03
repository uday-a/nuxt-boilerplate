<script setup lang="ts">
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
</script>

<template>
  <section class="bg-background">
    <div class="mx-auto max-w-3xl px-4 py-4">
      <div class="text-center">
        <p class="text-muted-foreground text-xs font-medium uppercase tracking-wider">
          FAQ
        </p>
        <h2 class="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Questions, answered
        </h2>
        <p class="mx-auto mt-3 max-w-xl text-lg text-muted-foreground">
          Anything we missed? Email
          <a
            href="mailto:hello@uipkge.dev"
            class="underline underline-offset-4 hover:text-foreground"
          >
            hello@uipkge.dev
          </a>
          and we'll reply within a day.
        </p>
      </div>

      <Accordion
        type="single"
        collapsible
        class="mt-4 w-full"
      >
        <AccordionItem value="trial">
          <AccordionTrigger>How does the 14-day free trial work?</AccordionTrigger>
          <AccordionContent>
            Sign up with a work email — no credit card. You get every feature on the Team
            plan for 14 days. At the end of the trial you pick a plan or your workspace
            switches to read-only until you do; nothing is deleted.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="migration">
          <AccordionTrigger>Can we migrate from our current tool?</AccordionTrigger>
          <AccordionContent>
            Yes. Most teams import projects, tasks and members with one CSV. We have
            prebuilt importers for Jira, Asana, Linear and Trello; for everything else,
            our team will run the migration with you free of charge.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="security">
          <AccordionTrigger>Is our data secure?</AccordionTrigger>
          <AccordionContent>
            SOC 2 Type II, ISO 27001 and GDPR compliant. Data is encrypted at rest
            (AES-256) and in transit (TLS 1.3). EU customers stay on EU-region
            infrastructure. Full audit trail is available on every plan.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="pricing">
          <AccordionTrigger>What does the per-user pricing include?</AccordionTrigger>
          <AccordionContent>
            Projects, analytics, integrations, API access and priority support are
            included on the Team plan. SSO, SCIM, audit logs and a dedicated success
            manager are Enterprise-only. There are no per-feature add-ons.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="support">
          <AccordionTrigger>What support do we get?</AccordionTrigger>
          <AccordionContent>
            Email support is included on every plan with a 4-hour business-hours reply.
            Team and Enterprise customers get a shared Slack channel; Enterprise adds a
            named success manager and a 99.99% uptime SLA with credits.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="cancel">
          <AccordionTrigger>How do we cancel?</AccordionTrigger>
          <AccordionContent>
            One click in Settings → Billing. We charge month-to-month or annually; if you
            cancel mid-cycle, your workspace stays active through the end of the period
            and you can export all data as CSV or JSON before it ends.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  </section>
</template>
