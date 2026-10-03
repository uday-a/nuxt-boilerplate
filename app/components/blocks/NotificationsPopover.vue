<script setup lang="ts">
import { ref, computed } from 'vue'
import { UserPlus, CreditCard, FileText, Rocket, ShieldCheck, TriangleAlert, X, BellOff, Archive } from '@/lib/icon-pack'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { OverlayScroll } from '@/components/ui/overlay-scroll'

type NotificationCategory = 'team' | 'billing' | 'deploy' | 'alert' | 'security' | 'system'

interface Notification {
  id: string
  title: string
  body: string
  category: NotificationCategory
  timestamp: Date
  read: boolean
  actionUrl?: string
  actor?: string
}

const categoryConfig: Record<NotificationCategory, { icon: any, accent: string, bg: string }> = {
  team: { icon: UserPlus, accent: 'bg-chart-2', bg: 'bg-chart-2/10 text-chart-2' },
  billing: { icon: CreditCard, accent: 'bg-chart-4', bg: 'bg-chart-4/10 text-chart-4' },
  deploy: { icon: Rocket, accent: 'bg-chart-1', bg: 'bg-chart-1/10 text-chart-1' },
  alert: { icon: TriangleAlert, accent: 'bg-warning', bg: 'bg-warning/10 text-warning' },
  security: { icon: ShieldCheck, accent: 'bg-chart-5', bg: 'bg-chart-5/10 text-chart-5' },
  system: { icon: FileText, accent: 'bg-muted-foreground', bg: 'bg-muted text-muted-foreground' },
}

const now = new Date()

const notifications = ref<Notification[]>([
  {
    id: '1',
    title: 'Deploy succeeded',
    body: 'v2.14.0 is live in production. 38 changes shipped.',
    category: 'deploy',
    timestamp: new Date(now.getTime() - 720000),
    read: false,
    actor: 'Deploy bot',
  },
  {
    id: '2',
    title: 'New member joined',
    body: 'Chloe Morgan accepted your invite and joined as Editor.',
    category: 'team',
    timestamp: new Date(now.getTime() - 2700000),
    read: false,
    actor: 'Chloe Morgan',
  },
  {
    id: '3',
    title: 'Usage at 94% of limit',
    body: 'Active file bundles: 47 of 50 used. Upgrade or archive to stay under the cap.',
    category: 'alert',
    timestamp: new Date(now.getTime() - 7200000),
    read: false,
  },
  {
    id: '4',
    title: 'Invoice paid',
    body: 'INV-2031 for $149.00 was charged to Visa ending 4242.',
    category: 'billing',
    timestamp: new Date(now.getTime() - 18000000),
    read: true,
  },
  {
    id: '5',
    title: 'New sign-in from Berlin',
    body: 'Chrome on macOS. If this wasn’t you, revoke the session in Security.',
    category: 'security',
    timestamp: new Date(now.getTime() - 28800000),
    read: true,
  },
  {
    id: '6',
    title: 'Weekly report ready',
    body: 'Your workspace summary for Sep 22 – 28 is ready to view.',
    category: 'system',
    timestamp: new Date(now.getTime() - 93600000),
    read: true,
  },
  {
    id: '7',
    title: 'Deploy rolled back',
    body: 'v2.13.2 was rolled back after a failed health check in eu-west.',
    category: 'deploy',
    timestamp: new Date(now.getTime() - 100800000),
    read: true,
    actor: 'Deploy bot',
  },
  {
    id: '8',
    title: 'API key expires soon',
    body: 'The “CI deploys” key expires in 7 days. Rotate it to avoid failed builds.',
    category: 'security',
    timestamp: new Date(now.getTime() - 172800000),
    read: true,
  },
])

const activeFilter = ref<'all' | 'unread'>('all')
const isOpen = ref(false)

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

const filteredNotifications = computed(() => {
  if (activeFilter.value === 'unread') {
    return notifications.value.filter(n => !n.read)
  }
  return notifications.value
})

const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

