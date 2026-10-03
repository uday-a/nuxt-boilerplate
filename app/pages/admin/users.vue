<script setup lang="ts">
import { ArrowUpDown, CalendarIcon, CloudOff, Pencil, RotateCcw, Search, ShieldAlert, Trash2, UserX } from '@/lib/icon-pack'
import { toast } from 'vue-sonner'
import { DateFormatter, getLocalTimeZone } from '@internationalized/date'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RangeCalendar } from '@/components/ui/range-calendar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Page, PageHeader, PageHeaderHeading, PageBody } from '@/components/ui/page'
import { EmptyState } from '@/components/ui/empty-state'
import type { ApiResponse } from '~~/server/utils/response'

// First consumer of the role middleware: server-side requireRole('admin')
// on /api/admin/users is the real gate; this middleware only keeps
// non-admins from flashing the page before the redirect.
definePageMeta({ layout: 'dashboard', middleware: ['auth', 'role'], requiredRole: 'admin' })
const title = useRouteLabel()
useHead({ title })

const { t, locale } = useI18n()

// WHY (Rule83): the 403 names the current role vs the required admin role
// and gives a next step, instead of a bare "no permission".
const { user: sessionUser } = useUserSession()
const currentRole = computed(() => {
  const u = sessionUser.value as { role?: string } | null | undefined
  return u?.role ?? t('admin.roleNames.user')
})

interface AdminUser {
  id: number
  login: string
  name: string | null
  role: string
  createdAt: string | Date
}

const ROLES = ['admin', 'editor', 'user'] as const

const { data: usersRes, pending, error: listError, refresh } = await useFetch<ApiResponse<AdminUser[]>>('/api/admin/users')

// Local copy so the demo actions (edit / delete / undo) have somewhere to
// write. Wire these to PATCH / DELETE /api/admin/users/:id when a DB exists.
const users = ref<AdminUser[]>([])
watch(usersRes, (r) => {
  users.value = r?.ok ? r.data.map(u => ({ ...u })) : []
}, { immediate: true })

const forbidden = computed(() => {
  const status = (listError.value as { statusCode?: number } | null)?.statusCode
  if (status === 403) return true
  const code = usersRes.value && !usersRes.value.ok ? usersRes.value.error.code : null
  return code === 'FORBIDDEN'
})
// Boolean only: raw fetch errors never reach the UI.
const failed = computed(() => {
  if (forbidden.value) return false
  return Boolean(listError.value) || Boolean(usersRes.value && !usersRes.value.ok)
})

const description = computed(() =>
  forbidden.value || failed.value ? t('admin.everyone') : t('admin.subtitle', { count: users.value.length }),
)

// ── Filters ────────────────────────────────────────────────────────────
const search = ref('')
const roleFilter = ref<'all' | typeof ROLES[number]>('all')
// DateValue brands differ between @internationalized/date and reka-ui;
// `any` sidesteps the false positive (same pattern as the data table).
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

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  const r = joinedRange.value
  const tz = getLocalTimeZone()
  const from = r?.start ? r.start.toDate(tz).getTime() : null
  // Inclusive end: the whole of the last selected day.
  const to = r?.end ? r.end.toDate(tz).getTime() + 86_400_000 - 1 : null
  return users.value.filter((u) => {
    if (roleFilter.value !== 'all' && u.role !== roleFilter.value) return false
    if (q && !`${u.name ?? ''} ${u.login}`.toLowerCase().includes(q)) return false
    const joined = new Date(u.createdAt).getTime()
    if (from !== null && joined < from) return false
    if (to !== null && joined > to) return false
    return true
  })
})

const activeFilters = computed(() =>
  (search.value.trim() ? 1 : 0) + (roleFilter.value !== 'all' ? 1 : 0) + (joinedRange.value?.start ? 1 : 0))

// WHY (Rule65): client sorting on User / Role / Joined. Default Joined desc
// (newest first) matches how admins scan this list.
type AdminSortKey = 'name' | 'role' | 'joined'
const sortKey = ref<AdminSortKey>('joined')
const sortDir = ref<'asc' | 'desc'>('desc')

function toggleSort(key: AdminSortKey) {
  if (sortKey.value === key) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else {
    sortKey.value = key
    sortDir.value = key === 'joined' ? 'desc' : 'asc'
  }
}

function ariaSort(key: AdminSortKey): 'ascending' | 'descending' | 'none' {
  if (sortKey.value !== key) return 'none'
  return sortDir.value === 'asc' ? 'ascending' : 'descending'
}

