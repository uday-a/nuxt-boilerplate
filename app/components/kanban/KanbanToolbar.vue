<script setup lang="ts">
import { computed } from 'vue'
import { Search, Filter, ChevronDown, X, LayoutGrid, List } from '@/lib/icon-pack'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { priorityConfig, assignees, getInitials } from '@/composables/useKanban'

const props = defineProps<{
  searchQuery: string
  selectedPriority: string | null
  selectedAssignee: string | null
  viewMode: 'board' | 'list'
}>()

const emit = defineEmits<{
  'update:searchQuery': [value: string]
  'update:selectedPriority': [value: string | null]
  'update:selectedAssignee': [value: string | null]
  'update:viewMode': [value: 'board' | 'list']
}>()

const { t } = useI18n()

// WHY (Rule70): chip labels resolve through the same priority config the
// dropdown uses, so the chip value always matches the menu wording.
const priorityLabel = computed(() =>
  props.selectedPriority ? (priorityConfig as Record<string, { label: string }>)[props.selectedPriority]?.label ?? props.selectedPriority : '',
)
</script>

<template>
  <div>
    <div class="mb-3 flex shrink-0 flex-wrap items-center gap-2">
      <div class="relative w-full sm:w-56">
        <Search class="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
        <Input
          :model-value="searchQuery"
          placeholder="Search tasks..."
          class="h-8 pl-8 text-sm"
          @update:model-value="(v: string | number) => emit('update:searchQuery', String(v))"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button
            variant="outline"
            size="sm"
            class="h-8 gap-1.5 text-xs"
          >
            <Filter class="size-3" />
            Priority
            <Badge
              v-if="selectedPriority"
              variant="default"
              class="ml-0.5 h-4 min-w-4 justify-center rounded px-1 text-xs"
            >
              1
            </Badge>
            <ChevronDown class="text-muted-foreground size-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          class="w-40"
        >
          <DropdownMenuItem
            v-for="(config, key) in priorityConfig"
            :key="key"
            class="gap-2"
            @click="$emit('update:selectedPriority', selectedPriority === key ? null : (key as string))"
          >
            <component
              :is="config.icon"
              :class="['size-3.5', config.class]"
            />
            {{ config.label }}
            <span
              v-if="selectedPriority === key"
              class="bg-primary ml-auto size-1.5 rounded-full"
            />
          </DropdownMenuItem>
          <DropdownMenuSeparator v-if="selectedPriority" />
          <DropdownMenuItem
            v-if="selectedPriority"
            @click="$emit('update:selectedPriority', null)"
          >
            Clear filter
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Badge
        v-if="selectedAssignee"
        variant="secondary"
        class="h-7 cursor-pointer gap-1 pr-1.5 text-xs"
        @click="$emit('update:selectedAssignee', null)"
      >
        {{ selectedAssignee }}
        <X class="size-3 opacity-50" />
      </Badge>

      <!-- WHY (Rule76): board/list toggles were title-only -- they now carry
         an accessible name and a tooltip like every other icon trigger. -->
      <ToggleGroup
        type="single"
        size="sm"
        :model-value="viewMode"
        class="bg-muted ml-auto flex items-center gap-0.5 rounded-md p-0.5"
        @update:model-value="(v) => v && $emit('update:viewMode', v as 'board' | 'list')"
      >
        <TooltipProvider :delay-duration="300">
          <Tooltip>
            <TooltipTrigger as-child>
              <ToggleGroupItem
                value="board"
                class="data-[state=on]:bg-background size-7 rounded-sm p-0 data-[state=on]:shadow-sm"
                :aria-label="t('dashboard.kanban.boardView')"
              >
                <LayoutGrid class="size-3.5" />
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>{{ t('dashboard.kanban.boardView') }}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger as-child>
              <ToggleGroupItem
                value="list"
                class="data-[state=on]:bg-background size-7 rounded-sm p-0 data-[state=on]:shadow-sm"
                :aria-label="t('dashboard.kanban.listView')"
              >
                <List class="size-3.5" />
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent>{{ t('dashboard.kanban.listView') }}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </ToggleGroup>

      <div class="flex items-center">
        <TooltipProvider :delay-duration="300">
          <Tooltip
            v-for="(a, key) in assignees"
            :key="key"
          >
            <TooltipTrigger as-child>
              <button
                :class="[
                  // rounded-full so the selected ring + focus ring trace the
                  // Avatar's circular outline instead of the rectangular button.
                  'ring-background relative -ml-1.5 rounded-full outline-none transition-all first:ml-0 focus-visible:ring-1 focus-visible:ring-ring/50',
                  selectedAssignee === a.name
                    ? 'ring-primary z-20 ring-1'
                    : selectedAssignee && selectedAssignee !== a.name
                      ? 'opacity-40 hover:opacity-70'
                      : 'hover:z-10 hover:scale-110',
                ]"
                @click="$emit('update:selectedAssignee', selectedAssignee === a.name ? null : a.name)"
              >
                <Avatar class="border-background size-7 border-2">
                  <AvatarFallback :class="['text-xs font-semibold', a.color]">
                    {{ getInitials(a.name) }}
                  </AvatarFallback>
                </Avatar>
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              class="text-xs"
            >
              {{ a.name }}
              <span
                v-if="selectedAssignee === a.name"
                class="text-muted-foreground ml-1"
              >(filtered)</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
    <!-- WHY (Rule70): active-filter chip row for priority/assignee/search --
         same contract as the data table: value + clear. -->
    <div
      v-if="selectedPriority || selectedAssignee || searchQuery.trim()"
      class="mb-3 flex flex-wrap items-center gap-1.5"
    >
      <Badge
        v-if="selectedPriority"
        variant="secondary"
        class="gap-1 py-0.5 pr-1 text-xs"
      >
        {{ t('dashboard.kanban.priority') }}: {{ priorityLabel }}
        <button
          type="button"
          class="hover:text-foreground focus-visible:ring-ring inline-flex items-center rounded-full p-0.5 focus-visible:ring-2 focus-visible:outline-none"
          :aria-label="t('dashboard.kanban.clearFilter')"
          @click="$emit('update:selectedPriority', null)"
        >
          <X
            class="size-3"
            aria-hidden="true"
          />
        </button>
      </Badge>
      <Badge
        v-if="selectedAssignee"
        variant="secondary"
        class="gap-1 py-0.5 pr-1 text-xs"
      >
        {{ t('dashboard.kanban.assignee') }}: {{ selectedAssignee }}
        <button
          type="button"
          class="hover:text-foreground focus-visible:ring-ring inline-flex items-center rounded-full p-0.5 focus-visible:ring-2 focus-visible:outline-none"
          :aria-label="t('dashboard.kanban.clearFilter')"
          @click="$emit('update:selectedAssignee', null)"
        >
          <X
            class="size-3"
            aria-hidden="true"
          />
        </button>
      </Badge>
      <Badge
        v-if="searchQuery.trim()"
        variant="secondary"
        class="max-w-56 gap-1 py-0.5 pr-1 text-xs"
      >
        <span class="truncate">{{ t('dashboard.kanban.search') }}: "{{ searchQuery.trim() }}"</span>
        <button
          type="button"
          class="hover:text-foreground focus-visible:ring-ring inline-flex shrink-0 items-center rounded-full p-0.5 focus-visible:ring-2 focus-visible:outline-none"
          :aria-label="t('dashboard.kanban.clearFilter')"
          @click="$emit('update:searchQuery', '')"
        >
          <X
            class="size-3"
            aria-hidden="true"
          />
        </button>
      </Badge>
    </div>
  </div>
</template>
