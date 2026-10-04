<script setup lang="ts">
import { UserPlus, Search, Loader2, AlertCircle, CheckCircle2, CloudOff, CalendarIcon, Pencil, RotateCcw, Trash2, UserX } from '@/lib/icon-pack'
import { toast } from 'vue-sonner'
import { DateFormatter, getLocalTimeZone } from '@internationalized/date'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RangeCalendar } from '@/components/ui/range-calendar'
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Page, PageHeader, PageHeaderHeading, PageBody } from '@/components/ui/page'
import { EmptyState } from '@/components/ui/empty-state'
import type { ApiResponse } from '~~/server/utils/response'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
const title = useRouteLabel()
useHead({ title })

const { t, locale } = useI18n()
const { user } = useUserSession()

interface Member {
  id: number
  name: string | null
  email: string
  role: string
  avatarUrl: string | null
  createdAt: string | Date
}

interface PendingInvite {
  id: number
  email: string
  role: string
  invitedBy: number | null
  expiresAt: string | Date
  createdAt: string | Date
}

const canInvite = computed(() => user.value?.role === 'admin' || user.value?.role === 'editor')

const { data: membersRes, pending: membersPending, error: membersError, refresh: refreshMembers } = await useFetch<ApiResponse<{ members: Member[] }>>('/api/team/members')
const { data: invitesRes, pending: invitesPending, refresh: refreshInvites, error: invitesError } = await useFetch<ApiResponse<{ invites: PendingInvite[] }>>('/api/team/invites')

// Local copy so the demo row actions (edit / remove / undo) have somewhere
// to write. Wire to PATCH / DELETE /api/team/members/:id with a real DB.
const members = ref<Member[]>([])
watch(membersRes, (r) => {
  members.value = r?.ok ? r.data.members.map(m => ({ ...m })) : []
}, { immediate: true })
const pendingInvites = computed<PendingInvite[]>(() =>
  invitesRes.value?.ok ? invitesRes.value.data.invites : [],
)

// Boolean only: raw fetch errors (`[GET] "/api/...": 500`) never reach
// the UI. The template shows a human message + Retry instead.
const membersFailed = computed(() =>
  Boolean(membersError.value) || Boolean(membersRes.value && !membersRes.value.ok),
)
// A 403 on the invites endpoint just means the viewer isn't admin/editor —
// not a failure. Show the viewer note instead of an error banner.
const invitesForbidden = computed(() => {
  const status = (invitesError.value as { statusCode?: number } | null)?.statusCode
  if (status === 403) return true
  const code = invitesRes.value && !invitesRes.value.ok ? invitesRes.value.error.code : null
  return code === 'FORBIDDEN'
})
const invitesFailed = computed(() => {
  if (invitesForbidden.value) return false
  return Boolean(invitesError.value) || Boolean(invitesRes.value && !invitesRes.value.ok)
})

const headerDescription = computed(() =>
  membersFailed.value
    ? 'Members, roles, and pending invitations.'
    : invitesForbidden.value || invitesFailed.value
      ? `${members.value.length} members`
      : t('settings.team.subtitle', { members: members.value.length, pending: pendingInvites.value.length }),
)

const ROLES = ['admin', 'editor', 'user'] as const

// ── Filters ────────────────────────────────────────────────────────────
const query = ref('')
const roleFilter = ref<'all' | typeof ROLES[number]>('all')
// DateValue brands differ between @internationalized/date and reka-ui.
const joinedRange = ref<any>(undefined)
const rangeOpen = ref(false)
watch(joinedRange, (v) => {
  if (v?.start && v?.end) rangeOpen.value = false
})
const rangeLabel = computed(() => {
  const r = joinedRange.value
  if (!r?.start || !r?.end) return t('admin.filters.joined')
  const df = new DateFormatter(locale.value, { month: 'short', day: 'numeric', year: 'numeric' })
  const tz = getLocalTimeZone()
  return `${df.format(r.start.toDate(tz))} – ${df.format(r.end.toDate(tz))}`
})

const filteredMembers = computed(() => {
  const q = query.value.trim().toLowerCase()
  const r = joinedRange.value
  const tz = getLocalTimeZone()
  const from = r?.start ? r.start.toDate(tz).getTime() : null
  const to = r?.end ? r.end.toDate(tz).getTime() + 86_400_000 - 1 : null
  return members.value.filter((m) => {
    if (roleFilter.value !== 'all' && m.role !== roleFilter.value) return false
    if (q && !`${m.name ?? ''} ${m.email}`.toLowerCase().includes(q)) return false
    const joined = new Date(m.createdAt).getTime()
    if (from !== null && joined < from) return false
    if (to !== null && joined > to) return false
    return true
  })
})

