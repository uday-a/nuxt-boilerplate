<script setup lang="ts">
import { AlertCircle, AlertTriangle, Check, CloudOff, Copy, KeyRound, Loader2, Plus, Trash2 } from '@/lib/icon-pack'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Page, PageHeader, PageHeaderHeading, PageBody } from '@/components/ui/page'
import { EmptyState } from '@/components/ui/empty-state'
import type { ApiResponse } from '~~/server/utils/response'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
const title = useRouteLabel()
useHead({ title })

const { t, locale } = useI18n()

interface ApiKeyRow {
  id: number
  name: string
  prefix: string
  scopes: string
  lastUsedAt: string | null
  expiresAt: string | null
  revokedAt: string | null
  createdAt: string
}

function asErrorMessage(err: unknown, fallback: string): string {
  const data = (err as { data?: { error?: { message?: string } } }).data
  return data?.error?.message ?? fallback
}

const { data: listRes, pending, refresh, error: listError } = await useFetch<ApiResponse<{ keys: ApiKeyRow[] }>>('/api/keys')

const keys = computed<ApiKeyRow[]>(() => (listRes.value?.ok ? listRes.value.data.keys : []))
// Boolean only: raw fetch errors never reach the UI.
const fetchFailed = computed(() => Boolean(listError.value) || Boolean(listRes.value && !listRes.value.ok))

// Create-form state. Scope/expiry selects bind strings; scopes are split
// into the array the POST schema expects at submit time.
const form = reactive({ name: '', scope: 'read', expiry: '90' })
const creating = ref(false)
const createError = ref<string | null>(null)

// Show-raw-once dialog state. rawKey lives only in memory and is cleared
// the moment the dialog closes — refresh the page and it's gone for good.
const showRaw = ref(false)
const rawKey = ref<string | null>(null)
const copied = ref(false)

// Reka's Dialog returns focus to its <DialogTrigger> on close — but these
// two dialogs are controlled (:open) with no trigger, so there is nothing
// to return to. Capture the invoking element on open; the watchers below
// restore it on every close path (Done/Cancel buttons, X, Escape).
const rawTrigger = ref<HTMLElement | null>(null)
const revokeTrigger = ref<HTMLElement | null>(null)
watch(showRaw, (open) => {
  if (!open) rawTrigger.value?.focus()
})

const revokingId = ref<number | null>(null)
const actionError = ref<string | null>(null)

function scopeBadges(scopes: string): string[] {
  return scopes.split(' ').filter(Boolean)
}

function fmtDate(value: string | null): string {
  if (!value) return t('settings.apikeys.never')
  return new Date(value).toLocaleDateString(locale.value, { year: 'numeric', month: 'short', day: 'numeric' })
}

async function createKey() {
  if (!form.name.trim() || creating.value) return
  creating.value = true
  createError.value = null
  const res = await $fetch<ApiResponse<{ key: ApiKeyRow, rawKey: string }>>('/api/keys', {
    method: 'POST',
    body: {
      name: form.name.trim(),
      scopes: form.scope.split(' '),
      ...(form.expiry === 'never' ? {} : { expiresInDays: Number(form.expiry) }),
    },
  }).catch((err: unknown) => (
    { ok: false, error: { code: 'INTERNAL', message: asErrorMessage(err, 'Failed to create API key') } } as const
  ))
  creating.value = false
  if (!res.ok) {
    createError.value = res.error.message
    return
  }
  rawKey.value = res.data.rawKey
  rawTrigger.value = document.activeElement as HTMLElement | null
  showRaw.value = true
  copied.value = false
  form.name = ''
  await refresh()
}

// Key awaiting confirmation in the revoke dialog. Same pattern as delete-user:
// a designed dialog with the consequence spelled out, not window.confirm().
const revokeTarget = ref<ApiKeyRow | null>(null)
watch(revokeTarget, (target) => {
  if (!target) revokeTrigger.value?.focus()
})

function openRevoke(k: ApiKeyRow) {
  revokeTrigger.value = document.activeElement as HTMLElement | null
  revokeTarget.value = k
}

