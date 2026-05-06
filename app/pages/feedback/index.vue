<script setup lang="ts">
import { ref } from 'vue'
import { Send, ThumbsUp, MessageCircle, Sparkles, Bug, Lightbulb } from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Feedback' })

const category = ref('idea')
const subject = ref('')
const message = ref('')

const recent = [
  { kind: 'bug', author: 'Marcus R.', summary: 'Sparkline tooltip flickers when crossing zero', upvotes: 8, status: 'in-progress', age: '2d ago' },
  { kind: 'idea', author: 'Alice C.', summary: 'Let me pin sessions from the playground header, not just the menu', upvotes: 14, status: 'planned', age: '4d ago' },
  { kind: 'idea', author: 'David K.', summary: 'Add a "compare two models side-by-side" view in the playground', upvotes: 32, status: 'planned', age: '1w ago' },
  { kind: 'bug', author: 'Eva J.', summary: 'JSON mode adds a trailing newline on Quantum responses', upvotes: 3, status: 'shipped', age: '1w ago' },
  { kind: 'idea', author: 'Frank L.', summary: 'Slack notifications when batch jobs finish', upvotes: 21, status: 'considering', age: '2w ago' },
  { kind: 'praise', author: 'Olive P.', summary: 'The new docs search is incredibly fast — feels instant.', upvotes: 11, status: '', age: '2w ago' },
]

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  'shipped': 'default',
  'in-progress': 'secondary',
  'planned': 'outline',
  'considering': 'outline',
}

const kindIcon: Record<string, any> = { bug: Bug, idea: Lightbulb, praise: Sparkles }
const kindColor: Record<string, string> = {
  bug: 'text-amber-600 dark:text-amber-400',
  idea: 'text-violet-600 dark:text-violet-400',
  praise: 'text-emerald-600 dark:text-emerald-400',
}
</script>

<template>
  <div class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-semibold tracking-tight">
        Feedback
      </h1>
      <p class="text-muted-foreground text-sm">
        Tell us what's broken, what's missing, what feels right. We read every submission within 48 hours.
      </p>
    </header>

    <div class="grid gap-6 lg:grid-cols-[1fr_400px]">
      <Card>
        <CardHeader>
          <CardTitle class="text-base">
            Send us a note
          </CardTitle>
          <CardDescription>Choose the closest match. We route based on category and respond from the right person.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-5">
          <div class="grid gap-2">
            <Label>Category</Label>
            <RadioGroup
              v-model="category"
              class="grid grid-cols-3 gap-2"
            >
              <div class="hover:bg-muted/40 [&:has([data-state=checked])]:bg-muted [&:has([data-state=checked])]:border-foreground/30 flex items-center gap-2 rounded-lg border p-3 cursor-pointer">
                <RadioGroupItem
                  id="cat-idea"
                  value="idea"
                />
                <Label
                  for="cat-idea"
                  class="cursor-pointer text-sm font-medium"
                >Idea</Label>
              </div>
              <div class="hover:bg-muted/40 [&:has([data-state=checked])]:bg-muted [&:has([data-state=checked])]:border-foreground/30 flex items-center gap-2 rounded-lg border p-3 cursor-pointer">
                <RadioGroupItem
                  id="cat-bug"
                  value="bug"
                />
                <Label
                  for="cat-bug"
                  class="cursor-pointer text-sm font-medium"
                >Bug</Label>
              </div>
              <div class="hover:bg-muted/40 [&:has([data-state=checked])]:bg-muted [&:has([data-state=checked])]:border-foreground/30 flex items-center gap-2 rounded-lg border p-3 cursor-pointer">
                <RadioGroupItem
                  id="cat-praise"
                  value="praise"
                />
                <Label
                  for="cat-praise"
                  class="cursor-pointer text-sm font-medium"
                >Praise</Label>
              </div>
            </RadioGroup>
          </div>

          <div class="grid gap-2">
            <Label for="fb-subject">Subject</Label>
            <Input
              id="fb-subject"
              v-model="subject"
              placeholder="One-line summary"
            />
          </div>

          <div class="grid gap-2">
            <Label for="fb-message">Details</Label>
            <Textarea
              id="fb-message"
              v-model="message"
              rows="6"
              placeholder="What happened? What were you expecting? Anything we should reproduce?"
            />
            <p class="text-muted-foreground text-xs">
              If this is a bug, include the API request ID from the error toast — we can pull the exact server-side log.
            </p>
          </div>

          <div class="flex justify-end gap-2">
            <Button variant="outline">
              Save draft
            </Button>
            <Button class="gap-2">
              <Send class="size-4" />Send
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="text-base flex items-center gap-2">
            <MessageCircle class="size-4" /> Recent from the team
          </CardTitle>
          <CardDescription>Public feedback from your workspace.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-3">
          <div
            v-for="(r, i) in recent"
            :key="i"
            class="border-b pb-3 last:border-0 last:pb-0"
          >
            <div class="flex items-start gap-2.5">
              <component
                :is="kindIcon[r.kind]"
                :class="['mt-0.5 size-4 shrink-0', kindColor[r.kind]]"
              />
              <div class="min-w-0 flex-1 space-y-1">
                <p class="text-sm leading-snug">
                  {{ r.summary }}
                </p>
                <div class="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
                  <span>{{ r.author }} · {{ r.age }}</span>
                  <span
                    v-if="r.status"
                    class="text-foreground/60"
                  >·</span>
                  <Badge
                    v-if="r.status"
                    :variant="statusVariant[r.status]"
                    class="text-[9px] capitalize"
                  >
                    {{ r.status.replace('-', ' ') }}
                  </Badge>
                </div>
              </div>
              <button class="hover:bg-muted text-muted-foreground hover:text-foreground flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition-colors">
                <ThumbsUp class="size-3" />
                <span class="tabular-nums">{{ r.upvotes }}</span>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