const groupedNotifications = computed(() => {
  const today = filteredNotifications.value.filter(n => n.timestamp >= todayStart)
  const earlier = filteredNotifications.value.filter(n => n.timestamp < todayStart)
  return { today, earlier }
})

function formatTime(date: Date): string {
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHrs = Math.floor(diffMin / 60)
  if (diffHrs < 24) return `${diffHrs}h ago`
  const diffDays = Math.floor(diffHrs / 24)
  if (diffDays === 1) return 'Yesterday'
  return `${diffDays}d ago`
}

function markAsRead(id: string) {
  const n = notifications.value.find(n => n.id === id)
  if (n) n.read = true
}

function markAllRead() {
  notifications.value.forEach(n => (n.read = true))
}

function dismissNotification(id: string) {
  notifications.value = notifications.value.filter(n => n.id !== id)
}
</script>

<template>
  <Popover v-model:open="isOpen">
    <PopoverTrigger as-child>
      <slot :unread-count="unreadCount" />
    </PopoverTrigger>
    <PopoverContent
      align="end"
      :side-offset="8"
      class="notification-panel w-[380px] overflow-hidden rounded-lg border p-0 shadow-xl"
    >
      <div class="flex items-center justify-between px-4 pt-4 pb-3">
        <div class="flex items-center gap-2.5">
          <h3 class="text-sm font-semibold tracking-tight">
            Notifications
          </h3>
          <Badge
            v-if="unreadCount > 0"
            class="bg-primary/15 text-primary hover:bg-primary/15 h-5 rounded-full px-1.5 text-xs font-semibold tabular-nums"
          >
            {{ unreadCount }}
          </Badge>
        </div>
        <Button
          v-if="unreadCount > 0"
          variant="ghost"
          size="sm"
          class="text-muted-foreground hover:text-foreground -mr-1 h-7 px-2 text-xs"
          @click="markAllRead"
        >
          Mark all read
        </Button>
      </div>

      <div class="border-b px-4">
        <div class="flex gap-0">
          <button
            :class="[
              'relative px-3 pb-2.5 text-xs font-medium transition-colors',
              activeFilter === 'all' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
            ]"
            @click="activeFilter = 'all'"
          >
            All
            <span
              v-if="activeFilter === 'all'"
              class="bg-primary absolute right-0 bottom-0 left-0 h-[2px] rounded-t-full"
            />
          </button>
          <button
            :class="[
              'relative px-3 pb-2.5 text-xs font-medium transition-colors',
              activeFilter === 'unread' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
            ]"
            @click="activeFilter = 'unread'"
          >
            Unread
            <span
              v-if="activeFilter === 'unread'"
              class="bg-primary absolute right-0 bottom-0 left-0 h-[2px] rounded-t-full"
            />
          </button>
        </div>
      </div>

      <OverlayScroll class="max-h-[420px]">
        <div
          v-if="filteredNotifications.length === 0"
          class="flex flex-col items-center justify-center py-4 text-center"
        >
          <div class="bg-muted mb-3 rounded-full p-3">
            <BellOff class="text-muted-foreground size-5" />
          </div>
          <p class="text-sm font-medium">
            All caught up
          </p>
          <p class="text-muted-foreground mt-0.5 text-xs">
            No {{ activeFilter === 'unread' ? 'unread ' : '' }}notifications
          </p>
        </div>

        <template v-else>
          <template v-if="groupedNotifications.today.length > 0">
            <div class="px-4 pt-3 pb-1">
              <span class="text-muted-foreground text-xs font-medium tracking-wider uppercase">Today</span>
            </div>
            <div
              v-for="(n, index) in groupedNotifications.today"
              :key="n.id"
              class="group hover:bg-muted animate-in fade-in-0 slide-in-from-bottom-1 relative cursor-pointer transition-colors duration-150"
              :style="{ animationDelay: `${index * 30}ms` }"
              @click="markAsRead(n.id)"
            >
              <div
                :class="[
                  'absolute top-2 bottom-2 left-0 w-[3px] rounded-r-full transition-opacity',
                  !n.read ? categoryConfig[n.category].accent : 'opacity-0',
                ]"
              />

              <div class="flex gap-3 px-4 py-3">
                <div
                  :class="[
                    'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg',
                    categoryConfig[n.category].bg,
                  ]"
                >
                  <component
                    :is="categoryConfig[n.category].icon"
                    class="size-4"
                  />
                </div>

                <div class="min-w-0 flex-1">
                  <div class="flex items-start justify-between gap-2">
                    <p :class="['text-sm leading-snug', !n.read ? 'font-semibold' : 'font-medium']">
                      {{ n.title }}
                    </p>
                    <div class="flex shrink-0 items-center gap-1.5">
                      <span class="text-muted-foreground text-xs whitespace-nowrap tabular-nums">
                        {{ formatTime(n.timestamp) }}
                      </span>
                      <span
                        v-if="!n.read"
                        class="bg-primary size-1.5 shrink-0 rounded-full"
                      />
                    </div>
                  </div>
                  <p class="text-muted-foreground mt-0.5 line-clamp-2 text-xs leading-relaxed">
                    {{ n.body }}
                  </p>
                </div>

                <button
                  class="text-muted-foreground hover:text-foreground mt-0.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                  title="Dismiss"
                  @click.stop="dismissNotification(n.id)"
                >
                  <X class="size-3.5" />
                </button>
              </div>
            </div>
          </template>

          <template v-if="groupedNotifications.earlier.length > 0">
            <div class="px-4 pt-3 pb-1">
              <span class="text-muted-foreground text-xs font-medium tracking-wider uppercase">Earlier</span>
            </div>
            <div
              v-for="(n, index) in groupedNotifications.earlier"
              :key="n.id"
              class="group hover:bg-muted animate-in fade-in-0 slide-in-from-bottom-1 relative cursor-pointer transition-colors duration-150"
              :style="{ animationDelay: `${(groupedNotifications.today.length + index) * 30}ms` }"
              @click="markAsRead(n.id)"
            >
              <div
                :class="[
                  'absolute top-2 bottom-2 left-0 w-[3px] rounded-r-full transition-opacity',
                  !n.read ? categoryConfig[n.category].accent : 'opacity-0',
                ]"
              />

              <div class="flex gap-3 px-4 py-3">
                <div
                  :class="[
                    'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg',
                    categoryConfig[n.category].bg,
                  ]"
                >
                  <component
                    :is="categoryConfig[n.category].icon"
                    class="size-4"
                  />
                </div>

                <div class="min-w-0 flex-1">
                  <div class="flex items-start justify-between gap-2">
                    <p :class="['text-sm leading-snug', !n.read ? 'font-semibold' : 'font-medium']">
                      {{ n.title }}
                    </p>
                    <div class="flex shrink-0 items-center gap-1.5">
                      <span class="text-muted-foreground text-xs whitespace-nowrap tabular-nums">
                        {{ formatTime(n.timestamp) }}
                      </span>
                      <span
                        v-if="!n.read"
                        class="bg-primary size-1.5 shrink-0 rounded-full"
                      />
                    </div>
                  </div>
                  <p class="text-muted-foreground mt-0.5 line-clamp-2 text-xs leading-relaxed">
                    {{ n.body }}
                  </p>
                </div>

                <button
                  class="text-muted-foreground hover:text-foreground mt-0.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                  title="Dismiss"
                  @click.stop="dismissNotification(n.id)"
                >
                  <X class="size-3.5" />
                </button>
              </div>
            </div>
          </template>
        </template>
        <div
          aria-hidden="true"
          class="pointer-events-none sticky bottom-0 -mt-6 h-6 bg-gradient-to-b from-transparent to-popover"
        />
      </OverlayScroll>

      <div class="bg-popover relative z-10 border-t px-4 py-2.5">
        <a
          href="#"
          class="text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 text-xs transition-colors"
          @click="isOpen = false"
        >
          <Archive
            class="size-3.5"
            aria-hidden="true"
          />
          View all notifications
        </a>
      </div>
    </PopoverContent>
  </Popover>
</template>
