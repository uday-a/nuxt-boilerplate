<script setup lang="ts">
import { computed, ref } from 'vue'
import { CheckCircle2, Mail, MapPin, Phone, Send } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const name = ref('')
const email = ref('')
const company = ref('')
const subject = ref('sales')
const message = ref('')
const sent = ref(false)

const canSubmit = computed(() => name.value && email.value && message.value)

const emit = defineEmits<{
  (e: 'submit', payload: { name: string, email: string, company: string, subject: string, message: string }): void
}>()

function submit() {
  if (!canSubmit.value) return
  emit('submit', {
    name: name.value,
    email: email.value,
    company: company.value,
    subject: subject.value,
    message: message.value,
  })
  sent.value = true
}
</script>

<template>
  <section class="bg-background">
    <div class="mx-auto max-w-6xl px-6 py-24">
      <div class="grid gap-10 lg:grid-cols-2 lg:items-start">
        <div class="space-y-6">
          <p class="text-sm font-medium uppercase tracking-widest text-primary">
            Contact
          </p>
          <h2 class="text-3xl font-semibold tracking-tight sm:text-4xl">
            Talk to a human
          </h2>
          <p class="text-lg text-muted-foreground">
            Tell us a bit about your team and we'll show you how we'd fit. Average reply:
            4 hours.
          </p>

          <div class="space-y-3 pt-4">
            <div class="flex items-center gap-3">
              <div class="rounded-lg bg-primary/10 p-2 text-primary">
                <Mail class="size-4" />
              </div>
              <div>
                <p class="text-xs uppercase text-muted-foreground">
                  Email
                </p>
                <a
                  href="mailto:hello@acme.test"
                  class="text-sm font-medium hover:underline"
                >
                  hello@acme.test
                </a>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="rounded-lg bg-primary/10 p-2 text-primary">
                <Phone class="size-4" />
              </div>
              <div>
                <p class="text-xs uppercase text-muted-foreground">
                  Phone
                </p>
                <p class="text-sm font-medium">
                  +1 (415) 555-0142
                </p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="rounded-lg bg-primary/10 p-2 text-primary">
                <MapPin class="size-4" />
              </div>
              <div>
                <p class="text-xs uppercase text-muted-foreground">
                  Office
                </p>
                <p class="text-sm font-medium">
                  120 Howard St, San Francisco
                </p>
              </div>
            </div>
          </div>

          <div class="mt-6 flex h-48 items-center justify-center rounded-lg border border-dashed bg-muted/40">
            <p class="text-sm text-muted-foreground">
              Map placeholder
            </p>
          </div>
        </div>

        <Card>
          <template v-if="!sent">
            <CardHeader>
              <CardTitle>Send us a message</CardTitle>
              <CardDescription>We reply during business hours (PT)</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                class="space-y-4"
                @submit.prevent="submit"
              >
                <div class="grid gap-4 sm:grid-cols-2">
                  <div class="grid gap-2">
                    <Label for="contact-name">Name</Label>
                    <Input
                      id="contact-name"
                      v-model="name"
                      required
                    />
                  </div>
                  <div class="grid gap-2">
                    <Label for="contact-email">Work email</Label>
                    <Input
                      id="contact-email"
                      v-model="email"
                      type="email"
                      required
                    />
                  </div>
                </div>
                <div class="grid gap-2">
                  <Label for="contact-company">Company</Label>
                  <Input
                    id="contact-company"
                    v-model="company"
                  />
                </div>
                <div class="grid gap-2">
                  <Label for="contact-subject">I'm interested in</Label>
                  <Select v-model="subject">
                    <SelectTrigger id="contact-subject">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">
                        Talking to sales
                      </SelectItem>
                      <SelectItem value="support">
                        Customer support
                      </SelectItem>
                      <SelectItem value="partnership">
                        Partnerships
                      </SelectItem>
                      <SelectItem value="other">
                        Something else
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div class="grid gap-2">
                  <Label for="contact-message">Message</Label>
                  <Textarea
                    id="contact-message"
                    v-model="message"
                    placeholder="How can we help?"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  class="w-full"
                  :disabled="!canSubmit"
                >
                  Send message
                  <Send class="ml-2 size-4" />
                </Button>
              </form>
            </CardContent>
          </template>

          <template v-else>
            <CardContent class="space-y-4 pt-8 text-center">
              <div
                class="mx-auto flex size-12 items-center justify-center rounded-full bg-[var(--success)]/10 text-[var(--success)]"
              >
                <CheckCircle2 class="size-6" />
              </div>
              <div class="space-y-1">
                <h3 class="text-lg font-semibold">
                  Message sent
                </h3>
                <p class="text-sm text-muted-foreground">
                  Thanks {{ name }}, we'll be in touch within a few hours.
                </p>
              </div>
              <Button
                variant="outline"
                @click="sent = false"
              >
                Send another
              </Button>
            </CardContent>
          </template>
        </Card>
      </div>
    </div>
  </section>
</template>