const activeFilters = computed(() =>
  (query.value.trim() ? 1 : 0) + (roleFilter.value !== 'all' ? 1 : 0) + (joinedRange.value?.start ? 1 : 0))

function resetFilters() {
  query.value = ''
  roleFilter.value = 'all'
  joinedRange.value = undefined
}

// ── Row actions ────────────────────────────────────────────────────────
const editing = ref<Member | null>(null)
const editForm = reactive({ name: '', email: '', role: 'user' as string })
const editError = ref('')

function openEdit(m: Member) {
  editing.value = m
  editForm.name = m.name ?? ''
  editForm.email = m.email
  editForm.role = m.role
  editError.value = ''
}

function saveEdit() {
  const m = editing.value
  if (!m) return
  if (!editForm.name.trim() || !/^\S+@\S+\.\S+$/.test(editForm.email.trim())) {
    editError.value = t('settings.team.editInvalid')
    return
  }
  Object.assign(m, { name: editForm.name.trim(), email: editForm.email.trim(), role: editForm.role })
  editing.value = null
  toast.success(t('admin.toast.updated', { name: displayName(m) }))
}

const removing = ref<Member | null>(null)

function confirmRemove() {
  const m = removing.value
  if (!m) return
  const index = members.value.findIndex(x => x.id === m.id)
  members.value.splice(index, 1)
  removing.value = null
  toast.success(t('settings.team.removed', { name: displayName(m) }), {
    action: {
      label: t('admin.toast.undo'),
      onClick: () => {
        members.value.splice(Math.min(index, members.value.length), 0, m)
        toast(t('admin.toast.restored', { name: displayName(m) }))
      },
    },
  })
}

function displayName(m: Member) {
  return m.name || m.email.split('@')[0] || m.email
}

const initials = (n: string) => n.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()

function formatDate(d: string | Date) {
  return new Date(d).toLocaleDateString(locale.value, { month: 'short', day: 'numeric', year: 'numeric' })
}

// Invite dialog state.
const dialogOpen = ref(false)
const form = reactive({ email: '', role: 'user' })
const submitState = ref<'idle' | 'submitting' | 'error'>('idle')
const submitError = ref<string | null>(null)
const notice = ref<string | null>(null)
const revokingId = ref<number | null>(null)
const resendingEmail = ref<string | null>(null)
const revokeError = ref<string | null>(null)

function fetchErrorMessage(err: unknown, fallback: string) {
  const data = (err as { data?: { error?: { message?: string, code?: string } } }).data
  return data?.error?.message ?? fallback
}

// Catch obvious typos before the round-trip; the server still validates.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function sendInvite() {
  if (!EMAIL_RE.test(form.email.trim())) {
    submitError.value = t('settings.team.invalidEmail')
    submitState.value = 'error'
    return
  }
  submitState.value = 'submitting'
  submitError.value = null
  const res = await $fetch<ApiResponse<{ invite: PendingInvite }>>('/api/team/invites', {
    method: 'POST',
    body: { email: form.email, role: form.role },
  }).catch(err => ({ ok: false as const, error: { code: 'INTERNAL' as const, message: fetchErrorMessage(err, t('settings.team.inviteFailed')) } }))

  if (!res.ok) {
    submitError.value = res.error.message
    submitState.value = 'error'
    return
  }

  Object.assign(form, { email: '', role: 'user' })
  submitState.value = 'idle'
  dialogOpen.value = false
  notice.value = t('settings.team.inviteSent', { email: res.data.invite.email })
  await refreshInvites()
}

async function revokeInvite(id: number) {
  revokingId.value = id
  notice.value = null
  const res = await $fetch<ApiResponse<{ revoked: number }>>(`/api/team/invites/${id}`, {
    method: 'DELETE',
  }).catch(err => ({ ok: false as const, error: { code: 'INTERNAL' as const, message: fetchErrorMessage(err, t('settings.team.revokeFailed')) } }))
  revokingId.value = null

  if (!res.ok) {
    notice.value = null
    submitError.value = null
    // Surface revoke failures inline via the pending card error slot.
    revokeError.value = res.error.message
    return
  }
  revokeError.value = null
  await refreshInvites()
}

