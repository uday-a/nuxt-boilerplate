<script setup lang="ts">
definePageMeta({ auth: false, layout: false })
useHead({ title: 'Terms of Service · Acme' })
</script>

<template>
  <div class="bg-background text-foreground min-h-screen">
    <Header01 />
    <main class="mx-auto max-w-3xl px-6 py-16">
      <article class="prose dark:prose-invert max-w-none">
        <h1 class="text-3xl font-semibold tracking-tight">Terms of Service</h1>
        <p class="text-muted-foreground text-sm">Last updated: <time datetime="2026-05-17">May 17, 2026</time></p>

        <h2 class="mt-8 text-xl font-semibold">1. Agreement</h2>
        <p class="text-muted-foreground">
          Replace this stub with your actual terms before launch. Consider consulting counsel.
        </p>

        <h2 class="mt-6 text-xl font-semibold">2. Use of the Service</h2>
        <p class="text-muted-foreground">…</p>

        <h2 class="mt-6 text-xl font-semibold">3. Accounts</h2>
        <p class="text-muted-foreground">…</p>

        <h2 class="mt-6 text-xl font-semibold">4. Billing</h2>
        <p class="text-muted-foreground">…</p>

        <h2 class="mt-6 text-xl font-semibold">5. Termination</h2>
        <p class="text-muted-foreground">…</p>

        <h2 class="mt-6 text-xl font-semibold">6. Contact</h2>
        <p class="text-muted-foreground">support@acme.dev</p>
      </article>
    </main>
    <Footer01 />
  </div>
</template>
