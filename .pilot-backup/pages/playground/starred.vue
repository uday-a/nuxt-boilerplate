<script setup lang="ts">
import { Star, Copy, Play, MoreHorizontal } from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Playground · Starred' })

const starred = [
  { id: 's1', title: 'Onboarding email rewriter', model: 'Genesis', tags: ['marketing', 'email'], starred: '2026-05-12', preview: 'Rewrite the welcome email to match our latest brand voice. Keep CTA above the fold and limit body to 140 words. Use sentence case throughout.' },
  { id: 's2', title: 'SQL query explainer', model: 'Quantum', tags: ['data', 'sql'], starred: '2026-05-11', preview: 'Given the following SQL, explain the join strategy, identify likely performance bottlenecks, and suggest an index if one would help. Limit to 200 words.' },
  { id: 's3', title: 'Weekly digest generator', model: 'Explorer', tags: ['ops', 'reporting'], starred: '2026-05-09', preview: 'Summarise the last 7 days of issues from the linked project board. Group by severity. Highlight items still open after their target date.' },
  { id: 's4', title: 'Code review prompt v3', model: 'Genesis', tags: ['code', 'review'], starred: '2026-05-08', preview: 'You are a staff engineer reviewing a pull request. Look for: untested edge cases, race conditions, accidental N+1 queries, exposed secrets.' },
  { id: 's5', title: 'Customer support classifier', model: 'Quantum', tags: ['support', 'classifier'], starred: '2026-05-06', preview: 'Classify the incoming ticket into one of: billing / bug / feature-request / how-to / spam. Reply with just the category, lowercase, no punctuation.' },
  { id: 's6', title: 'Marketing copy A/B variants', model: 'Genesis', tags: ['marketing', 'copy'], starred: '2026-05-04', preview: 'Generate three alternate hero headlines for the landing page below. Each ≤8 words. Punchy, plainspoken, no jargon. Return as a numbered list.' },
  { id: 's7', title: 'Unit test generator', model: 'Explorer', tags: ['code', 'testing'], starred: '2026-05-02', preview: 'Generate Vitest unit tests for the function below. Cover happy path, empty input, and the two edge cases noted in the JSDoc comment.' },
  { id: 's8', title: 'Slack thread TL;DR', model: 'Quantum', tags: ['ops', 'summary'], starred: '2026-04-30', preview: 'Summarise the Slack thread below in 3 bullets. Capture decisions made and any open follow-ups. Mention people by first name only.' },
]
</script>

<template>
  <div class="space-y-6">
    <header class="flex items-end justify-between gap-4">
      <div class="space-y-1">
        <h1 class="text-2xl font-semibold tracking-tight">Starred prompts</h1>
        <p class="text-muted-foreground text-sm">{{ starred.length }} prompts you've pinned for quick access.</p>
      </div>
      <Button variant="outline" size="sm">Sort by recent</Button>
    </header>

    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card v-for="p in starred" :key="p.id" class="group flex flex-col">
        <CardHeader class="space-y-2">
          <div class="flex items-start justify-between gap-2">
            <CardTitle class="text-sm leading-snug">{{ p.title }}</CardTitle>
            <Star class="text-amber-500 fill-amber-500 size-4 shrink-0" />
          </div>
          <div class="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" class="text-[10px]">{{ p.model }}</Badge>
            <Badge v-for="tag in p.tags" :key="tag" variant="outline" class="text-[10px]">{{ tag }}</Badge>
          </div>
        </CardHeader>
        <CardContent class="flex flex-1 flex-col gap-3">
          <p class="text-muted-foreground line-clamp-3 text-xs leading-relaxed">{{ p.preview }}</p>
          <div class="mt-auto flex items-center justify-between border-t pt-3">
            <span class="text-muted-foreground text-[11px]">Starred {{ p.starred }}</span>
            <div class="flex items-center gap-1">
              <Button variant="ghost" size="icon" class="size-7"><Copy class="size-3.5" /></Button>
              <Button variant="ghost" size="icon" class="size-7"><Play class="size-3.5" /></Button>
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" size="icon" class="size-7"><MoreHorizontal class="size-3.5" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Rename</DropdownMenuItem>
                  <DropdownMenuItem>Fork</DropdownMenuItem>
                  <DropdownMenuItem>Move to folder…</DropdownMenuItem>
                  <DropdownMenuItem class="text-destructive">Unstar</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
