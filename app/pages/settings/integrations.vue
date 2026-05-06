<script setup lang="ts">
import { Github, Slack, Plug, Webhook, Plus, ExternalLink } from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Integrations · Settings' })

type Integration = {
  id: string
  name: string
  description: string
  icon: typeof Github
  connected: boolean
  account?: string
}

const integrations: Integration[] = [
  { id: 'github', name: 'GitHub', description: 'Link repositories and surface PR activity in the workspace.', icon: Github, connected: true, account: 'uday' },
  { id: 'slack', name: 'Slack', description: 'Send notifications and command shortcuts into a Slack workspace.', icon: Slack, connected: false },
  { id: 'webhook', name: 'Webhooks', description: 'POST workspace events to a URL you control.', icon: Webhook, connected: false },
]
</script>

<template>
  <div class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-semibold tracking-tight">
        Integrations
      </h1>
      <p class="text-muted-foreground text-sm">
        Connect external services and configure webhooks.
      </p>
    </header>

    <Card>
      <CardHeader>
        <CardTitle class="text-base">
          Available
        </CardTitle>
        <CardDescription>OAuth apps and event sinks.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        <div
          v-for="(i, idx) in integrations"
          :key="i.id"
        >
          <div class="flex items-start justify-between gap-4 py-2">
            <div class="flex items-start gap-3">
              <div class="bg-muted text-muted-foreground flex size-10 items-center justify-center rounded-md">
                <component
                  :is="i.icon"
                  class="size-5"
                />
              </div>
              <div class="space-y-0.5">
                <div class="flex items-center gap-2">
                  <p class="text-sm font-medium">
                    {{ i.name }}
                  </p>
                  <Badge
                    v-if="i.connected"
                    variant="secondary"
                    class="text-[10px]"
                  >
                    Connected{{ i.account ? ` · ${i.account}` : '' }}
                  </Badge>
                </div>
                <p class="text-muted-foreground text-xs">
                  {{ i.description }}
                </p>
              </div>
            </div>
            <Button
              v-if="i.connected"
              variant="outline"
              size="sm"
            >
              Disconnect
            </Button>
            <Button
              v-else
              size="sm"
            >
              <Plug class="size-4" />
              Connect
            </Button>
          </div>
          <Separator v-if="idx < integrations.length - 1" />
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader class="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle class="text-base">
            Webhooks
          </CardTitle>
          <CardDescription>POST workspace events as JSON to your endpoint.</CardDescription>
        </div>
        <Button size="sm">
          <Plus class="size-4" />
          Add webhook
        </Button>
      </CardHeader>
      <CardContent>
        <div class="text-muted-foreground flex items-center gap-2 text-sm">
          No webhooks configured.
          <a
            href="#"
            class="text-foreground inline-flex items-center gap-1 underline-offset-4 hover:underline"
          >
            Read the docs <ExternalLink class="size-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
