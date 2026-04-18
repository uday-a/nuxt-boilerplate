<script setup lang="ts">
import { ref } from 'vue'
import { Quote } from 'lucide-vue-next'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'

const testimonials = [
  {
    quote:
      'We replaced four spreadsheets and two SaaS tools with this. Onboarding time dropped from 6 days to under 4 hours.',
    name: 'Aisha Rahman',
    role: 'Head of People',
    company: 'Northwind Logistics',
    initials: 'AR',
  },
  {
    quote:
      'The audit trail alone is worth it. SOC2 evidence collection went from a quarterly nightmare to a one-click export.',
    name: 'Marco Vidal',
    role: 'Director of Compliance',
    company: 'Helio Health',
    initials: 'MV',
  },
  {
    quote:
      'My favourite part is how fast it is. No spinners, no loading states. Search returns instantly across the entire org.',
    name: 'Tomoko Saito',
    role: 'IT Operations',
    company: 'Pixel & Co',
    initials: 'TS',
  },
]

const active = ref(0)
</script>

<template>
  <section class="bg-muted/30">
    <div class="mx-auto max-w-4xl px-6 py-24">
      <div class="text-center">
        <p class="text-sm font-medium uppercase tracking-widest text-primary">Testimonials</p>
        <h2 class="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Loved by teams everywhere
        </h2>
      </div>

      <Card class="mt-10">
        <CardContent class="space-y-6 p-8 text-center">
          <Quote class="mx-auto size-8 text-primary" />
          <p class="text-xl leading-relaxed text-foreground sm:text-2xl">
            &ldquo;{{ testimonials[active].quote }}&rdquo;
          </p>
          <div class="flex flex-col items-center gap-2">
            <Avatar class="size-12">
              <AvatarFallback>{{ testimonials[active].initials }}</AvatarFallback>
            </Avatar>
            <div>
              <p class="text-sm font-semibold">{{ testimonials[active].name }}</p>
              <p class="text-xs text-muted-foreground">
                {{ testimonials[active].role }} · {{ testimonials[active].company }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div class="mt-6 flex justify-center gap-2">
        <button
          v-for="(t, i) in testimonials"
          :key="t.name"
          type="button"
          :aria-label="`Show testimonial from ${t.name}`"
          :aria-current="i === active"
          class="size-2 rounded-full transition-all duration-200"
          :class="i === active ? 'w-6 bg-primary' : 'bg-muted-foreground/30 hover:bg-muted-foreground/60'"
          @click="active = i"
        />
      </div>
    </div>
  </section>
</template>
