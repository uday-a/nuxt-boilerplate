<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Search, Send, MoreHorizontal, Star, Archive, Trash2, ArrowLeft,
  Inbox, Send as SentIcon, FileText, AlertCircle, CheckCheck, Plus,
} from '@/lib/icon-pack'
import { Page, PageHeader, PageHeaderHeading, PageBody } from '@/components/ui/page'
import { cardVariants } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { OverlayScroll } from '@/components/ui/overlay-scroll'
import { EmptyState } from '@/components/ui/empty-state'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })
const { t } = useI18n()
const title = useRouteLabel()
useHead({ title })

interface Message {
  id: string
  sender: string
  email: string
  initials: string
  subject: string
  preview: string
  body: string
  time: string
  read: boolean
  starred: boolean
  folder: 'inbox' | 'sent' | 'drafts' | 'spam'
  tags: string[]
}

const folders = [
  { id: 'inbox' as const, label: 'Inbox', icon: Inbox, count: 12 },
  { id: 'sent' as const, label: 'Sent', icon: SentIcon, count: 0 },
  { id: 'drafts' as const, label: 'Drafts', icon: FileText, count: 3 },
  { id: 'spam' as const, label: 'Spam', icon: AlertCircle, count: 0 },
]

const messages: Message[] = [
  { id: '1', sender: 'Sarah Connor', email: 'sarah@acme.com', initials: 'SC', subject: 'Q2 roadmap review — Design Engineering', preview: 'Can we move the component audit to Thursday? The team needs one more day to finish the token migration.', body: 'Hi team,\n\nCan we move the component audit to Thursday? The team needs one more day to finish the token migration.\n\nAlso — the new KpiGrid spec looks great. One question: do we want to support 6-column layout or cap at 5?\n\nSarah', time: '10:32 AM', read: false, starred: true, folder: 'inbox', tags: ['work', 'roadmap'] },
  { id: '2', sender: 'Marcus Rivera', email: 'marcus@acme.com', initials: 'MR', subject: 'Re: Auth middleware token storage', preview: 'I reviewed the PR. The compliance-ready token storage looks solid. One nit on the retry logic — see line 84.', body: 'I reviewed the PR. The compliance-ready token storage looks solid. One nit on the retry logic — see line 84.\n\nAlso flagged the missing test for the edge case where refresh returns 401. Can you add that before merge?\n\n— Marcus', time: '9:15 AM', read: false, starred: false, folder: 'inbox', tags: ['code-review'] },
  { id: '3', sender: 'Alice Chen', email: 'alice@acme.com', initials: 'AC', subject: 'Sparkline tooltip precision', preview: 'Fixed in PR 1283. The hover now shows full-precision values instead of rounding to 1 decimal.', body: 'Fixed in PR 1283. The hover now shows full-precision values instead of rounding to 1 decimal.\n\nScreenshot attached. Let me know if the formatting looks off on your end.\n\nAlice', time: 'Yesterday', read: true, starred: true, folder: 'inbox', tags: ['bugfix'] },
  { id: '4', sender: 'David Kim', email: 'david@acme.com', initials: 'DK', subject: 'Dark mode WCAG AAA tokens', preview: 'Maybe we should land the WCAG AAA tokens as a separate PR? The diff is already +400 lines.', body: 'Maybe we should land the WCAG AAA tokens as a separate PR? The diff is already +400 lines.\n\nI worry about review fatigue if we bundle it with the high-contrast override.\n\nDavid', time: 'Yesterday', read: true, starred: false, folder: 'inbox', tags: ['design-system'] },
  { id: '5', sender: 'Eva Johnson', email: 'eva@acme.com', initials: 'EJ', subject: 'WIP: native AbortSignal in API wrapper', preview: 'Pushed 4 commits to feature/abort-signal. Still need to handle the timeout edge case.', body: 'Pushed 4 commits to feature/abort-signal. Still need to handle the timeout edge case.\n\nThe wrapper now accepts signal?: AbortSignal and passes it through to fetch. Works in Chrome and Firefox. Safari needs testing.\n\nEva', time: 'Yesterday', read: true, starred: false, folder: 'inbox', tags: ['engineering'] },
  { id: '6', sender: 'Frank Lee', email: 'frank@acme.com', initials: 'FL', subject: 'QA sign-off for Sprint 24', preview: 'All P0s passed. Two P1s remaining — both UI polish, no blockers for release.', body: 'All P0s passed. Two P1s remaining — both UI polish, no blockers for release.\n\nFull report is in Notion. Let me know if you want me to walk through the edge cases.\n\nFrank', time: 'Sep 25', read: true, starred: false, folder: 'inbox', tags: ['qa'] },
  { id: '7', sender: 'Olive Park', email: 'olive@acme.com', initials: 'OP', subject: 'Welcome to the team!', preview: 'Thanks for the onboarding doc. The local setup took 12 minutes — faster than expected.', body: 'Thanks for the onboarding doc. The local setup took 12 minutes — faster than expected.\n\nOne thing I noticed: the env.example is missing the DATABASE_URL variable. Should I open a PR?\n\nOlive', time: 'Sep 24', read: true, starred: false, folder: 'inbox', tags: ['onboarding'] },
  { id: '8', sender: 'Northwind Industries', email: 'ops@northwind.example', initials: 'NI', subject: 'Enterprise contract renewal', preview: 'We would like to renew for another 12 months at the current Enterprise tier.', body: 'We would like to renew for another 12 months at the current Enterprise tier.\n\nCould you send the updated invoice by end of week?\n\n— Northwind Ops', time: 'Sep 23', read: true, starred: true, folder: 'inbox', tags: ['sales'] },
  { id: '9', sender: 'Sentinel Labs', email: 'team@sentinel.example', initials: 'SL', subject: 'Feedback: streaming citations', preview: '"Streaming citations are a game-changer. Our legal team saves ~3h per brief."', body: '"Streaming citations are a game-changer. Our legal team saves ~3h per brief."\n\nWould love to see batch citation export in the next quarter. Happy to beta test.\n\n— Sentinel Labs', time: 'Sep 21', read: true, starred: true, folder: 'inbox', tags: ['feedback'] },
  { id: '10', sender: 'System', email: 'system@acme.com', initials: 'SY', subject: 'Weekly digest — Sep 21', preview: '37 tasks closed, 12 opened. 4 deploys to production. Zero incidents.', body: 'Weekly digest — Sep 21\n\n37 tasks closed, 12 opened.\n4 deploys to production.\nZero incidents.\n\nTop contributor: Alice Chen (8 merged PRs)\n\n— Acme Bot', time: 'Sep 21', read: true, starred: false, folder: 'inbox', tags: ['system'] },
]

