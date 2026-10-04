<script setup lang="ts">
definePageMeta({ auth: false, layout: false })

useHead({ title: 'The workspace your team will actually use' })
</script>

<template>
  <div class="bg-background text-foreground min-h-screen">
    <a
      href="#main-content"
      class="bg-background text-foreground ring-ring sr-only z-50 rounded-md text-sm font-medium shadow-md ring-2 focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:px-3 focus:py-2"
    >Skip to content</a>
    <Header01 />
    <main
      id="main-content"
      tabindex="-1"
      class="outline-none [&>section]:scroll-mt-20"
    >
      <section id="top">
        <Hero01 />
      </section>
      <section id="logos">
        <Logos01 />
      </section>
      <section id="features">
        <Features01 />
      </section>
      <section id="bento">
        <Bento01 />
      </section>
      <section id="pricing">
        <Pricing01 />
      </section>
      <section id="customers">
        <Testimonials01 />
      </section>
      <section id="faq">
        <Faq01 />
      </section>
      <section id="contact">
        <Contact01 />
      </section>
      <section id="cta">
        <Cta01 />
      </section>
    </main>
    <Footer01 />
  </div>
</template>
