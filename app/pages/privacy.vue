<script setup lang="ts">
definePageMeta({ auth: false, layout: false })
useHead({ title: 'Privacy Policy · Acme' })
</script>

<template>
  <div class="bg-background text-foreground min-h-screen">
    <Header01 />
    <main class="mx-auto max-w-3xl px-6 py-16">
      <article class="prose dark:prose-invert max-w-none">
        <h1 class="text-3xl font-semibold tracking-tight">
          Privacy Policy
        </h1>
        <p class="text-muted-foreground text-sm">
          Last updated: <time datetime="2026-05-17">May 17, 2026</time>
        </p>

        <h2 class="mt-8 text-xl font-semibold">
          1. Data we collect
        </h2>
        <p class="text-muted-foreground">
          Replace this stub with your actual policy. Cover what you store, why, and how long.
        </p>

        <h2 class="mt-6 text-xl font-semibold">
          2. How we use data
        </h2>
        <p class="text-muted-foreground">
          …
        </p>

        <h2 class="mt-6 text-xl font-semibold">
          3. Sub-processors
        </h2>
        <p class="text-muted-foreground">
          …
        </p>

        <h2 class="mt-6 text-xl font-semibold">
          4. Your rights
        </h2>
        <p class="text-muted-foreground">
          Access, rectification, deletion, portability, objection.
        </p>

        <h2 class="mt-6 text-xl font-semibold">
          5. Contact
        </h2>
        <p class="text-muted-foreground">
          privacy@acme.dev
        </p>
      </article>
    </main>
    <Footer01 />
  </div>
</template>