const sorted = computed(() => {
  const dir = sortDir.value === 'asc' ? 1 : -1
  return [...filtered.value].sort((a, b) => {
    if (sortKey.value === 'joined') return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir
    if (sortKey.value === 'role') return a.role.localeCompare(b.role) * dir
    return (a.name ?? a.login).localeCompare(b.name ?? b.login) * dir
  })
})

function resetFilters() {
  search.value = ''
  roleFilter.value = 'all'
  joinedRange.value = undefined
}

// ── Row actions ────────────────────────────────────────────────────────
const editing = ref<AdminUser | null>(null)
const form = reactive({ name: '', login: '', role: 'user' as string })
const formError = ref('')

function openEdit(u: AdminUser) {
  editing.value = u
  form.name = u.name ?? ''
  form.login = u.login
  form.role = u.role
  formError.value = ''
}

function saveEdit() {
  const u = editing.value
  if (!u) return
  if (!form.name.trim() || !form.login.trim()) {
    formError.value = t('admin.edit.required')
    return
  }
  Object.assign(u, { name: form.name.trim(), login: form.login.trim(), role: form.role })
  editing.value = null
  toast.success(t('admin.toast.updated', { name: u.name }))
}

const deleting = ref<AdminUser | null>(null)

function confirmDelete() {
  const u = deleting.value
  if (!u) return
  const index = users.value.findIndex(x => x.id === u.id)
  users.value.splice(index, 1)
  deleting.value = null
  toast.success(t('admin.toast.deleted', { name: u.name || u.login }), {
    action: {
      label: t('admin.toast.undo'),
      onClick: () => {
        users.value.splice(Math.min(index, users.value.length), 0, u)
        toast(t('admin.toast.restored', { name: u.name || u.login }))
      },
    },
  })
}

const initials = (n: string) => n.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()

