<script setup lang="ts">
import { ArrowLeft, Clock, BarChart3 } from 'lucide-vue-next'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Tutorials · Docs' })

const tutorials = [
  { slug: 'streaming-with-suspense', title: 'Streaming responses with Vue Suspense', category: 'Frontend', difficulty: 'intermediate', minutes: 12, summary: 'Wire a Nuxt page to a streaming completion using <Suspense> and an async iterator.' },
  { slug: 'tool-use-multi-step', title: 'Multi-step tool use with confirmation gates', category: 'Tool use', difficulty: 'advanced', minutes: 25, summary: 'Build an agent that pauses for user confirmation between high-risk tool calls.' },
  { slug: 'ticket-triage-classifier', title: 'Production ticket triage with Quantum', category: 'Classifier', difficulty: 'beginner', minutes: 8, summary: 'A tiny model, a tiny prompt, a 99% accurate triage classifier.' },
  { slug: 'codebase-qa-explorer', title: 'Codebase Q&A with the Explorer model', category: 'RAG', difficulty: 'intermediate', minutes: 18, summary: 'Bundle a repo, ask cross-file questions, get cited answers.' },
  { slug: 'json-mode-validation', title: 'JSON mode + Zod schema validation', category: 'Patterns', difficulty: 'beginner', minutes: 6, summary: 'Constrain the model to a Zod schema. Reject malformed output and retry.' },
  { slug: 'rate-limit-handling', title: 'Backoff strategies for rate-limited endpoints', category: 'Operations', difficulty: 'intermediate', minutes: 10, summary: 'Exponential backoff, jitter, and when to bypass it entirely.' },
  { slug: 'vision-image-caption', title: 'Image captioning with Genesis vision', category: 'Vision', difficulty: 'beginner', minutes: 7, summary: 'Pass image URLs, get alt-text-quality captions in three lines.' },
  { slug: 'batch-classification-job', title: 'Nightly batch classification with Quantum', category: 'Batch', difficulty: 'intermediate', minutes: 14, summary: 'Group 1,000 prompts into a single batch call. ~70% cost savings.' },
  { slug: 'session-pinning', title: 'Long-running sessions and pinning', category: 'Sessions', difficulty: 'beginner', minutes: 5, summary: 'Pin sessions that need to outlive the default 7-day TTL.' },
  { slug: 'custom-system-prompt-library', title: 'Building a reusable system-prompt library', category: 'Patterns', difficulty: 'intermediate', minutes: 11, summary: 'Version your system prompts. Roll them out per-user. A/B test rigorously.' },
  { slug: 'edge-deployment', title: 'Deploying to Cloudflare Workers', category: 'Operations', difficulty: 'intermediate', minutes: 9, summary: 'The SDK runs on Workers. One gotcha: streaming via SSE requires a specific header.' },
  { slug: 'eval-harness', title: 'Building a basic eval harness', category: 'Evaluation', difficulty: 'advanced', minutes: 22, summary: 'Score model output against a golden dataset. Track regressions per release.' },
  { slug: 'agent-with-memory', title: 'Adding persistent memory to an agent', category: 'Agents', difficulty: 'advanced', minutes: 28, summary: 'Vector-search past sessions, surface relevant context, write back conclusions.' },
  { slug: 'prompt-caching-101', title: 'Prompt caching for repeated system prompts', category: 'Performance', difficulty: 'beginner', minutes: 6, summary: 'Cut latency 40% on chat surfaces with a one-line caching directive.' },
]

const difficultyClass: Record<string, string> = {
  beginner: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  intermediate: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  advanced: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
}
</script>

<template>
  <div class="space-y-6">
    <NuxtLink to="/documentation" class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm">
      <ArrowLeft class="size-3" /> All documentation
    </NuxtLink>

    <header class="space-y-3">
      <p class="text-muted-foreground text-xs uppercase tracking-wider">Tutorials</p>
      <h1 class="text-3xl font-semibold tracking-tight">{{ tutorials.length }} step-by-step walkthroughs</h1>
      <p class="text-muted-foreground text-base">Production patterns, not toy examples. Each tutorial ships a runnable repo.</p>
      <Input placeholder="Filter tutorials by title or category…" class="h-9 max-w-md" />
    </header>

    <div class="grid gap-3 md:grid-cols-2">
      <Card v-for="t in tutorials" :key="t.slug" class="hover:border-foreground/20 cursor-pointer transition-colors">
        <CardContent class="space-y-2 py-4">
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-1">
              <div class="flex items-center gap-1.5">
                <Badge variant="outline" class="text-[10px]">{{ t.category }}</Badge>
                <Badge :class="['text-[10px] border-transparent', difficultyClass[t.difficulty]]">{{ t.difficulty }}</Badge>
              </div>
              <p class="text-sm font-semibold leading-snug">{{ t.title }}</p>
            </div>
            <span class="text-muted-foreground shrink-0 flex items-center gap-1 text-xs whitespace-nowrap">
              <Clock class="size-3" />{{ t.minutes }} min
            </span>
          </div>
          <p class="text-muted-foreground text-xs leading-relaxed">{{ t.summary }}</p>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
