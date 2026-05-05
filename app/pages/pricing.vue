<script setup lang="ts">
definePageMeta({ auth: false, layout: false })

useHead({
  title: 'Pricing · Acme',
  meta: [
    { name: 'description', content: 'Simple, transparent pricing for teams of every size.' },
  ],
})
</script>

<template>
  <div class="bg-background text-foreground min-h-screen">
    <Header01 />
    <main>
      <div class="mx-auto max-w-6xl px-6 py-16">
        <header class="mx-auto max-w-2xl text-center">
          <h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">Pricing</h1>
          <p class="text-muted-foreground mt-3 text-base">
            Start free. Upgrade when you outgrow it.
          </p>
        </header>
      </div>
      <!-- Reuse the landing pricing block so plans live in one place. -->
      <section><Pricing01 /></section>
      <section><Faq01 /></section>
    </main>
    <Footer01 />
  </div>
</template>
