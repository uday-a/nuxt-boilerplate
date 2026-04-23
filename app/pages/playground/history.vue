<script setup lang="ts">
import { Search, Download, MoreHorizontal } from 'lucide-vue-next'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Playground · History' })

const sessions = [
  { id: 'sess_8e2a', prompt: 'Code review prompt v3', model: 'Genesis', started: '2026-05-15 14:02', duration: '3.4s', tokens: 4210, status: 'ok' },
  { id: 'sess_8e1b', prompt: 'Weekly digest generator', model: 'Explorer', started: '2026-05-15 11:48', duration: '12.1s', tokens: 18430, status: 'ok' },
  { id: 'sess_8dc4', prompt: 'SQL query explainer', model: 'Quantum', started: '2026-05-15 09:21', duration: '1.8s', tokens: 1290, status: 'ok' },
  { id: 'sess_8d92', prompt: 'Untitled prompt', model: 'Genesis', started: '2026-05-15 08:55', duration: '0.7s', tokens: 312, status: 'cancelled' },
  { id: 'sess_8c71', prompt: 'Onboarding email rewriter', model: 'Genesis', started: '2026-05-14 17:30', duration: '2.2s', tokens: 892, status: 'ok' },
  { id: 'sess_8c10', prompt: 'API doc summariser', model: 'Explorer', started: '2026-05-14 15:14', duration: '8.9s', tokens: 11240, status: 'ok' },
  { id: 'sess_8bd8', prompt: 'Slack thread TL;DR', model: 'Quantum', started: '2026-05-14 12:01', duration: '1.4s', tokens: 980, status: 'ok' },
  { id: 'sess_8b22', prompt: 'Bug repro generator', model: 'Genesis', started: '2026-05-14 09:38', duration: '5.0s', tokens: 6720, status: 'error' },
  { id: 'sess_8a44', prompt: 'Release notes drafter', model: 'Explorer', started: '2026-05-13 22:11', duration: '4.1s', tokens: 5310, status: 'ok' },
  { id: 'sess_89f1', prompt: 'Customer email triage', model: 'Quantum', started: '2026-05-13 18:47', duration: '2.6s', tokens: 2140, status: 'ok' },
  { id: 'sess_8985', prompt: 'Marketing copy A/B', model: 'Genesis', started: '2026-05-13 16:20', duration: '3.3s', tokens: 4880, status: 'ok' },
  { id: 'sess_8821', prompt: 'Unit test generator', model: 'Explorer', started: '2026-05-13 11:09', duration: '7.5s', tokens: 9210, status: 'ok' },
]

const statusVariant: Record<string, 'default' | 'destructive' | 'secondary'> = { ok: 'default', error: 'destructive', cancelled: 'secondary' }
</script>

<template>
  <div class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-semibold tracking-tight">Session history</h1>
      <p class="text-muted-foreground text-sm">Every prompt you've run, with timing and token counts.</p>
    </header>

    <div class="flex items-center gap-2">
      <div class="relative flex-1 max-w-sm">
        <Search class="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
        <Input placeholder="Search sessions..." class="pl-8 h-9" />
      </div>
      <Button variant="outline" size="sm" class="gap-1.5">
        <Download class="size-3.5" />
        Export
      </Button>
    </div>

    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-[120px]">Session</TableHead>
            <TableHead>Prompt</TableHead>
            <TableHead class="w-[100px]">Model</TableHead>
            <TableHead class="w-[160px]">Started</TableHead>
            <TableHead class="w-[90px] text-right">Duration</TableHead>
            <TableHead class="w-[100px] text-right">Tokens</TableHead>
            <TableHead class="w-[100px]">Status</TableHead>
            <TableHead class="w-[40px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="s in sessions" :key="s.id" class="cursor-pointer">
            <TableCell class="font-mono text-xs">{{ s.id }}</TableCell>
            <TableCell class="font-medium">{{ s.prompt }}</TableCell>
            <TableCell><Badge variant="outline" class="text-[10px]">{{ s.model }}</Badge></TableCell>
            <TableCell class="text-muted-foreground text-xs tabular-nums">{{ s.started }}</TableCell>
            <TableCell class="text-right tabular-nums text-xs">{{ s.duration }}</TableCell>
            <TableCell class="text-right tabular-nums text-xs">{{ s.tokens.toLocaleString() }}</TableCell>
            <TableCell><Badge :variant="statusVariant[s.status]" class="text-[10px] capitalize">{{ s.status }}</Badge></TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" size="icon" class="size-7"><MoreHorizontal class="size-3.5" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Open</DropdownMenuItem>
                  <DropdownMenuItem>Re-run</DropdownMenuItem>
                  <DropdownMenuItem>Fork</DropdownMenuItem>
                  <DropdownMenuItem class="text-destructive">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>
  </div>
</template>