const activeFolder = ref<'inbox' | 'sent' | 'drafts' | 'spam'>('inbox')
const searchQuery = ref('')
const selectedId = ref<string | null>('1')
const composeOpen = ref(false)
const replyBody = ref('')

const filteredMessages = computed(() => {
  let list = messages.filter(m => m.folder === activeFolder.value)
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter(m =>
      m.subject.toLowerCase().includes(q)
      || m.sender.toLowerCase().includes(q)
      || m.preview.toLowerCase().includes(q),
    )
  }
  return list
})

const selectedMessage = computed(() => messages.find(m => m.id === selectedId.value))

// Hashed avatar tint from the chart-N/15 set so each sender keeps one colour.
const avatarTones = [
  'bg-chart-1/15 text-chart-1',
  'bg-chart-2/15 text-chart-2',
  'bg-chart-3/15 text-chart-3',
  'bg-chart-4/15 text-chart-4',
  'bg-chart-5/15 text-chart-5',
]

function avatarTone(name: string) {
  let hash = 0
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return avatarTones[hash % avatarTones.length]
}

// Below md the panes stack: list first, then the reading pane with a back button.
const showDetail = ref(false)

function openMessage(id: string) {
  selectedId.value = id
  showDetail.value = true
}

function sendReply() {
  replyBody.value = ''
}
</script>

