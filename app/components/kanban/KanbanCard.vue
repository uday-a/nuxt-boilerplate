<script setup lang="ts">
import { computed } from 'vue'
import { type KanbanTask, type KanbanColumn, priorityConfig, getTaskColumn } from '@/composables/useKanban'
import TagBadge from './TagBadge.vue'
import SubtaskProgress from './SubtaskProgress.vue'
import DueDateBadge from './DueDateBadge.vue'
import PriorityBadge from './PriorityBadge.vue'
import UserAvatar from './UserAvatar.vue'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { MoreHorizontal, MessageSquare, Paperclip, ExternalLink } from '@/lib/icon-pack'

const props = defineProps<{
  task: KanbanTask
  isDone: boolean
}>()

const columns = useState<KanbanColumn[]>('kanban-columns')

const subtasksDone = computed(() => {
  if (!columns.value || !props.task.subtaskIds.length) return 0
  return props.task.subtaskIds.filter(id => getTaskColumn(columns.value, id)?.id === 'done').length
})

// Screen-reader name: title first, then status + priority for context.
const ariaLabel = computed(() => {
  const status = columns.value ? getTaskColumn(columns.value, props.task.id)?.title : undefined
  return [props.task.title, status, `${priorityConfig[props.task.priority].label} priority`].filter(Boolean).join(', ')
})

defineEmits<{
  'click': [task: KanbanTask]
  'quick-view': [task: KanbanTask]
}>()
</script>

<template>
  <!-- Not a button itself: the title is the card's one button, stretched
       over the card with `after:inset-0`; the menu and avatar sit above it. -->
  <div
    :class="[
      'animate-in fade-in-0 slide-in-from-bottom-1.5 duration-200 group/card bg-card relative cursor-grab rounded-lg border p-3 transition-all duration-150',
      'hover:border-border hover:shadow-md active:scale-[0.97] active:cursor-grabbing',
    ]"
  >
    <div
      :class="[
        'absolute top-3 bottom-3 left-0 w-[1.5px] rounded-full transition-all duration-150',
        priorityConfig[task.priority].bg,
        task.priority === 'low' ? 'opacity-40' : task.priority === 'medium' ? 'opacity-60' : 'opacity-90',
      ]"
    />

    <div class="mb-1 flex items-center justify-between pl-2">
      <div class="flex items-center gap-2">
        <span class="text-muted-foreground font-mono text-xs">{{ task.id }}</span>
        <PriorityBadge
          v-if="task.priority === 'urgent' || task.priority === 'high'"
          :priority="task.priority"
        />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button
            variant="ghost"
            size="icon"
            :aria-label="`More actions for ${task.id}`"
            class="text-muted-foreground relative z-10 -mr-1 size-6 opacity-0 transition-opacity group-focus-within/card:opacity-100 group-hover/card:opacity-100 data-[state=open]:opacity-100"
          >
            <MoreHorizontal
              class="size-3.5"
              aria-hidden="true"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          class="w-36"
        >
          <DropdownMenuItem @click.stop="$emit('quick-view', task)">
            Quick view
          </DropdownMenuItem>
          <DropdownMenuItem as-child>
            <NuxtLink
              :to="`/dashboard/kanban/${task.id}`"
              class="gap-2"
            >
              <ExternalLink class="size-3.5" />
              Open detail
            </NuxtLink>
          </DropdownMenuItem>
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Move to...</DropdownMenuItem>
          <DropdownMenuItem>Assign to...</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem class="text-destructive">
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <button
      type="button"
      data-card-title
      :aria-label="ariaLabel"
      :class="[
        'mb-2 block w-full cursor-[inherit] pl-2 text-left text-sm leading-snug font-medium outline-none',
        'after:absolute after:inset-0 after:rounded-lg focus-visible:after:ring-[3px] focus-visible:after:ring-ring/50',
        isDone ? 'decoration-muted-foreground/40 line-through' : '',
      ]"
      @click="$emit('click', task)"
    >
      {{ task.title }}
    </button>

    <div
      v-if="task.tags.length"
      class="mb-2 flex flex-wrap gap-1 pl-2"
    >
      <TagBadge
        v-for="tag in task.tags"
        :key="tag.label"
        :label="tag.label"
        :color="tag.color"
      />
    </div>

    <div
      v-if="task.subtaskIds.length"
      class="mb-2 pl-2"
    >
      <SubtaskProgress
        :done="subtasksDone"
        :total="task.subtaskIds.length"
      />
    </div>

    <div class="flex items-center gap-2 pl-2">
      <DueDateBadge
        v-if="task.dueDate"
        :due-date="task.dueDate"
        variant="chip"
      />

      <div
        v-if="task.commentItems.length"
        class="text-muted-foreground flex items-center gap-1 text-xs tabular-nums"
      >
        <MessageSquare class="size-3" />
        {{ task.commentItems.length }}
      </div>

      <div
        v-if="task.fileItems.length"
        class="text-muted-foreground flex items-center gap-1 text-xs tabular-nums"
      >
        <Paperclip class="size-3" />
        {{ task.fileItems.length }}
      </div>

      <div class="relative z-10 ml-auto">
        <TooltipProvider :delay-duration="200">
          <Tooltip>
            <TooltipTrigger as-child>
              <UserAvatar
                :name="task.assignee.name"
                :color="task.assignee.color"
                size="xs"
              />
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              class="text-xs"
            >
              {{ task.assignee.name }}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  </div>
</template>
