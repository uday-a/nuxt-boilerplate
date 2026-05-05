<script setup lang="ts">
import { Bot, Play, Copy, Check, ArrowLeft } from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Genesis · Models' })

const versions = [
  { v: 'genesis-1.8', released: '2026-04-22', context: '128K', notes: 'Tool-use reliability +12%. Vision crop accuracy improved.' },
  { v: 'genesis-1.7', released: '2026-03-04', context: '128K', notes: 'Context window expanded from 64K → 128K. Latency neutral.' },
  { v: 'genesis-1.6', released: '2026-01-19', context: '64K', notes: 'JSON mode bug fixes. Cheaper tier introduced.' },
  { v: 'genesis-1.5', released: '2025-11-28', context: '64K', notes: 'Initial public release.' },
]

const benchmarks = [
  { name: 'MMLU', score: 88.2, vs: '+2.1 vs Explorer' },
  { name: 'HumanEval', score: 84.7, vs: '+8.4 vs Quantum' },
  { name: 'GSM8K', score: 92.1, vs: '+1.3 vs Explorer' },
  { name: 'MATH', score: 71.4, vs: '+4.2 vs Quantum' },
]
</script>

<template>
  <div class="space-y-6">
    <NuxtLink to="/models" class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm">
      <ArrowLeft class="size-3" /> All models
    </NuxtLink>

    <header class="flex items-start justify-between gap-6">
      <div class="flex items-center gap-4">
        <div class="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex size-14 items-center justify-center rounded-xl">
          <Bot class="size-7" />
        </div>
        <div class="space-y-1">
          <h1 class="text-2xl font-semibold tracking-tight">Genesis</h1>
          <p class="text-muted-foreground text-sm">Workhorse model. Strong at code, tool use, and structured output.</p>
          <div class="flex gap-1.5 pt-1">
            <Badge variant="secondary" class="text-[10px]">128K context</Badge>
            <Badge variant="secondary" class="text-[10px]">~400ms p50</Badge>
            <Badge variant="secondary" class="text-[10px]">Vision</Badge>
            <Badge variant="secondary" class="text-[10px]">Tool use</Badge>
          </div>
        </div>
      </div>
      <Button class="gap-2"><Play class="size-4" /> Try in Playground</Button>
    </header>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader class="pb-2"><CardDescription class="text-xs uppercase tracking-wider">Input price</CardDescription></CardHeader>
        <CardContent><p class="text-2xl font-semibold tabular-nums">$2.40</p><p class="text-muted-foreground text-xs">per 1M tokens</p></CardContent>
      </Card>
      <Card>
        <CardHeader class="pb-2"><CardDescription class="text-xs uppercase tracking-wider">Output price</CardDescription></CardHeader>
        <CardContent><p class="text-2xl font-semibold tabular-nums">$9.60</p><p class="text-muted-foreground text-xs">per 1M tokens</p></CardContent>
      </Card>
      <Card>
        <CardHeader class="pb-2"><CardDescription class="text-xs uppercase tracking-wider">Throughput</CardDescription></CardHeader>
        <CardContent><p class="text-2xl font-semibold tabular-nums">82 tok/s</p><p class="text-muted-foreground text-xs">median streaming</p></CardContent>
      </Card>
      <Card>
        <CardHeader class="pb-2"><CardDescription class="text-xs uppercase tracking-wider">Rate limit</CardDescription></CardHeader>
        <CardContent><p class="text-2xl font-semibold tabular-nums">600/min</p><p class="text-muted-foreground text-xs">Pro tier</p></CardContent>
      </Card>
    </div>

    <Tabs default-value="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
        <TabsTrigger value="example">Code sample</TabsTrigger>
        <TabsTrigger value="versions">Versions</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" class="space-y-4">
        <Card>
          <CardHeader><CardTitle class="text-base">What Genesis is good at</CardTitle></CardHeader>
          <CardContent class="text-muted-foreground space-y-3 text-sm leading-relaxed">
            <p>Genesis is the default model in the Playground for a reason: it strikes the best balance of latency, cost, and output quality across general-purpose tasks. If you don't know which model to reach for, start here.</p>
            <p>It's particularly strong at code generation (Python, TypeScript, Go, Rust), structured JSON output (when the system prompt asks for a schema), multi-turn tool-use planning, and producing prose that reads like a human wrote it on a deadline.</p>
            <p>Where Genesis underperforms: tasks needing &gt;128K context (use Explorer) and high-throughput classification or extraction (use Quantum, which is 5× cheaper and 5× faster for that shape).</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="benchmarks">
        <Card>
          <CardHeader><CardTitle class="text-base">Public benchmarks</CardTitle><CardDescription>Higher is better. Numbers from the latest model card.</CardDescription></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Benchmark</TableHead>
                  <TableHead class="text-right">Score</TableHead>
                  <TableHead class="text-right">vs Family</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="b in benchmarks" :key="b.name">
                  <TableCell class="font-medium">{{ b.name }}</TableCell>
                  <TableCell class="text-right tabular-nums">{{ b.score }}</TableCell>
                  <TableCell class="text-emerald-600 dark:text-emerald-400 text-right text-xs">{{ b.vs }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="example">
        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle class="text-base">Quickstart</CardTitle>
              <CardDescription>Minimal TypeScript example using the SDK.</CardDescription>
            </div>
            <Button variant="ghost" size="icon" class="size-7"><Copy class="size-3.5" /></Button>
          </CardHeader>
          <CardContent>
            <pre class="bg-muted/60 overflow-x-auto rounded-lg p-4 text-xs leading-relaxed font-mono"><code>import { Client } from '@uipkge/sdk'

const client = new Client({ apiKey: process.env.API_KEY })

const response = await client.complete({
  model: 'genesis-1.8',
  messages: [
    { role: 'system', content: 'You are a senior code reviewer.' },
    { role: 'user', content: 'Review the following pull request…' },
  ],
  max_tokens: 1024,
  temperature: 0.3,
})

console.log(response.content)</code></pre>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="versions">
        <Card>
          <CardHeader><CardTitle class="text-base">Version history</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Version</TableHead>
                  <TableHead>Released</TableHead>
                  <TableHead>Context</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="v in versions" :key="v.v">
                  <TableCell class="font-mono text-xs">{{ v.v }}</TableCell>
                  <TableCell class="text-muted-foreground text-xs tabular-nums">{{ v.released }}</TableCell>
                  <TableCell>{{ v.context }}</TableCell>
                  <TableCell class="text-muted-foreground text-xs">{{ v.notes }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>
