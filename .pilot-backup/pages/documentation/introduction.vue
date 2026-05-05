<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { Card, CardContent } from '@/components/ui/card'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Introduction · Docs' })
</script>

<template>
  <div class="space-y-6">
    <NuxtLink to="/documentation" class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm">
      <ArrowLeft class="size-3" /> All documentation
    </NuxtLink>

    <div class="grid gap-8 lg:grid-cols-[1fr_220px]">
      <article class="prose prose-sm dark:prose-invert max-w-none space-y-5 leading-relaxed">
        <header class="not-prose space-y-2">
          <p class="text-muted-foreground text-xs uppercase tracking-wider">Introduction</p>
          <h1 class="text-3xl font-semibold tracking-tight">What this platform is</h1>
          <p class="text-muted-foreground text-base">A unified API for calling production-grade language models with the same SDK across three model families: Genesis, Explorer, and Quantum.</p>
        </header>

        <section id="overview" class="space-y-3 pt-4">
          <h2 class="scroll-mt-20 text-xl font-semibold tracking-tight">Overview</h2>
          <p>The platform exposes a single REST API and a single SDK (TypeScript-first, with Python and Go in beta). Behind that single surface lives three model families that share a tokenizer and a tool-use protocol but otherwise differ in latency, cost, and context window.</p>
          <p>If you've used any large-language-model API before, the shape will be familiar: you POST a list of messages, get back a stream of tokens. The differences are in the operational guarantees — predictable per-region latency, citation-aware retrieval, batch endpoints, and tool-use protocols that don't quietly drop your validation errors.</p>
        </section>

        <section id="design-philosophy" class="space-y-3 pt-4">
          <h2 class="scroll-mt-20 text-xl font-semibold tracking-tight">Design philosophy</h2>
          <p>Three principles guide every API decision:</p>
          <ol class="list-decimal space-y-2 pl-6">
            <li><strong>Stable shapes.</strong> Endpoint signatures don't change between minor versions. Breaking changes only ride major version bumps, and we ship them six months ahead with a deprecation header.</li>
            <li><strong>Operationally honest.</strong> Latency numbers in the model cards are p50 across the last 30 days of production traffic, not the cherry-picked best case. The status page is wired to the same metrics; if it says green, the API really is green.</li>
            <li><strong>Composable, not magical.</strong> No hidden side effects. The SDK doesn't silently retry, doesn't quietly fall back to a different model, doesn't lossily compress your context. If something goes wrong, you get a precise error code and the request stays in the log.</li>
          </ol>
        </section>

        <section id="who-its-for" class="space-y-3 pt-4">
          <h2 class="scroll-mt-20 text-xl font-semibold tracking-tight">Who it's for</h2>
          <p>Two audiences. First, application teams shipping product features powered by LLMs — chat surfaces, code review bots, document summarisers, classifiers — who want predictable latency, predictable cost, and a SDK that doesn't fight the rest of their stack.</p>
          <p>Second, platform teams building internal tools for their organisation — bespoke search, knowledge bases, ticket triage — who need the same predictability plus single-tenant deployment options and on-prem evaluations.</p>
        </section>

        <section id="concepts" class="space-y-3 pt-4">
          <h2 class="scroll-mt-20 text-xl font-semibold tracking-tight">Core concepts</h2>
          <p>Three nouns to learn:</p>
          <ul class="list-disc space-y-2 pl-6">
            <li><strong>Sessions</strong> hold the multi-turn state for a conversation. They expire after 7 days of inactivity, or never if you pin them.</li>
            <li><strong>Contexts</strong> are immutable bundles of files or text that you reference from many sessions. Use them for codebases, knowledge bases, or any input larger than ~10K tokens that you'd otherwise paste repeatedly.</li>
            <li><strong>Tools</strong> are typed function descriptions the model can call. The SDK validates arguments against the schema before invocation, so a malformed tool call fails fast instead of executing with garbage.</li>
          </ul>
        </section>

        <section id="next-steps" class="space-y-3 pt-4">
          <h2 class="scroll-mt-20 text-xl font-semibold tracking-tight">Next steps</h2>
          <p>If you're ready to write code, jump to <NuxtLink to="/documentation/get-started" class="text-foreground font-medium underline-offset-4 hover:underline">Get started</NuxtLink> for a 10-minute walkthrough. If you'd rather skim what the platform can do first, the <NuxtLink to="/documentation/tutorials" class="text-foreground font-medium underline-offset-4 hover:underline">Tutorials</NuxtLink> section has end-to-end examples for the eight most common use cases.</p>
        </section>
      </article>

      <aside class="hidden lg:block">
        <Card class="sticky top-20">
          <CardContent class="py-4 text-sm">
            <p class="text-muted-foreground mb-3 text-xs uppercase tracking-wider">On this page</p>
            <ul class="space-y-2">
              <li><a href="#overview" class="text-muted-foreground hover:text-foreground transition-colors">Overview</a></li>
              <li><a href="#design-philosophy" class="text-muted-foreground hover:text-foreground transition-colors">Design philosophy</a></li>
              <li><a href="#who-its-for" class="text-muted-foreground hover:text-foreground transition-colors">Who it's for</a></li>
              <li><a href="#concepts" class="text-muted-foreground hover:text-foreground transition-colors">Core concepts</a></li>
              <li><a href="#next-steps" class="text-muted-foreground hover:text-foreground transition-colors">Next steps</a></li>
            </ul>
          </CardContent>
        </Card>
      </aside>
    </div>
  </div>
</template>
