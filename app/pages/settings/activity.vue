<script setup lang="ts">
import { Search, Tag, Loader2, CloudOff, LogIn, FolderPlus, MessageSquare, UserPlus, Activity as ActivityIcon } from '@/lib/icon-pack'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Page, PageHeader, PageHeaderHeading, PageBody } from '@/components/ui/page'
import { EmptyState } from '@/components/ui/empty-state'
import type { ApiResponse } from '~~/server/utils/response'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
const title = useRouteLabel()
useHead({ title })

const { t, locale } = useI18n()

interface ActivityItem {
  id: number
  userId: number | null
  action: string
  entity: string | null
  entityId: string | null
  metadata: Record<string, unknown> | null
  createdAt: string | Date
  actorEmail: string | null
}

// The action filter is pushed to the server (?action= substring match);
// the entity filter is applied client-side below.
const actionQuery = ref('')
const entityQuery = ref('')
const query = computed(() =>
  actionQuery.value.trim() ? { action: actionQuery.value.trim() } : {},
)

const { data: activityRes, pending, error: fetchError, refresh } = await useFetch<ApiResponse<{ items: ActivityItem[], total: number }>>('/api/activity', { query })

const items = computed<ActivityItem[]>(() =>
  activityRes.value?.ok ? activityRes.value.data.items : [],
)
// Boolean only: raw fetch errors never reach the UI.
const loadError = computed(() =>
  Boolean(fetchError.value) || Boolean(activityRes.value && !activityRes.value.ok),
)

const filtered = computed(() => {
  const needle = entityQuery.value.trim().toLowerCase()
  if (!needle) return items.value
  return items.value.filter(item =>
    item.entity?.toLowerCase().includes(needle)
    || item.entityId?.toLowerCase().includes(needle),
  )
})

const isFiltering = computed(() => Boolean(actionQuery.value.trim() || entityQuery.value.trim()))
function clearFilters() {
  actionQuery.value = ''
  entityQuery.value = ''
}

function actionIcon(action: string) {
  if (action.startsWith('auth.')) return LogIn
  if (action.startsWith('projects.')) return FolderPlus
  if (action.startsWith('feedback.')) return MessageSquare
  if (action.startsWith('team.')) return UserPlus
  return ActivityIcon
}

function entityLabel(item: ActivityItem): string {
  if (!item.entity) return '—'
  return item.entityId ? `${item.entity} #${item.entityId}` : item.entity
}

function formatFull(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value)
  return date.toLocaleString(locale.value, { dateStyle: 'medium', timeStyle: 'short' })
}

function timeAgo(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value)
  const diffMs = date.getTime() - Date.now()
  const rtf = new Intl.RelativeTimeFormat(locale.value, { numeric: 'auto' })
  const absSec = Math.abs(diffMs) / 1000
  if (absSec < 60) return rtf.format(Math.round(diffMs / 1000), 'second')
  const mins = Math.round(diffMs / 60000)
  if (Math.abs(mins) < 60) return rtf.format(mins, 'minute')
  const hours = Math.round(diffMs / 3600000)
  if (Math.abs(hours) < 24) return rtf.format(hours, 'hour')
  const days = Math.round(diffMs / 86400000)
  if (Math.abs(days) < 30) return rtf.format(days, 'day')
  const months = Math.round(diffMs / 2592000000)
  if (Math.abs(months) < 12) return rtf.format(months, 'month')
  return rtf.format(Math.round(diffMs / 31536000000), 'year')
}
</script>

<template>
  <Page>
    <PageHeader>
      <PageHeaderHeading
        :title="title"
        :description="t('settings.activity.description')"
      />
    </PageHeader>

    <PageBody class="space-y-4">
      <Card>
        <!-- Filters -->
        <div class="flex flex-col gap-2 border-b p-4 sm:flex-row sm:items-center">
          <div class="w-full sm:w-64">
            <Input
              v-model="actionQuery"
              size="small"
              :prefix-icon="Search"
              :placeholder="t('settings.activity.filters.action')"
              :aria-label="t('settings.activity.filters.action')"
            />
          </div>
          <div class="w-full sm:w-64">
            <Input
              v-model="entityQuery"
              size="small"
              :prefix-icon="Tag"
              :placeholder="t('settings.activity.filters.entity')"
              :aria-label="t('settings.activity.filters.entity')"
            />
          </div>
        </div>

        <div
          v-if="pending"
          class="text-muted-foreground flex items-center gap-2 px-4 py-4 text-sm"
        >
          <Loader2 class="size-4 animate-spin" />
          {{ t('settings.activity.states.loading') }}
        </div>

        <EmptyState
          v-else-if="loadError"
          :icon="CloudOff"
          :title="t('settings.activity.states.error')"
          description="Something went wrong on our side. Please try again."
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

        <!-- Filters active: say so and offer the way out. -->
        <EmptyState
          v-else-if="!filtered.length && isFiltering"
          :icon="Search"
          :title="t('settings.activity.states.noMatchTitle')"
          :description="t('settings.activity.states.noMatchDescription')"
        >
          <Button
            variant="outline"
            size="sm"
            class="mt-4"
            @click="clearFilters"
          >
            {{ t('settings.activity.states.clearFilters') }}
          </Button>
        </EmptyState>

        <!-- Nothing recorded: explain why, so support can tell "empty" from "broken". -->
        <EmptyState
          v-else-if="!filtered.length"
          :icon="ActivityIcon"
          :title="t('settings.activity.states.empty')"
          :description="t('settings.activity.states.emptyDescription')"
        />

        <Table v-else>
          <TableHeader>
            <TableRow>
              <TableHead>{{ t('settings.activity.table.event') }}</TableHead>
              <TableHead>{{ t('settings.activity.table.actor') }}</TableHead>
              <TableHead>{{ t('settings.activity.table.entity') }}</TableHead>
              <TableHead class="text-right">
                {{ t('settings.activity.table.time') }}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="item in filtered"
              :key="item.id"
            >
              <TableCell>
                <span class="flex items-center gap-2 text-sm font-medium">
                  <component
                    :is="actionIcon(item.action)"
                    class="text-muted-foreground size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span class="font-mono text-xs">{{ item.action }}</span>
                </span>
              </TableCell>
              <TableCell
                class="text-muted-foreground max-w-55 truncate text-xs"
                :title="item.actorEmail ?? undefined"
              >
                {{ item.actorEmail ?? t('settings.activity.feed.deletedUser') }}
              </TableCell>
              <TableCell class="text-muted-foreground text-xs">
                {{ entityLabel(item) }}
              </TableCell>
              <TableCell class="text-right">
                <time
                  :title="formatFull(item.createdAt)"
                  class="text-muted-foreground text-xs tabular-nums"
                >
                  {{ timeAgo(item.createdAt) }}
                </time>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </PageBody>
  </Page>
</template>
