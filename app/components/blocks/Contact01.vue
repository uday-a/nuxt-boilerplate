<script setup lang="ts">
import { computed, ref } from 'vue'
import { CheckCircle2, Mail, MapPin, Phone, Send } from '@/lib/icon-pack'
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
import { LeafletMap, LeafletMarker, LeafletPopup } from '@/components/ui/leaflet-map'

/** Apple Park, Cupertino — [lng, lat], the LeafletMap coordinate order. */
const APPLE_PARK: [number, number] = [-122.0090, 37.3349]

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
          <p class="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            Contact
          </p>
          <h2 class="text-3xl font-semibold tracking-tight sm:text-4xl">
            Talk to a human
          </h2>
          <p class="text-muted-foreground text-lg">
            Tell us a bit about your team and we'll show you how we'd fit. Average reply: 4 hours.
          </p>

          <div class="space-y-3 pt-4">
            <div class="flex items-center gap-3">
              <div class="bg-primary/10 text-primary rounded-lg p-2">
                <Mail
                  class="size-4"
                  aria-hidden="true"
                />
              </div>
              <div>
                <p class="text-muted-foreground text-xs uppercase">
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
              <div class="bg-primary/10 text-primary rounded-lg p-2">
                <Phone
                  class="size-4"
                  aria-hidden="true"
                />
              </div>
              <div>
                <p class="text-muted-foreground text-xs uppercase">
                  Phone
                </p>
                <p class="text-sm font-medium">
                  +1 (415) 555-0142
                </p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="bg-primary/10 text-primary rounded-lg p-2">
                <MapPin
                  class="size-4"
                  aria-hidden="true"
                />
              </div>
              <div>
                <p class="text-muted-foreground text-xs uppercase">
                  Office
                </p>
                <p class="text-sm font-medium">
                  One Apple Park Way, Cupertino, CA 95014
                </p>
              </div>
            </div>
          </div>

          <div class="bg-muted/40 mt-6 flex h-48 items-center justify-center rounded-lg border border-dashed">
            <!-- Client-only inside LeafletMap (SSR renders the bg-muted shell). -->
            <LeafletMap
              variant="muted"
              :center="APPLE_PARK"
              :zoom="14"
              :scroll-wheel-zoom="false"
              role="region"
              aria-label="Map showing Apple Park in Cupertino"
              class="size-full rounded-[inherit]"
            >
              <LeafletMarker
                :lng-lat="APPLE_PARK"
                anchor="center"
              >
                <!-- Same HQ marker as the dashboard Locations page. -->
                <span class="relative flex items-center justify-center">
                  <span
                    class="bg-primary absolute inset-0 rounded-full opacity-40 motion-safe:animate-ping"
                    aria-hidden="true"
                  />
                  <span class="bg-primary ring-primary/25 outline-background relative block size-5 rounded-full ring-4 outline-2" />
                </span>
                <LeafletPopup :offset="[0, -10]">
                  <span class="block text-sm font-medium">Apple Park</span>
                  <span class="text-muted-foreground block text-xs">One Apple Park Way, Cupertino, CA</span>
                </LeafletPopup>
              </LeafletMarker>
            </LeafletMap>
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
                      autocomplete="off"
                      required
                    />
                  </div>
                  <div class="grid gap-2">
                    <Label for="contact-email">Work email</Label>
                    <Input
                      id="contact-email"
                      v-model="email"
                      type="email"
                      autocomplete="off"
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
                class="bg-success/10 text-success mx-auto flex size-12 items-center justify-center rounded-full"
              >
                <CheckCircle2
                  class="size-6"
                  aria-hidden="true"
                />
              </div>
              <div class="space-y-1">
                <h3 class="text-lg font-semibold">
                  Message sent
                </h3>
                <p class="text-muted-foreground text-sm">
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
