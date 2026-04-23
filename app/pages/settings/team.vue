<script setup lang="ts">
import { UserPlus, MoreHorizontal, Mail, Search } from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: 'Team · Settings' })

const members = [
  { id: '1', name: 'Sarah Connor', email: 'sarah@acme.com', role: 'Owner', status: 'active', lastActive: '2m ago', color: 'bg-orange-500/15 text-orange-600 dark:text-orange-400' },
  { id: '2', name: 'Marcus Rivera', email: 'marcus@acme.com', role: 'Admin', status: 'active', lastActive: '14m ago', color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400' },
  { id: '3', name: 'Alice Chen', email: 'alice@acme.com', role: 'Member', status: 'active', lastActive: '1h ago', color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
  { id: '4', name: 'David Kim', email: 'david@acme.com', role: 'Member', status: 'active', lastActive: '3h ago', color: 'bg-violet-500/15 text-violet-600 dark:text-violet-400' },
  { id: '5', name: 'Eva Johnson', email: 'eva@acme.com', role: 'Member', status: 'active', lastActive: 'Yesterday', color: 'bg-rose-500/15 text-rose-600 dark:text-rose-400' },
  { id: '6', name: 'Frank Lee', email: 'frank@acme.com', role: 'Billing', status: 'active', lastActive: '2d ago', color: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400' },
  { id: '7', name: 'Olive Park', email: 'olive@acme.com', role: 'Member', status: 'active', lastActive: '4d ago', color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' },
  { id: '8', name: 'Marcus Tan', email: 'm.tan@acme.com', role: 'Member', status: 'active', lastActive: '6d ago', color: 'bg-sky-500/15 text-sky-600 dark:text-sky-400' },
]

const pending = [
  { email: 'priya.shah@acme.com', role: 'Member', invitedBy: 'Sarah Connor', expires: 'in 5 days' },
  { email: 'tom.bauer@acme.com', role: 'Admin', invitedBy: 'Marcus Rivera', expires: 'in 6 days' },
]

const initials = (n: string) => n.split(' ').map((p) => p[0]).join('').toUpperCase()
</script>

<template>
  <div class="space-y-6">
    <header class="flex items-end justify-between gap-4">
      <div class="space-y-1">
        <h1 class="text-2xl font-semibold tracking-tight">Team</h1>
        <p class="text-muted-foreground text-sm">{{ members.length }} members · {{ pending.length }} pending invites · 1 owner</p>
      </div>
      <Button class="gap-2"><UserPlus class="size-4" /> Invite member</Button>
    </header>

    <div class="flex items-center gap-2">
      <div class="relative flex-1 max-w-sm">
        <Search class="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
        <Input placeholder="Search by name or email…" class="pl-8 h-9" />
      </div>
    </div>

    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last active</TableHead>
            <TableHead class="w-[40px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="m in members" :key="m.id">
            <TableCell>
              <div class="flex items-center gap-3">
                <Avatar class="size-8"><AvatarFallback :class="['text-[10px] font-semibold', m.color]">{{ initials(m.name) }}</AvatarFallback></Avatar>
                <div>
                  <p class="text-sm font-medium">{{ m.name }}</p>
                  <p class="text-muted-foreground text-xs">{{ m.email }}</p>
                </div>
              </div>
            </TableCell>
            <TableCell><Badge variant="outline" class="text-[10px]">{{ m.role }}</Badge></TableCell>
            <TableCell>
              <span class="flex items-center gap-1.5 text-xs">
                <span class="bg-emerald-500 size-1.5 rounded-full" />
                {{ m.status }}
              </span>
            </TableCell>
            <TableCell class="text-muted-foreground text-xs">{{ m.lastActive }}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger as-child><Button variant="ghost" size="icon" class="size-7"><MoreHorizontal class="size-3.5" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Change role…</DropdownMenuItem>
                  <DropdownMenuItem>View activity</DropdownMenuItem>
                  <DropdownMenuItem class="text-destructive">Remove from workspace</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="text-base flex items-center gap-2"><Mail class="size-4" /> Pending invites</CardTitle>
        <CardDescription>Resend or revoke invitations that haven't been accepted yet.</CardDescription>
      </CardHeader>
      <CardContent class="divide-y">
        <div v-for="p in pending" :key="p.email" class="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
          <div class="space-y-0.5">
            <p class="text-sm font-medium">{{ p.email }}</p>
            <p class="text-muted-foreground text-xs">Invited as {{ p.role }} by {{ p.invitedBy }} · expires {{ p.expires }}</p>
          </div>
          <div class="flex items-center gap-2">
            <Button variant="outline" size="sm">Resend</Button>
            <Button variant="ghost" size="sm" class="text-destructive">Revoke</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
