<script setup lang="ts">
import { ref } from 'vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Playground · Settings' })

const streamResponses = ref(true)
const autoSave = ref(true)
const showTokenCounter = ref(true)
const dangerousPrompts = ref(false)
const keepHistory = ref(true)
const temperature = ref([0.7])
const topP = ref([0.95])
const maxTokens = ref([2048])
const defaultModel = ref('genesis')
const renderMarkdown = ref('streaming')
const codeTheme = ref('github-dark')

const sections = [
  {
    title: 'Behavior',
    description: 'How the playground responds to your prompts.',
    rows: [
      { label: 'Stream responses', help: 'Show tokens as they arrive instead of waiting for the full response.', model: streamResponses, type: 'switch' },
      { label: 'Auto-save drafts', help: 'Drafts save to local storage every 5 seconds.', model: autoSave, type: 'switch' },
      { label: 'Show token counter', help: 'Live token count in the bottom-right of the prompt editor.', model: showTokenCounter, type: 'switch' },
      { label: 'Allow dangerous prompts', help: 'Disable safety filters. Requires confirmation each session.', model: dangerousPrompts, type: 'switch' },
      { label: 'Keep history', help: 'Persist session history for 90 days. Disable to use ephemeral mode.', model: keepHistory, type: 'switch' },
    ],
  },
]
</script>

<template>
  <div class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-semibold tracking-tight">Playground settings</h1>
      <p class="text-muted-foreground text-sm">Defaults for new sessions. Per-session overrides still apply.</p>
    </header>

    <Card v-for="section in sections" :key="section.title">
      <CardHeader>
        <CardTitle class="text-base">{{ section.title }}</CardTitle>
        <CardDescription>{{ section.description }}</CardDescription>
      </CardHeader>
      <CardContent class="space-y-1">
        <template v-for="(row, idx) in section.rows" :key="row.label">
          <div class="flex items-start justify-between gap-6 py-3">
            <div class="space-y-0.5">
              <Label :for="`playground-switch-${section.title}-${idx}`" class="text-sm font-medium">{{ row.label }}</Label>
              <p class="text-muted-foreground text-xs leading-relaxed">{{ row.help }}</p>
            </div>
            <Switch :id="`playground-switch-${section.title}-${idx}`" v-model="row.model.value" />
          </div>
          <Separator v-if="idx < section.rows.length - 1" />
        </template>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">Generation defaults</CardTitle>
        <CardDescription>Applied to every new session unless overridden.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <Label for="slider-temperature" class="text-sm font-medium">Temperature</Label>
            <span class="text-muted-foreground font-mono text-xs tabular-nums">{{ temperature[0] }}</span>
          </div>
          <Slider id="slider-temperature" v-model="temperature" :min="0" :max="2" :step="0.1" aria-label="Temperature" />
          <p class="text-muted-foreground text-xs">Higher = more creative. Lower = more deterministic.</p>
        </div>
        <Separator />
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <Label for="slider-top-p" class="text-sm font-medium">Top P</Label>
            <span class="text-muted-foreground font-mono text-xs tabular-nums">{{ topP[0] }}</span>
          </div>
          <Slider id="slider-top-p" v-model="topP" :min="0" :max="1" :step="0.05" aria-label="Top P" />
        </div>
        <Separator />
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <Label for="slider-max-tokens" class="text-sm font-medium">Max tokens</Label>
            <span class="text-muted-foreground font-mono text-xs tabular-nums">{{ maxTokens[0] }}</span>
          </div>
          <Slider id="slider-max-tokens" v-model="maxTokens" :min="256" :max="8192" :step="256" aria-label="Max tokens" />
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">Appearance</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex items-center justify-between gap-4">
          <Label class="text-sm font-medium">Default model</Label>
          <Select v-model="defaultModel">
            <SelectTrigger class="w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="genesis">Genesis</SelectItem>
              <SelectItem value="explorer">Explorer</SelectItem>
              <SelectItem value="quantum">Quantum</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Separator />
        <div class="flex items-center justify-between gap-4">
          <Label class="text-sm font-medium">Markdown rendering</Label>
          <Select v-model="renderMarkdown">
            <SelectTrigger class="w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="streaming">During streaming</SelectItem>
              <SelectItem value="after">After completion</SelectItem>
              <SelectItem value="never">Never (raw)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Separator />
        <div class="flex items-center justify-between gap-4">
          <Label class="text-sm font-medium">Code block theme</Label>
          <Select v-model="codeTheme">
            <SelectTrigger class="w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="github-dark">GitHub Dark</SelectItem>
              <SelectItem value="github-light">GitHub Light</SelectItem>
              <SelectItem value="dracula">Dracula</SelectItem>
              <SelectItem value="solarized">Solarized</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