function formatDate(d: string | Date) {
  return new Date(d).toLocaleDateString(locale.value, { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <Page>
    <PageHeader>
      <PageHeaderHeading
        :title="title"
        :description="description"
      />
    </PageHeader>

    <PageBody>
      <Card v-if="forbidden">
        <EmptyState
          :icon="ShieldAlert"
          :title="t('admin.adminsOnly')"
          :description="`${t('admin.forbidden')} ${t('admin.forbiddenRole', { role: currentRole })} ${t('admin.forbiddenHelp')}`"
          role="alert"
        />
      </Card>

      <Card v-else-if="failed">
        <EmptyState
          :icon="CloudOff"
          :title="t('admin.loadFailedTitle')"
          :description="t('admin.loadFailed')"
          role="alert"
        >
          <Button
            variant="outline"
            size="sm"
            class="mt-4"
            @click="refresh()"
          >
            {{ t('settings.activity.states.retry') }}
          </Button>
        </EmptyState>
      </Card>

      <Card v-else>
        <!-- Filters -->
        <div class="flex flex-col gap-2 border-b p-4 sm:flex-row sm:items-center">
          <div class="w-full sm:w-64">
            <Input
              v-model="search"
              size="small"
              :prefix-icon="Search"
              allow-clear
              :placeholder="t('admin.filters.search')"
              :aria-label="t('admin.filters.search')"
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
            {{ t('admin.filters.showing', { shown: filtered.length, total: users.length }) }}
          </span>
        </div>

        <TooltipProvider :delay-duration="300">
          <Table>
            <!-- WHY (Rule64): sticky header matches the data table. -->
            <TableHeader class="bg-background sticky top-0 z-10">
              <TableRow>
                <TableHead
                  scope="col"
                  :aria-sort="ariaSort('name')"
                >
                  <button
                    type="button"
                    class="hover:text-foreground focus-visible:ring-ring inline-flex items-center gap-1 rounded-sm font-medium focus-visible:ring-2 focus-visible:outline-none"
                    @click="toggleSort('name')"
                  >
                    {{ t('admin.user') }}<ArrowUpDown
                      :class="['size-3', sortKey === 'name' ? 'text-foreground' : 'text-muted-foreground']"
                      aria-hidden="true"
                    />
                  </button>
                </TableHead>
                <TableHead
                  scope="col"
                  :aria-sort="ariaSort('role')"
                >
                  <button
                    type="button"
                    class="hover:text-foreground focus-visible:ring-ring inline-flex items-center gap-1 rounded-sm font-medium focus-visible:ring-2 focus-visible:outline-none"
                    @click="toggleSort('role')"
                  >
                    {{ t('admin.role') }}<ArrowUpDown
                      :class="['size-3', sortKey === 'role' ? 'text-foreground' : 'text-muted-foreground']"
                      aria-hidden="true"
                    />
                  </button>
                </TableHead>
                <TableHead
                  scope="col"
                  :aria-sort="ariaSort('joined')"
                >
                  <button
                    type="button"
                    class="hover:text-foreground focus-visible:ring-ring inline-flex items-center gap-1 rounded-sm font-medium focus-visible:ring-2 focus-visible:outline-none"
                    @click="toggleSort('joined')"
                  >
                    {{ t('admin.joined') }}<ArrowUpDown
                      :class="['size-3', sortKey === 'joined' ? 'text-foreground' : 'text-muted-foreground']"
                      aria-hidden="true"
                    />
                  </button>
                </TableHead>
                <TableHead class="w-24 text-right">
                  <span class="sr-only">{{ t('admin.actions') }}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-if="pending">
                <TableCell
                  colspan="4"
                  class="text-muted-foreground text-sm"
                >
                  {{ t('admin.loading') }}
                </TableCell>
              </TableRow>
              <TableRow v-else-if="!filtered.length">
                <TableCell colspan="4">
                  <EmptyState
                    :icon="UserX"
                    :title="users.length ? t('admin.noMatchTitle') : t('admin.empty')"
                    :description="users.length ? t('admin.noMatchDescription') : undefined"
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
                  v-for="u in sorted"
                  :key="u.id"
                >
                  <TableCell>
                    <div class="flex items-center gap-3">
                      <Avatar class="size-8">
                        <AvatarFallback class="bg-muted text-muted-foreground text-xs font-medium">
                          {{ initials(u.name || u.login) }}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div class="text-sm font-medium">
                          {{ u.name || u.login }}
                        </div>
                        <div class="text-muted-foreground text-xs">
                          @{{ u.login }}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {{ t(`admin.roleNames.${u.role}`) }}
                    </Badge>
                  </TableCell>
                  <TableCell class="text-muted-foreground text-xs tabular-nums">
                    {{ formatDate(u.createdAt) }}
                  </TableCell>
                  <TableCell class="text-right">
                    <div class="flex justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger as-child>
                          <Button
                            variant="ghost"
                            size="icon"
                            class="text-muted-foreground hover:text-foreground size-8"
                            :aria-label="t('admin.editFor', { name: u.name || u.login })"
                            @click="openEdit(u)"
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
                            :aria-label="t('admin.deleteFor', { name: u.name || u.login })"
                            @click="deleting = u"
                          >
                            <Trash2 class="size-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{{ t('admin.menu.delete') }}</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              </template>
            </TableBody>
          </Table>
        </TooltipProvider>
      </Card>
    </PageBody>

    <!-- Edit user -->
    <Dialog
      :open="!!editing"
      @update:open="(v) => { if (!v) editing = null }"
    >
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{{ t('admin.edit.title') }}</DialogTitle>
          <DialogDescription>{{ t('admin.edit.description') }}</DialogDescription>
        </DialogHeader>
        <form
          id="edit-user-form"
          @submit.prevent="saveEdit"
        >
          <DialogBody class="grid gap-4 py-1">
            <div class="grid gap-2">
              <Label for="edit-name">{{ t('admin.edit.name') }}</Label>
              <Input
                id="edit-name"
                v-model="form.name"
                autocomplete="off"
              />
            </div>
            <div class="grid gap-2">
              <Label for="edit-login">{{ t('admin.edit.username') }}</Label>
              <Input
                id="edit-login"
                v-model="form.login"
                autocomplete="off"
              />
            </div>
            <div class="grid gap-2">
              <Label for="edit-role">{{ t('admin.role') }}</Label>
              <Select v-model="form.role">
                <SelectTrigger id="edit-role">
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
              v-if="formError"
              class="text-destructive text-sm"
              role="alert"
            >
              {{ formError }}
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
            form="edit-user-form"
          >
            {{ t('admin.edit.save') }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Delete confirmation -->
    <Dialog
      :open="!!deleting"
      @update:open="(v) => { if (!v) deleting = null }"
    >
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{{ t('admin.delete.title', { name: deleting?.name || deleting?.login }) }}</DialogTitle>
          <DialogDescription>{{ t('admin.delete.description') }}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            @click="deleting = null"
          >
            {{ t('admin.edit.cancel') }}
          </Button>
          <Button
            variant="destructive"
            @click="confirmDelete"
          >
            <Trash2
              class="size-4"
              aria-hidden="true"
            />
            {{ t('admin.delete.confirm') }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </Page>
</template>