<template>
  <Page class="flex h-[calc(100dvh-3.5rem-2rem)] flex-col">
    <PageHeader class="shrink-0">
      <PageHeaderHeading
        :title="title"
        description="Read and reply to messages from your team and customers."
      />
      <template #actions>
        <div class="flex items-center gap-2">
          <Button
            size="sm"
            @click="composeOpen = true"
          >
            <Plus
              class="size-4"
              aria-hidden="true"
            />
            Compose
          </Button>
        </div>
      </template>
    </PageHeader>

    <PageBody :class="cn(cardVariants(), 'flex min-h-0 flex-1 overflow-hidden')">
      <!-- Folders (lg+) -->
      <div class="hidden w-56 shrink-0 flex-col border-r lg:flex">
        <div class="space-y-1 p-3">
          <button
            v-for="folder in folders"
            :key="folder.id"
            type="button"
            :aria-pressed="activeFolder === folder.id"
            :aria-current="activeFolder === folder.id ? 'page' : undefined"
            :class="[
              'focus-visible:ring-ring flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none',
              activeFolder === folder.id ? 'bg-accent text-accent-foreground' : 'hover:bg-muted',
            ]"
            @click="activeFolder = folder.id"
          >
            <span class="flex items-center gap-2">
              <component
                :is="folder.icon"
                class="size-4"
                aria-hidden="true"
              />
              {{ folder.label }}
            </span>
            <Badge
              v-if="folder.count > 0"
              variant="secondary"
              class="px-1.5 tabular-nums"
            >
              {{ folder.count }}
            </Badge>
          </button>
        </div>
        <Separator />
        <div class="p-3">
          <p class="text-muted-foreground mb-2 text-xs font-medium">
            Labels
          </p>
          <div class="flex flex-wrap gap-1.5">
            <Badge
              v-for="tag in ['work', 'code-review', 'bugfix', 'sales', 'system']"
              :key="tag"
              variant="outline"
              class="hover:bg-accent cursor-pointer"
            >
              {{ tag }}
            </Badge>
          </div>
        </div>
      </div>

      <!-- Message list -->
      <div
        :class="[
          'min-w-0 flex-1 flex-col md:w-72 md:flex-none md:border-r lg:w-80',
          showDetail ? 'hidden md:flex' : 'flex',
        ]"
      >
        <div class="space-y-2 border-b p-2">
          <Select v-model="activeFolder">
            <SelectTrigger
              class="h-8 w-full lg:hidden"
              aria-label="Folder"
            >
              <!-- Placeholder = current label so SSR / pre-open renders it. -->
              <SelectValue :placeholder="folders.find(f => f.id === activeFolder)?.label" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="folder in folders"
                :key="folder.id"
                :value="folder.id"
              >
                {{ folder.label }}
              </SelectItem>
            </SelectContent>
          </Select>
          <div class="relative">
            <Search
              class="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2"
              aria-hidden="true"
            />
            <Input
              v-model="searchQuery"
              placeholder="Search messages..."
              aria-label="Search messages"
              class="h-8 pl-8 text-sm"
            />
          </div>
        </div>
        <OverlayScroll class="flex-1">
          <!-- WHY (Rule79): an empty result renders an EmptyState with a
               clear-search action, not a bare sentence. -->
          <EmptyState
            v-if="filteredMessages.length === 0"
            :icon="Inbox"
            :title="t('dashboard.messages.emptySearchTitle')"
            :description="t('dashboard.messages.emptySearchDescription')"
            class="p-4"
          >
            <Button
              variant="outline"
              size="sm"
              class="mt-4 h-8 text-xs"
              @click="searchQuery = ''"
            >
              {{ t('dashboard.messages.clearSearch') }}
            </Button>
          </EmptyState>
          <button
            v-for="msg in filteredMessages"
            :key="msg.id"
            type="button"
            :class="[
              'focus-visible:ring-ring flex w-full cursor-pointer gap-3 border-b p-3 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset',
              selectedId === msg.id ? 'md:bg-accent' : 'hover:bg-muted/50',
              !msg.read && 'bg-primary/5',
            ]"
            @click="openMessage(msg.id)"
          >
            <Avatar class="size-9 shrink-0">
              <AvatarFallback :class="['text-xs font-semibold', avatarTone(msg.sender)]">
                {{ msg.initials }}
              </AvatarFallback>
            </Avatar>
            <div class="min-w-0 flex-1 space-y-0.5">
              <div class="flex items-center justify-between gap-2">
                <!-- WHY (Rule28/30): truncated rows expose full text via
                     title so hover/touch long-press still reveals it. -->
                <p
                  :class="['truncate text-sm', !msg.read ? 'font-semibold' : 'font-medium']"
                  :title="msg.sender"
                >
                  {{ msg.sender }}
                </p>
                <span class="text-muted-foreground shrink-0 text-xs tabular-nums">{{ msg.time }}</span>
              </div>
              <p
                :class="['truncate text-sm', !msg.read ? 'font-medium' : 'text-muted-foreground']"
                :title="msg.subject"
              >
                {{ msg.subject }}
              </p>
              <p
                class="text-muted-foreground line-clamp-1 text-xs"
                :title="msg.preview"
              >
                {{ msg.preview }}
              </p>
              <div class="flex items-center gap-1 pt-0.5">
                <Star
                  v-if="msg.starred"
                  class="fill-chart-3 text-chart-3 size-3.5"
                  aria-label="Starred"
                />
                <Badge
                  v-for="tag in msg.tags.slice(0, 2)"
                  :key="tag"
                  variant="secondary"
                  class="px-1.5 py-0"
                >
                  {{ tag }}
                </Badge>
              </div>
            </div>
          </button>
        </OverlayScroll>
      </div>

      <!-- Reading pane -->
      <div
        :class="[
          'min-w-0 flex-1 flex-col',
          showDetail ? 'flex' : 'hidden md:flex',
        ]"
      >
        <template v-if="selectedMessage">
          <div class="flex items-start justify-between gap-4 border-b p-4">
            <div class="flex min-w-0 items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                class="size-8 shrink-0 md:hidden"
                aria-label="Back to messages"
                @click="showDetail = false"
              >
                <ArrowLeft
                  class="size-4"
                  aria-hidden="true"
                />
              </Button>
              <Avatar class="size-10 shrink-0">
                <AvatarFallback :class="['text-sm font-semibold', avatarTone(selectedMessage.sender)]">
                  {{ selectedMessage.initials }}
                </AvatarFallback>
              </Avatar>
              <div class="min-w-0">
                <p
                  class="truncate text-sm font-medium"
                  :title="selectedMessage.sender"
                >
                  {{ selectedMessage.sender }}
                </p>
                <p
                  class="text-muted-foreground truncate text-xs"
                  :title="`${selectedMessage.email} · ${selectedMessage.time}`"
                >
                  {{ selectedMessage.email }} · {{ selectedMessage.time }}
                </p>
              </div>
            </div>
            <div class="flex shrink-0 items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger as-child>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="size-8"
                      :aria-label="selectedMessage.starred ? 'Unstar' : 'Star'"
                    >
                      <Star :class="['size-4', selectedMessage.starred ? 'fill-chart-3 text-chart-3' : 'text-muted-foreground']" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>{{ selectedMessage.starred ? 'Unstar' : 'Star' }}</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger as-child>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="size-8"
                      aria-label="Archive"
                    >
                      <Archive class="text-muted-foreground size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Archive</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Popover>
                <PopoverTrigger as-child>
                  <Button
                    variant="ghost"
                    size="icon"
                    class="size-8"
                    aria-label="More actions"
                  >
                    <MoreHorizontal class="text-muted-foreground size-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  class="w-40 p-1"
                >
                  <button class="hover:bg-accent focus-visible:ring-ring flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs focus-visible:ring-2 focus-visible:outline-none">
                    <CheckCheck
                      class="size-3.5"
                      aria-hidden="true"
                    />Mark as read
                  </button>
                  <button class="hover:bg-accent text-destructive focus-visible:ring-ring flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs focus-visible:ring-2 focus-visible:outline-none">
                    <Trash2
                      class="size-3.5"
                      aria-hidden="true"
                    />Delete
                  </button>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div class="flex-1 overflow-auto p-4">
            <h2 class="mb-2 text-base font-semibold">
              {{ selectedMessage.subject }}
            </h2>
            <div class="mb-4 flex flex-wrap gap-1.5">
              <Badge
                v-for="tag in selectedMessage.tags"
                :key="tag"
                variant="secondary"
              >
                {{ tag }}
              </Badge>
            </div>
            <p class="text-sm leading-relaxed whitespace-pre-line">
              {{ selectedMessage.body }}
            </p>
          </div>

          <div class="border-t p-4">
            <div class="flex items-end gap-2">
              <Textarea
                v-model="replyBody"
                placeholder="Reply..."
                aria-label="Reply"
                class="min-h-20 flex-1 resize-y"
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger as-child>
                    <Button
                      size="icon"
                      class="size-9"
                      aria-label="Send reply"
                      @click="sendReply"
                    >
                      <Send class="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Send reply</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </template>
        <div
          v-else
          class="text-muted-foreground flex flex-1 items-center justify-center"
        >
          <p class="text-sm">
            Select a message to read
          </p>
        </div>
      </div>
    </PageBody>

    <!-- Compose Dialog -->
    <Dialog v-model:open="composeOpen">
      <DialogContent class="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New message</DialogTitle>
          <DialogDescription>Compose a new message to your team.</DialogDescription>
        </DialogHeader>
        <DialogBody class="grid gap-4 py-1">
          <Input
            placeholder="To"
            aria-label="To"
          />
          <Input
            placeholder="Subject"
            aria-label="Subject"
          />
          <Textarea
            placeholder="Write your message..."
            aria-label="Message"
            class="min-h-30 resize-y"
          />
        </DialogBody>
        <DialogFooter>
          <Button
            variant="outline"
            @click="composeOpen = false"
          >
            Cancel
          </Button>
          <Button @click="composeOpen = false">
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </Page>
</template>