async function revokeKey(k: ApiKeyRow) {
  if (revokingId.value !== null) return
  revokeTarget.value = null
  revokingId.value = k.id
  actionError.value = null
  const res = await $fetch<ApiResponse<{ revoked: number }>>(`/api/keys/${k.id}`, {
    method: 'DELETE',
  }).catch((err: unknown) => (
    { ok: false, error: { code: 'INTERNAL', message: asErrorMessage(err, 'Failed to revoke API key') } } as const
  ))
  revokingId.value = null
  if (!res.ok) {
    actionError.value = res.error.message
    return
  }
  await refresh()
}

async function copyRaw() {
  if (!rawKey.value) return
  try {
    await navigator.clipboard.writeText(rawKey.value)
  }
  catch {
    // Clipboard API unavailable (permissions, insecure context) — fall
    // back to the legacy execCommand path.
    const ta = document.createElement('textarea')
    ta.value = rawKey.value
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    ta.remove()
  }
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}

function closeRaw() {
  showRaw.value = false
  rawKey.value = null
  copied.value = false
}
</script>

<template>
  <Page>
    <PageHeader>
      <PageHeaderHeading
        :title="title"
        :description="t('settings.apikeys.description')"
      />
    </PageHeader>

    <PageBody class="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle class="text-base">
            {{ t('settings.apikeys.createTitle') }}
          </CardTitle>
          <CardDescription>{{ t('settings.apikeys.createDescription') }}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            class="grid gap-3 sm:grid-cols-[1fr_170px_150px_auto] sm:items-end"
            @submit.prevent="createKey"
          >
            <div class="grid gap-2">
              <Label for="ak-name">{{ t('settings.apikeys.nameLabel') }}</Label>
              <Input
                id="ak-name"
                v-model="form.name"
                :placeholder="t('settings.apikeys.namePlaceholder')"
                maxlength="64"
              />
            </div>
            <div class="grid gap-2">
              <Label>{{ t('settings.apikeys.scopeLabel') }}</Label>
              <Select v-model="form.scope">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="read">
                    {{ t('settings.apikeys.scopeRead') }}
                  </SelectItem>
                  <SelectItem value="read write">
                    {{ t('settings.apikeys.scopeReadWrite') }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="grid gap-2">
              <Label>{{ t('settings.apikeys.expiryLabel') }}</Label>
              <Select v-model="form.expiry">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">
                    {{ t('settings.apikeys.expiry30') }}
                  </SelectItem>
                  <SelectItem value="90">
                    {{ t('settings.apikeys.expiry90') }}
                  </SelectItem>
                  <SelectItem value="never">
                    {{ t('settings.apikeys.expiryNever') }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              :disabled="creating || !form.name.trim()"
            >
              <Loader2
                v-if="creating"
                class="size-4 animate-spin"
              />
              <Plus
                v-else
                class="size-4"
              />
              {{ creating ? t('settings.apikeys.submitting') : t('settings.apikeys.submit') }}
            </Button>
          </form>
          <div
            v-if="createError"
            class="text-destructive mt-3 flex items-center gap-2 text-sm"
          >
            <AlertCircle class="size-4" />
            {{ createError }}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="text-base">
            {{ t('settings.apikeys.listTitle') }}
          </CardTitle>
          <CardDescription>{{ t('settings.apikeys.listDescription') }}</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            v-if="fetchFailed"
            :icon="CloudOff"
            title="Couldn't load API keys"
            description="Something went wrong on our side. Please try again."
            role="alert"
            class="py-4"
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

          <div
            v-else-if="pending"
            class="text-muted-foreground flex items-center gap-2 py-4 text-sm"
          >
            <Loader2
              class="size-4 animate-spin"
              aria-hidden="true"
            />
            {{ t('settings.apikeys.loading') }}
          </div>

          <EmptyState
            v-else-if="!keys.length"
            :icon="KeyRound"
            :title="t('settings.apikeys.emptyTitle')"
            :description="t('settings.apikeys.emptyDescription')"
            class="py-4"
          />

          <Table v-else>
            <TableHeader>
              <TableRow>
                <TableHead>{{ t('settings.apikeys.colName') }}</TableHead>
                <TableHead>{{ t('settings.apikeys.colKey') }}</TableHead>
                <TableHead>{{ t('settings.apikeys.colScopes') }}</TableHead>
                <TableHead class="tabular-nums">
                  {{ t('settings.apikeys.colCreated') }}
                </TableHead>
                <TableHead class="tabular-nums">
                  {{ t('settings.apikeys.colExpires') }}
                </TableHead>
                <TableHead class="tabular-nums">
                  {{ t('settings.apikeys.colLastUsed') }}
                </TableHead>
                <TableHead class="text-right">
                  {{ t('settings.apikeys.colActions') }}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="k in keys"
                :key="k.id"
              >
                <TableCell class="font-medium">
                  <span class="mr-2">{{ k.name }}</span>
                  <Badge
                    v-if="k.revokedAt"
                    variant="secondary"
                  >
                    {{ t('settings.apikeys.revoked') }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <code class="font-mono text-xs">{{ k.prefix }}…</code>
                </TableCell>
                <TableCell>
                  <div class="flex gap-1">
                    <Badge
                      v-for="s in scopeBadges(k.scopes)"
                      :key="s"
                      variant="secondary"
                    >
                      {{ s }}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell class="text-muted-foreground text-xs tabular-nums">
                  {{ fmtDate(k.createdAt) }}
                </TableCell>
                <TableCell class="text-muted-foreground text-xs tabular-nums">
                  {{ fmtDate(k.expiresAt) }}
                </TableCell>
                <TableCell class="text-muted-foreground text-xs tabular-nums">
                  {{ k.lastUsedAt ? fmtDate(k.lastUsedAt) : t('settings.apikeys.neverUsed') }}
                </TableCell>
                <TableCell class="text-right">
                  <Button
                    v-if="!k.revokedAt"
                    variant="ghost"
                    size="icon"
                    :aria-label="t('settings.apikeys.revokeAria', { name: k.name })"
                    :disabled="revokingId === k.id"
                    @click="openRevoke(k)"
                  >
                    <Loader2
                      v-if="revokingId === k.id"
                      class="size-4 animate-spin"
                    />
                    <Trash2
                      v-else
                      class="text-destructive size-4"
                    />
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div
            v-if="actionError"
            class="text-destructive mt-3 flex items-center gap-2 text-sm"
          >
            <AlertCircle class="size-4" />
            {{ actionError }}
          </div>
        </CardContent>
      </Card>

      <Dialog
        :open="showRaw"
        @update:open="(open) => { if (!open) closeRaw() }"
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{{ t('settings.apikeys.rawTitle') }}</DialogTitle>
            <DialogDescription>{{ t('settings.apikeys.rawDescription') }}</DialogDescription>
          </DialogHeader>
          <DialogBody class="grid gap-4 py-1">
            <div class="bg-muted flex items-center gap-2 rounded-md border px-3 py-2">
              <code class="flex-1 font-mono text-xs break-all">{{ rawKey }}</code>
              <Button
                variant="outline"
                size="sm"
                class="shrink-0"
                @click="copyRaw"
              >
                <Check
                  v-if="copied"
                  class="size-4"
                />
                <Copy
                  v-else
                  class="size-4"
                />
                {{ copied ? t('settings.apikeys.rawCopied') : t('settings.apikeys.rawCopy') }}
              </Button>
            </div>
            <div class="border-warning/30 bg-warning/10 text-warning flex items-start gap-2 rounded-md border px-3 py-2">
              <AlertTriangle
                class="size-4 shrink-0"
                aria-hidden="true"
              />
              <p class="text-xs">
                {{ t('settings.apikeys.rawWarning') }}
              </p>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button @click="closeRaw">
              {{ t('settings.apikeys.rawDone') }}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <!-- Revoke confirmation -->
      <Dialog
        :open="!!revokeTarget"
        @update:open="(v) => { if (!v) revokeTarget = null }"
      >
        <DialogContent class="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{{ t('settings.apikeys.revokeTitle', { name: revokeTarget?.name }) }}</DialogTitle>
            <DialogDescription>{{ t('settings.apikeys.revokeDescription') }}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              @click="revokeTarget = null"
            >
              {{ t('settings.apikeys.revokeCancel') }}
            </Button>
            <Button
              variant="destructive"
              @click="revokeTarget && revokeKey(revokeTarget)"
            >
              <Trash2
                class="size-4"
                aria-hidden="true"
              />
              {{ t('settings.apikeys.revoke') }}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageBody>
  </Page>
</template>
