<script setup lang="ts">
import { Atom, Play, Copy, ArrowLeft } from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Quantum · Models' })

const versions = [
  { v: 'quantum-3.0', released: '2026-04-30', context: '32K', notes: 'p50 latency 80ms, down from 110ms. Embeddings endpoint added.' },
  { v: 'quantum-2.4', released: '2026-02-19', context: '32K', notes: 'Better JSON-mode reliability on small models.' },
  { v: 'quantum-2.3', released: '2025-12-15', context: '16K', notes: 'Context window doubled. New tiny preset for classification.' },
  { v: 'quantum-2.2', released: '2025-10-04', context: '8K', notes: 'Initial public release.' },
]

const benchmarks = [
  { name: 'Throughput (single)', score: '780 tok/s', vs: '8.5× Genesis' },
  { name: 'Latency p50', score: '80ms', vs: '5× faster than Genesis' },
  { name: 'Cost / 1M input', score: '$0.40', vs: '6× cheaper than Genesis' },
  { name: 'Classification (5-way)', score: 91.2, vs: '-3.6 vs Genesis' },
]
</script>

<template>
  <div class="space-y-6">
    <NuxtLink to="/models" class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm">
      <ArrowLeft class="size-3" /> All models
    </NuxtLink>

    <header class="flex items-start justify-between gap-6">
      <div class="flex items-center gap-4">
        <div class="bg-violet-500/10 text-violet-600 dark:text-violet-400 flex size-14 items-center justify-center rounded-xl">
          <Atom class="size-7" />
        </div>
        <div class="space-y-1">
          <h1 class="text-2xl font-semibold tracking-tight">Quantum</h1>
          <p class="text-muted-foreground text-sm">Cheap and fast. Built for classification, routing, and high-volume extraction.</p>
          <div class="flex gap-1.5 pt-1">
            <Badge variant="secondary" class="text-[10px]">32K context</Badge>
            <Badge variant="secondary" class="text-[10px]">~80ms p50</Badge>
            <Badge variant="secondary" class="text-[10px]">Embeddings</Badge>
            <Badge variant="secondary" class="text-[10px]">Batch API</Badge>
          </div>
        </div>
      </div>
      <Button class="gap-2"><Play class="size-4" /> Try in Playground</Button>
    </header>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader class="pb-2"><CardDescription class="text-xs uppercase tracking-wider">Input price</CardDescription></CardHeader>
        <CardContent><p class="text-2xl font-semibold tabular-nums">$0.40</p><p class="text-muted-foreground text-xs">per 1M tokens</p></CardContent>
      </Card>
      <Card>
        <CardHeader class="pb-2"><CardDescription class="text-xs uppercase tracking-wider">Output price</CardDescription></CardHeader>
        <CardContent><p class="text-2xl font-semibold tabular-nums">$1.60</p><p class="text-muted-foreground text-xs">per 1M tokens</p></CardContent>
      </Card>
      <Card>
        <CardHeader class="pb-2"><CardDescription class="text-xs uppercase tracking-wider">Throughput</CardDescription></CardHeader>
        <CardContent><p class="text-2xl font-semibold tabular-nums">780 tok/s</p><p class="text-muted-foreground text-xs">batch streaming</p></CardContent>
      </Card>
      <Card>
        <CardHeader class="pb-2"><CardDescription class="text-xs uppercase tracking-wider">Rate limit</CardDescription></CardHeader>
        <CardContent><p class="text-2xl font-semibold tabular-nums">3,000/min</p><p class="text-muted-foreground text-xs">Pro tier</p></CardContent>
      </Card>
    </div>

    <Tabs default-value="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
        <TabsTrigger value="example">Code sample</TabsTrigger>
        <TabsTrigger value="versions">Versions</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <Card>
          <CardHeader><CardTitle class="text-base">Where Quantum shines</CardTitle></CardHeader>
          <CardContent class="text-muted-foreground space-y-3 text-sm leading-relaxed">
            <p>Quantum is built for tasks where you're calling the model thousands of times per minute and need predictable cost. It's the right choice for ticket classification, intent routing, structured extraction (NER, key-value), and anything that fits a labelled-output schema.</p>
            <p>Quantum is not the right choice for open-ended generation, long-form prose, or complex multi-step reasoning — Genesis will give you noticeably better output for ~6× the cost, but the cost is justified when the output quality matters.</p>
            <p>The batch endpoint groups up to 256 prompts into a single call at the same per-token price. Use it for nightly reclassification of a whole dataset.</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="benchmarks">
        <Card>
          <CardHeader><CardTitle class="text-base">Performance vs cost</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
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
              <CardTitle class="text-base">Ticket classifier</CardTitle>
              <CardDescription>Constrained output, sub-100ms latency.</CardDescription>
            </div>
            <Button variant="ghost" size="icon" class="size-7"><Copy class="size-3.5" /></Button>
          </CardHeader>
          <CardContent>
            <pre class="bg-muted/60 overflow-x-auto rounded-lg p-4 text-xs leading-relaxed font-mono"><code>import { Client } from '@uipkge/sdk'

const client = new Client({ apiKey: process.env.API_KEY })

const response = await client.complete({
  model: 'quantum-3.0',
  messages: [
    { role: 'system', content: 'Classify the ticket into: billing | bug | how-to | spam. Reply with one word.' },
    { role: 'user', content: ticket.body },
  ],
  max_tokens: 4,
  temperature: 0,
})

await db.tickets.update(ticket.id, { category: response.content.trim() })</code></pre>
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
