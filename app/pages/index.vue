<script setup lang="ts">
import Header01 from '@/components/blocks/Header01.vue'
import Hero01 from '@/components/blocks/Hero01.vue'
import Logos01 from '@/components/blocks/Logos01.vue'
import Features01 from '@/components/blocks/Features01.vue'
import Bento01 from '@/components/blocks/Bento01.vue'
import Pricing01 from '@/components/blocks/Pricing01.vue'
import Testimonials01 from '@/components/blocks/Testimonials01.vue'
import Faq01 from '@/components/blocks/Faq01.vue'
import Contact01 from '@/components/blocks/Contact01.vue'
import Cta01 from '@/components/blocks/Cta01.vue'
import Footer01 from '@/components/blocks/Footer01.vue'

useHead({
  title: 'UIPKGE — Marketing demo',
  meta: [{ name: 'description', content: 'Marketing landing page composed from UIPKGE blocks.' }],
})
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
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
