<script setup lang="ts">
definePageMeta({ auth: false, layout: false })
useHead({ title: 'Terms of Service' })

// Sample terms. Replace with your own before launch and have counsel review them.
const sections = [
  {
    heading: 'Agreement',
    body: 'By creating an account or using UIPKGE, you agree to these terms on behalf of yourself and the organisation you represent.',
  },
  {
    heading: 'Use of the service',
    body: 'Use the service only for lawful purposes. Do not attempt to disrupt it, access other customers\' data, or resell access without a written agreement.',
  },
  {
    heading: 'Accounts',
    body: 'You are responsible for the people you invite to your workspace and for keeping sign-in methods secure. Tell us promptly about any unauthorised access.',
  },
  {
    heading: 'Billing',
    body: 'Paid plans renew automatically each month or year until cancelled. Seat changes are prorated on your next invoice. Fees are non-refundable except where required by law.',
  },
  {
    heading: 'Termination',
    body: 'You can cancel at any time from Settings → Billing. We may suspend accounts that break these terms. After cancellation you can export your data for 30 days.',
  },
  {
    heading: 'Contact',
    body: 'Questions about these terms? Email legal@uipkge.dev.',
  },
]
</script>

<template>
  <div class="bg-background text-foreground min-h-screen">
    <Header01 />
    <main class="mx-auto max-w-3xl px-4 py-4">
      <article class="space-y-4">
        <header class="space-y-2">
          <h1 class="text-3xl font-semibold tracking-tight">
            Terms of Service
          </h1>
          <p class="text-muted-foreground text-sm">
            Last updated: <time datetime="2026-05-17">May 17, 2026</time>
          </p>
        </header>

        <section
          v-for="(section, i) in sections"
          :key="section.heading"
          class="space-y-2"
        >
          <h2 class="text-xl font-semibold tracking-tight">
            {{ i + 1 }}. {{ section.heading }}
          </h2>
          <p class="text-muted-foreground text-sm leading-relaxed">
            {{ section.body }}
          </p>
        </section>
      </article>
    </main>
    <Footer01 />
  </div>
</template>
