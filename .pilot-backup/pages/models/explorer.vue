<script setup lang="ts">
import { Telescope, Play, Copy, ArrowLeft } from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Explorer · Models' })

const versions = [
  { v: 'explorer-2.1', released: '2026-05-02', context: '1M', notes: 'Citation accuracy on multi-doc retrieval improved from 76% → 84%.' },
  { v: 'explorer-2.0', released: '2026-02-14', context: '1M', notes: 'Million-token context. New "research mode" tool calls.' },
  { v: 'explorer-1.4', released: '2025-12-08', context: '256K', notes: 'Long-doc summarisation regression fixed.' },
  { v: 'explorer-1.3', released: '2025-10-21', context: '256K', notes: 'Initial public release.' },
]

const benchmarks = [
  { name: 'Needle-in-haystack (1M)', score: 96.1, vs: 'Only model that handles 1M' },
  { name: 'NIAH (128K)', score: 99.4, vs: '+0.2 vs Genesis' },
  { name: 'GovReport', score: 82.7, vs: '+12.1 vs Genesis' },
  { name: 'Citation F1', score: 84.0, vs: 'family best' },
]
</script>

<template>
  <div class="space-y-6">
    <NuxtLink to="/models" class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm">
      <ArrowLeft class="size-3" /> All models
    </NuxtLink>

    <header class="flex items-start justify-between gap-6">
      <div class="flex items-center gap-4">
        <div class="bg-blue-500/10 text-blue-600 dark:text-blue-400 flex size-14 items-center justify-center rounded-xl">
          <Telescope class="size-7" />
        </div>
        <div class="space-y-1">
          <h1 class="text-2xl font-semibold tracking-tight">Explorer</h1>
          <p class="text-muted-foreground text-sm">Million-token context for codebase Q&A, research, and long-form analysis.</p>
          <div class="flex gap-1.5 pt-1">
            <Badge variant="secondary" class="text-[10px]">1M context</Badge>
            <Badge variant="secondary" class="text-[10px]">~1.2s p50</Badge>
            <Badge variant="secondary" class="text-[10px]">Citation</Badge>
            <Badge variant="secondary" class="text-[10px]">Research mode</Badge>
          </div>
        </div>
      </div>
      <Button class="gap-2"><Play class="size-4" /> Try in Playground</Button>
    </header>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader class="pb-2"><CardDescription class="text-xs uppercase tracking-wider">Input price</CardDescription></CardHeader>
        <CardContent><p class="text-2xl font-semibold tabular-nums">$5.00</p><p class="text-muted-foreground text-xs">per 1M tokens</p></CardContent>
      </Card>
      <Card>
        <CardHeader class="pb-2"><CardDescription class="text-xs uppercase tracking-wider">Output price</CardDescription></CardHeader>
        <CardContent><p class="text-2xl font-semibold tabular-nums">$24.00</p><p class="text-muted-foreground text-xs">per 1M tokens</p></CardContent>
      </Card>
      <Card>
        <CardHeader class="pb-2"><CardDescription class="text-xs uppercase tracking-wider">Throughput</CardDescription></CardHeader>
        <CardContent><p class="text-2xl font-semibold tabular-nums">38 tok/s</p><p class="text-muted-foreground text-xs">median streaming</p></CardContent>
      </Card>
      <Card>
        <CardHeader class="pb-2"><CardDescription class="text-xs uppercase tracking-wider">Rate limit</CardDescription></CardHeader>
        <CardContent><p class="text-2xl font-semibold tabular-nums">200/min</p><p class="text-muted-foreground text-xs">Pro tier</p></CardContent>
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
          <CardHeader><CardTitle class="text-base">When to reach for Explorer</CardTitle></CardHeader>
          <CardContent class="text-muted-foreground space-y-3 text-sm leading-relaxed">
            <p>Explorer is the model to use when the prompt exceeds what Genesis can hold. Million-token context means you can feed it an entire codebase, a multi-hundred-page legal brief, or every issue your project has ever filed and ask cross-cutting questions.</p>
            <p>Three things to know: (1) latency scales with input size, so cache aggressively. (2) Citation output mode is on by default — Explorer returns <code class="font-mono text-xs">[span]</code> markers pointing back into the source. (3) Tool use exists but is less aggressive than Genesis; Explorer prefers to read first.</p>
            <p>If your prompt fits under 64K tokens, you are very likely overpaying with Explorer. Switch to Genesis for ~half the price and 3× the speed.</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="benchmarks">
        <Card>
          <CardHeader><CardTitle class="text-base">Long-context benchmarks</CardTitle><CardDescription>Higher is better.</CardDescription></CardHeader>
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
              <CardTitle class="text-base">Whole-codebase Q&A</CardTitle>
              <CardDescription>Stream a repo via the files API, then ask cross-cutting questions.</CardDescription>
            </div>
            <Button variant="ghost" size="icon" class="size-7"><Copy class="size-3.5" /></Button>
          </CardHeader>
          <CardContent>
            <pre class="bg-muted/60 overflow-x-auto rounded-lg p-4 text-xs leading-relaxed font-mono"><code>import { Client } from '@uipkge/sdk'

const client = new Client({ apiKey: process.env.API_KEY })

const fileBundle = await client.files.bundle('./src')

const response = await client.complete({
  model: 'explorer-2.1',
  files: [fileBundle.id],
  messages: [{ role: 'user', content: 'Which modules touch the auth flow?' }],
  cite: true,
})

for (const span of response.citations) {
  console.log(`${span.file}:${span.line} -- ${span.quote}`)
}</code></pre>
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