// Resend = revoke the stale row, then issue a fresh token via POST, so a
// given email never stacks duplicate pending rows.
async function resendInvite(invite: PendingInvite) {
  resendingEmail.value = invite.email
  notice.value = null
  revokeError.value = null
  await $fetch<ApiResponse<{ revoked: number }>>(`/api/team/invites/${invite.id}`, { method: 'DELETE' }).catch(() => null)
  const res = await $fetch<ApiResponse<{ invite: PendingInvite }>>('/api/team/invites', {
    method: 'POST',
    body: { email: invite.email, role: invite.role },
  }).catch(err => ({ ok: false as const, error: { code: 'INTERNAL' as const, message: fetchErrorMessage(err, t('settings.team.inviteFailed')) } }))
  resendingEmail.value = null

  if (!res.ok) {
    revokeError.value = res.error.message
    await refreshInvites()
    return
  }
  notice.value = t('settings.team.inviteSent', { email: invite.email })
  await refreshInvites()
}
</script>

<template>
  <Page>
    <PageHeader>
      <PageHeaderHeading
        :title="title"
        :description="headerDescription"
      />
      <template #actions>
        <Dialog
          v-if="canInvite && !invitesForbidden"
          v-model:open="dialogOpen"
        >
          <DialogTrigger as-child>
            <Button size="sm">
              <UserPlus
                class="size-4"
                aria-hidden="true"
              /> {{ t('settings.team.invite') }}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{{ t('settings.team.dialogTitle') }}</DialogTitle>
              <DialogDescription>{{ t('settings.team.dialogDescription') }}</DialogDescription>
            </DialogHeader>
            <DialogBody class="grid gap-4 py-1">
              <div class="grid gap-2">
                <Label for="invite-email">{{ t('settings.team.emailLabel') }}</Label>
                <Input
                  id="invite-email"
                  v-model="form.email"
                  type="email"
                  :placeholder="t('settings.team.emailPlaceholder')"
                />
              </div>
              <div class="grid gap-2">
                <Label for="invite-role">{{ t('settings.team.roleLabel') }}</Label>
                <Select v-model="form.role">
                  <SelectTrigger id="invite-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">
                      {{ t('admin.roleNames.user') }}
                    </SelectItem>
                    <SelectItem value="editor">
                      {{ t('admin.roleNames.editor') }}
                    </SelectItem>
                    <SelectItem value="admin">
                      {{ t('admin.roleNames.admin') }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div
                v-if="submitError"
                class="text-destructive flex items-center gap-2 text-sm"
              >
                <AlertCircle
                  class="size-4"
                  aria-hidden="true"
                />
                {{ submitError }}
              </div>
            </DialogBody>
            <DialogFooter>
              <Button
                variant="outline"
                :disabled="submitState === 'submitting'"
                @click="dialogOpen = false"
              >
                {{ t('settings.team.cancel') }}
              </Button>
              <Button
                :disabled="submitState === 'submitting' || !form.email"
                @click="sendInvite"
              >
                <Loader2
                  v-if="submitState === 'submitting'"
                  class="size-4 animate-spin"
                />
                {{ submitState === 'submitting' ? t('settings.team.sending') : t('settings.team.send') }}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </template>
    </PageHeader>

    <PageBody class="space-y-4">
      <div
        v-if="notice"
        class="border-success/30 bg-success/10 text-success flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
        role="status"
      >
        <CheckCircle2
          class="size-4"
          aria-hidden="true"
        />
        {{ notice }}
      </div>

      <Card v-if="membersFailed">
        <EmptyState
          :icon="CloudOff"
          title="Couldn't load the team"
          :description="t('settings.team.loadFailed')"
          role="alert"
        >
          <Button
            variant="outline"
            size="sm"
            class="mt-4"
            @click="refreshMembers()"
          >
            {{ t('settings.activity.states.retry') }}
          </Button>
        </EmptyState>
      </Card>

      <template v-else>
        <Card>
          <!-- Filters -->
          <div class="flex flex-col gap-2 border-b p-4 sm:flex-row sm:items-center">
            <div class="w-full sm:w-64">
              <Input
                v-model="query"
                size="small"
                :prefix-icon="Search"
                allow-clear
                :placeholder="t('settings.team.search')"
                :aria-label="t('settings.team.search')"
              />
            </div>
            <Select v-model="roleFilter">
              <SelectTrigger
                size="sm"
                class="sm:w-36"
                :aria-label="t('admin.filters.role')"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {{ t('admin.filters.allRoles') }}
                </SelectItem>
                <SelectItem
                  v-for="r in ROLES"
                  :key="r"
                  :value="r"
                >
                  {{ t(`admin.roleNames.${r}`) }}
                </SelectItem>
              </SelectContent>
            </Select>
            <Popover v-model:open="rangeOpen">
              <PopoverTrigger as-child>
                <Button
                  variant="outline"
                  size="sm"
                  class="justify-start gap-2 font-normal"
                  :class="!joinedRange?.start && 'text-muted-foreground'"
                >
                  <CalendarIcon
                    class="size-4"
                    aria-hidden="true"
                  />
                  {{ rangeLabel }}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                class="w-auto p-0"
              >
                <RangeCalendar v-model="joinedRange" />
              </PopoverContent>
            </Popover>
            <Button
              v-if="activeFilters"
              variant="ghost"
              size="sm"
              class="text-muted-foreground gap-1.5"
              @click="resetFilters"
            >
              <RotateCcw
                class="size-3.5"
                aria-hidden="true"
              />
              {{ t('admin.filters.reset') }}
            </Button>
            <span class="text-muted-foreground text-xs whitespace-nowrap tabular-nums sm:ml-auto">
              {{ t('admin.filters.showing', { shown: filteredMembers.length, total: members.length }) }}
            </span>
          </div>

          <TooltipProvider :delay-duration="300">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{{ t('settings.team.member') }}</TableHead>
                  <TableHead>{{ t('settings.team.role') }}</TableHead>
                  <TableHead>{{ t('settings.team.status') }}</TableHead>
                  <TableHead>{{ t('settings.team.joined') }}</TableHead>
                  <TableHead class="w-24 text-right">
                    <span class="sr-only">{{ t('admin.actions') }}</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-if="membersPending">
                  <TableCell
                    colspan="5"
                    class="text-muted-foreground text-sm"
                  >
                    {{ t('settings.team.loading') }}
                  </TableCell>
                </TableRow>
                <TableRow v-else-if="!filteredMembers.length">
                  <TableCell colspan="5">
                    <EmptyState
                      :icon="UserX"
                      :title="members.length ? t('admin.noMatchTitle') : t('settings.team.emptyMembers')"
                      :description="members.length ? t('admin.noMatchDescription') : undefined"
                    >
                      <Button
                        v-if="activeFilters"
                        variant="outline"
                        size="sm"
                        class="mt-4"
                        @click="resetFilters"
                      >
                        {{ t('admin.filters.reset') }}
                      </Button>
                    </EmptyState>
                  </TableCell>
                </TableRow>
                <template v-else>
                  <TableRow
                    v-for="m in filteredMembers"
                    :key="m.id"
                  >
                    <TableCell>
                      <div class="flex items-center gap-3">
                        <Avatar class="size-8">
                          <AvatarFallback class="bg-muted text-muted-foreground text-xs font-medium">
                            {{ initials(displayName(m)) }}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div class="text-sm font-medium">
                            {{ displayName(m) }}
                          </div>
                          <div class="text-muted-foreground text-xs">
                            {{ m.email }}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {{ t(`admin.roleNames.${m.role}`) }}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span class="flex items-center gap-1.5 text-xs">
                        <span
                          class="bg-success size-1.5 rounded-full"
                          aria-hidden="true"
                        />
                        {{ t('settings.team.active') }}
                      </span>
                    </TableCell>
                    <TableCell class="text-muted-foreground text-xs tabular-nums">
                      {{ formatDate(m.createdAt) }}
                    </TableCell>
                    <TableCell class="text-right">
                      <div class="flex justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger as-child>
                            <Button
                              variant="ghost"
                              size="icon"
                              class="text-muted-foreground hover:text-foreground size-8"
                              :aria-label="t('admin.editFor', { name: displayName(m) })"
                              @click="openEdit(m)"
                            >
                              <Pencil class="size-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{{ t('admin.menu.edit') }}</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger as-child>
                            <Button
                              variant="ghost"
                              size="icon"
                              class="text-muted-foreground hover:text-destructive hover:bg-destructive/10 size-8"
                              :aria-label="t('settings.team.removeFor', { name: displayName(m) })"
                              @click="removing = m"
                            >
                              <Trash2 class="size-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{{ t('settings.team.remove') }}</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                </template>
              </TableBody>
            </Table>
          </TooltipProvider>
        </Card>
      </template>

      <Card v-if="canInvite && !invitesForbidden">
        <CardHeader>
          <CardTitle class="text-base">
            {{ t('settings.team.pendingTitle') }}
          </CardTitle>
          <CardDescription>{{ t('settings.team.pendingDescription') }}</CardDescription>
        </CardHeader>
        <CardContent class="divide-y">
          <div
            v-if="invitesFailed"
            class="flex flex-wrap items-center justify-between gap-4 py-3 first:pt-0"
          >
            <span class="text-muted-foreground text-sm">Couldn't load pending invites.</span>
            <Button
              variant="outline"
              size="sm"
              @click="refreshInvites()"
            >
              {{ t('settings.activity.states.retry') }}
            </Button>
          </div>
          <div
            v-else-if="invitesPending"
            class="text-muted-foreground py-3 text-sm first:pt-0"
          >
            {{ t('settings.team.loading') }}
          </div>
          <div
            v-else-if="!pendingInvites.length"
            class="text-muted-foreground py-3 text-sm first:pt-0"
          >
            {{ t('settings.team.emptyPending') }}
          </div>
          <template v-else>
            <div
              v-for="p in pendingInvites"
              :key="p.id"
              class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3 first:pt-0 last:pb-0"
            >
              <div class="min-w-0 space-y-0.5">
                <p class="text-sm font-medium break-words">
                  {{ p.email }}
                </p>
                <p class="text-muted-foreground text-xs tabular-nums">
                  {{ t('settings.team.invitedAs', { role: t(`admin.roleNames.${p.role}`) }) }} · {{ t('settings.team.expires', { date: formatDate(p.expiresAt) }) }}
                </p>
              </div>
              <div class="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  :disabled="resendingEmail === p.email || revokingId === p.id"
                  @click="resendInvite(p)"
                >
                  <Loader2
                    v-if="resendingEmail === p.email"
                    class="size-4 animate-spin"
                    aria-hidden="true"
                  />
                  {{ t('settings.team.resend') }}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  class="text-destructive"
                  :disabled="revokingId === p.id || resendingEmail === p.email"
                  @click="revokeInvite(p.id)"
                >
                  <Loader2
                    v-if="revokingId === p.id"
                    class="size-4 animate-spin"
                    aria-hidden="true"
                  />
                  {{ t('settings.team.revoke') }}
                </Button>
              </div>
            </div>
          </template>
          <div
            v-if="revokeError"
            class="text-destructive flex items-center gap-2 pt-3 text-sm"
            role="alert"
          >
            <AlertCircle
              class="size-4"
              aria-hidden="true"
            />
            {{ revokeError }}
          </div>
        </CardContent>
      </Card>

      <p
        v-else
        class="text-muted-foreground text-xs"
      >
        {{ t('settings.team.viewerNote') }}
      </p>
    </PageBody>
    <!-- Edit member -->
    <Dialog
      :open="!!editing"
      @update:open="(v) => { if (!v) editing = null }"
    >
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{{ t('settings.team.editTitle') }}</DialogTitle>
          <DialogDescription>{{ t('settings.team.editDescription') }}</DialogDescription>
        </DialogHeader>
        <form
          id="edit-member-form"
          novalidate
          @submit.prevent="saveEdit"
        >
          <DialogBody class="grid gap-4 py-1">
            <div class="grid gap-2">
              <Label for="edit-member-name">{{ t('admin.edit.name') }}</Label>
              <Input
                id="edit-member-name"
                v-model="editForm.name"
                autocomplete="off"
              />
            </div>
            <div class="grid gap-2">
              <Label for="edit-member-email">{{ t('settings.team.emailLabel') }}</Label>
              <Input
                id="edit-member-email"
                v-model="editForm.email"
                type="email"
                autocomplete="off"
              />
            </div>
            <div class="grid gap-2">
              <Label for="edit-member-role">{{ t('settings.team.role') }}</Label>
              <Select v-model="editForm.role">
                <SelectTrigger id="edit-member-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="r in ROLES"
                    :key="r"
                    :value="r"
                  >
                    {{ t(`admin.roleNames.${r}`) }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p
              v-if="editError"
              class="text-destructive text-sm"
              role="alert"
            >
              {{ editError }}
            </p>
          </DialogBody>
        </form>
        <DialogFooter>
          <Button
            variant="outline"
            @click="editing = null"
          >
            {{ t('admin.edit.cancel') }}
          </Button>
          <Button
            type="submit"
            form="edit-member-form"
          >
            {{ t('admin.edit.save') }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Remove confirmation -->
    <Dialog
      :open="!!removing"
      @update:open="(v) => { if (!v) removing = null }"
    >
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{{ t('settings.team.removeTitle', { name: removing ? displayName(removing) : '' }) }}</DialogTitle>
          <DialogDescription>{{ t('settings.team.removeDescription') }}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            @click="removing = null"
          >
            {{ t('admin.edit.cancel') }}
          </Button>
          <Button
            variant="destructive"
            @click="confirmRemove"
          >
            <Trash2
              class="size-4"
              aria-hidden="true"
            />
            {{ t('settings.team.remove') }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </Page>
</template>
