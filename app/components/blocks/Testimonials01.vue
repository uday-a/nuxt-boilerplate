<script setup lang="ts">
import { computed, ref } from 'vue'
import { Quote } from '@/lib/icon-pack'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'

const testimonials = [
  {
    quote:
      'We replaced four spreadsheets and two tools with this. Our weekly status meeting went from an hour to fifteen minutes.',
    name: 'Sarah Mitchell',
    role: 'VP of Engineering',
    company: 'Northwind Logistics',
    initials: 'SM',
  },
  {
    quote:
      'The audit trail alone is worth it. SOC2 evidence collection went from a quarterly nightmare to a one-click export.',
    name: 'Mark Davies',
    role: 'Director of Compliance',
    company: 'Helio Health',
    initials: 'MD',
  },
  {
    quote:
      'My favourite part is how fast it is. No spinners, no loading states. Search returns instantly across every project.',
    name: 'Laura Bennett',
    role: 'IT Operations',
    company: 'Pixel & Co',
    initials: 'LB',
  },
]

const active = ref(0)
// Hoist the active testimonial into a computed so the template doesn't
// have to handle `testimonials[active]` being potentially undefined under
// strict noUncheckedIndexedAccess.
const current = computed(() => testimonials[active.value] ?? testimonials[0]!)
</script>

<template>
  <section class="bg-muted/30">
    <div class="mx-auto max-w-4xl px-4 py-4">
      <div class="text-center">
        <p class="text-muted-foreground text-xs font-medium uppercase tracking-wider">
          Testimonials
        </p>
        <h2 class="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Loved by teams everywhere
        </h2>
      </div>

      <Card class="mt-4">
        <CardContent class="space-y-4 p-4 text-center">
          <Quote
            class="text-primary mx-auto size-8"
            aria-hidden="true"
          />
          <p class="text-xl leading-relaxed text-foreground sm:text-2xl">
            &ldquo;{{ current.quote }}&rdquo;
          </p>
          <div class="flex flex-col items-center gap-2">
            <Avatar class="size-12">
              <AvatarFallback class="bg-muted text-muted-foreground">
                {{ current.initials }}
              </AvatarFallback>
            </Avatar>
            <div>
              <p class="text-sm font-semibold">
                {{ current.name }}
              </p>
              <p class="text-xs text-muted-foreground">
                {{ current.role }} · {{ current.company }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div class="mt-4 flex justify-center gap-2">
        <button
          v-for="(t, i) in testimonials"
          :key="t.name"
          type="button"
          :aria-label="`Show testimonial from ${t.name}`"
          :aria-current="i === active"
          class="size-2 rounded-full transition-all duration-200"
          :class="i === active ? 'w-6 bg-primary' : 'bg-muted-foreground/30 hover:bg-muted-foreground'"
          @click="active = i"
        />
      </div>
    </div>
  </section>
</template>
