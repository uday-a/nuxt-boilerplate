<script setup lang="ts">
import { ArrowLeft, Copy, CheckCircle2 } from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Get started · Docs' })

const steps = [
  {
    n: 1,
    title: 'Install the SDK',
    description: 'TypeScript-first, works with any Node 20+ project. Python and Go SDKs are in beta.',
    code: 'npm install @uipkge/sdk',
    lang: 'bash',
  },
  {
    n: 2,
    title: 'Set your API key',
    description: 'Generate a key in Settings → API keys. Treat it like a database password: never commit, never log.',
    code: '# .env\nUIPKGE_API_KEY=sk_live_8e3a...',
    lang: 'shell',
  },
  {
    n: 3,
    title: 'Make your first request',
    description: 'Three lines once the client is constructed. Stream is true by default.',
    code: `import { Client } from '@uipkge/sdk'

const client = new Client({ apiKey: process.env.UIPKGE_API_KEY })

const response = await client.complete({
  model: 'genesis-1.8',
  messages: [
    { role: 'user', content: 'In one sentence, what is observability?' },
  ],
})

console.log(response.content)`,
    lang: 'typescript',
  },
  {
    n: 4,
    title: 'Stream the response',
    description: 'For UIs, you almost always want streaming. The SDK exposes async iterators.',
    code: `const stream = client.complete.stream({
  model: 'genesis-1.8',
  messages,
})

for await (const chunk of stream) {
  process.stdout.write(chunk.content)
}`,
    lang: 'typescript',
  },
  {
    n: 5,
    title: 'Add tool use',
    description: 'Pass a tools array; the SDK validates calls against your schemas before invoking the handler.',
    code: `const response = await client.complete({
  model: 'genesis-1.8',
  messages,
  tools: [
    {
      name: 'lookupOrder',
      description: 'Look up an order by its public ID.',
      parameters: { orderId: 'string' },
      handler: async ({ orderId }) => db.orders.find(orderId),
    },
  ],
})`,
    lang: 'typescript',
  },
]
</script>

<template>
  <div class="space-y-6">
    <NuxtLink to="/documentation" class="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm">
      <ArrowLeft class="size-3" /> All documentation
    </NuxtLink>

    <header class="space-y-2">
      <p class="text-muted-foreground text-xs uppercase tracking-wider">Get started</p>
      <h1 class="text-3xl font-semibold tracking-tight">10-minute integration</h1>
      <p class="text-muted-foreground text-base">Five steps from <code class="bg-muted rounded px-1.5 py-0.5 font-mono text-xs">npm install</code> to streaming your first response.</p>
      <div class="flex gap-2 pt-2">
        <Badge variant="secondary" class="text-[10px]">TypeScript</Badge>
        <Badge variant="secondary" class="text-[10px]">Node 20+</Badge>
        <Badge variant="secondary" class="text-[10px]">Streaming</Badge>
        <Badge variant="secondary" class="text-[10px]">Tool use</Badge>
      </div>
    </header>

    <Card v-for="step in steps" :key="step.n">
      <CardHeader>
        <div class="flex items-start gap-4">
          <div class="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular-nums">{{ step.n }}</div>
          <div class="space-y-1">
            <CardTitle class="text-base">{{ step.title }}</CardTitle>
            <CardDescription>{{ step.description }}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div class="bg-muted/60 group relative rounded-lg p-4">
          <Button variant="ghost" size="icon" class="absolute right-2 top-2 size-7 opacity-0 transition-opacity group-hover:opacity-100">
            <Copy class="size-3.5" />
          </Button>
          <pre class="overflow-x-auto text-xs leading-relaxed font-mono"><code>{{ step.code }}</code></pre>
        </div>
      </CardContent>
    </Card>

    <Card class="border-emerald-500/30 bg-emerald-500/5">
      <CardContent class="flex items-center gap-4 py-5">
        <CheckCircle2 class="text-emerald-500 size-6 shrink-0" />
        <div class="space-y-1">
          <p class="text-sm font-semibold">That's it — you're live.</p>
          <p class="text-muted-foreground text-xs">Next: explore the <NuxtLink to="/documentation/tutorials" class="text-foreground underline-offset-4 hover:underline">tutorials</NuxtLink> for end-to-end recipes, or browse the <NuxtLink to="/models" class="text-foreground underline-offset-4 hover:underline">model catalog</NuxtLink> to pick the right family.</p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
