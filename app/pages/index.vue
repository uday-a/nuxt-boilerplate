<script setup lang="ts">
definePageMeta({ auth: false, layout: false })

useHead({
  title: 'UIPKGE — Nuxt boilerplate',
  meta: [
    {
      name: 'description',
      content: 'A 100% UIPKGE-registry-driven Nuxt 4 boilerplate. Every UI surface ships from the registry; you own every line.',
    },
  ],
})
</script>

<template>
  <div class="bg-background text-foreground min-h-screen">
    <Header01 />
    <main class="[&>section]:scroll-mt-20">
      <section id="top"><Hero01 /></section>
      <section id="logos"><Logos01 /></section>
      <section id="features"><Features01 /></section>
      <section id="bento"><Bento01 /></section>
      <section id="pricing"><Pricing01 /></section>
      <section id="customers"><Testimonials01 /></section>
      <section id="faq"><Faq01 /></section>
      <section id="contact"><Contact01 /></section>
      <section id="cta"><Cta01 /></section>
    </main>
    <Footer01 />
  </div>
</template>
