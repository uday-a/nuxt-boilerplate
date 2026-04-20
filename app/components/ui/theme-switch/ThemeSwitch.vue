<script setup lang="ts">
import { computed } from 'vue'
import { ChevronDown, Monitor, Moon, Palette, Sparkles, Sun } from 'lucide-vue-next'
import { SectionCard } from '@/components/ui/section-card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type Theme = 'light' | 'dark' | 'system' | 'black'
type Variant = 'cards' | 'icons' | 'icon-only' | 'dropdown' | 'pill' | 'pill-4' | 'switch'

const ICONS: Record<Theme, any> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
  black: Sparkles,
}

const LABELS: Record<Theme, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
  black: 'Black',
}

const VARIANT_OPTIONS: Record<Variant, Theme[]> = {
  cards: ['light', 'dark', 'system'],
  icons: ['light', 'dark', 'system'],
  'icon-only': ['light', 'dark'],
  dropdown: ['light', 'dark', 'system'],
  pill: ['light', 'dark', 'system'],
  'pill-4': ['system', 'light', 'dark', 'black'],
  switch: ['light', 'dark'],
}

const props = withDefaults(
  defineProps<{
    modelValue: Theme
    variant?: Variant
    title?: string
    description?: string
    class?: string
  }>(),
  { variant: 'cards' }
)

const emit = defineEmits<{ 'update:modelValue': [Theme] }>()

const options = computed(() => VARIANT_OPTIONS[props.variant])
const activeIndex = computed(() => {
  const i = options.value.indexOf(props.modelValue)
  return i === -1 ? 0 : i
})

const indicatorStyle = computed(() => ({
  width: `calc((100% - 4px) / ${options.value.length})`,
  transform: `translateX(calc(${activeIndex.value} * 100%))`,
}))

function set(t: Theme) {
  emit('update:modelValue', t)
}
function cycle() {
  const next = options.value[(activeIndex.value + 1) % options.value.length]
  if (next) emit('update:modelValue', next)
}
</script>

<template>
  <!-- Cards: full SectionCard with 3-button grid (default) -->
  <SectionCard
    v-if="variant === 'cards'"
    :title="title ?? 'Appearance'"
    :description="description ?? 'Choose your interface theme.'"
    :class="$props.class"
  >
    <template #header-action>
      <Palette class="text-muted-foreground size-5" />
    </template>
    <div class="grid grid-cols-3 gap-2">
      <button
        v-for="t in options"
        :key="t"
        type="button"
        class="rounded-md border p-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        :class="
          modelValue === t
            ? 'border-primary ring-1 ring-primary bg-primary/5'
            : 'border-border hover:bg-muted/50'
        "
        @click="set(t)"
      >
        <component :is="ICONS[t]" class="size-4 mb-2 text-muted-foreground" />
        <p class="text-xs font-medium">{{ LABELS[t] }}</p>
      </button>
    </div>
  </SectionCard>

  <!-- Icons: compact 3-icon segmented row, no labels -->
  <div
    v-else-if="variant === 'icons'"
    role="radiogroup"
    :aria-label="title ?? 'Theme'"
    :class="['inline-flex items-center gap-0.5 rounded-md border border-border bg-card p-0.5', $props.class]"
  >
    <button
      v-for="t in options"
      :key="t"
      type="button"
      role="radio"
      :aria-checked="modelValue === t"
      :aria-label="LABELS[t]"
      class="size-7 rounded grid place-items-center transition-colors"
      :class="
        modelValue === t
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      "
      @click="set(t)"
    >
      <component :is="ICONS[t]" class="size-4" />
    </button>
  </div>

  <!-- Icon-only: single button cycling 2 states with rotate+fade animation -->
  <button
    v-else-if="variant === 'icon-only'"
    type="button"
    :aria-label="LABELS[modelValue]"
    :class="[
      'relative size-9 grid place-items-center rounded-full border border-border bg-card overflow-hidden transition-colors hover:bg-muted',
      $props.class,
    ]"
    @click="cycle"
  >
    <Transition
      mode="out-in"
      enter-active-class="transition duration-300 ease-out"
      leave-active-class="transition duration-200 ease-in absolute"
      enter-from-class="rotate-90 opacity-0 scale-75"
      leave-to-class="-rotate-90 opacity-0 scale-75"
    >
      <component :is="ICONS[modelValue]" :key="modelValue" class="size-4" />
    </Transition>
  </button>

  <!-- Dropdown: trigger button → menu of states -->
  <DropdownMenu v-else-if="variant === 'dropdown'">
    <DropdownMenuTrigger as-child>
      <button
        type="button"
        :class="[
          'inline-flex items-center gap-2 h-9 rounded-md border border-border bg-card px-3 text-sm transition hover:bg-muted',
          $props.class,
        ]"
      >
        <component :is="ICONS[modelValue]" class="size-4" />
        <span>{{ LABELS[modelValue] }}</span>
        <ChevronDown class="size-3 opacity-60" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="min-w-[140px]">
      <DropdownMenuItem v-for="t in options" :key="t" @click="set(t)">
        <component :is="ICONS[t]" class="size-4 mr-2" />
        <span>{{ LABELS[t] }}</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>

  <!-- Pill / Pill-4: equal segments with sliding indicator -->
  <div
    v-else-if="variant === 'pill' || variant === 'pill-4'"
    role="radiogroup"
    :aria-label="title ?? 'Theme'"
    :class="['relative inline-flex w-full max-w-md rounded-full border border-border bg-card p-0.5', $props.class]"
  >
    <span
      aria-hidden
      class="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 rounded-full bg-primary transition-transform duration-300 ease-out"
      :style="indicatorStyle"
    />
    <button
      v-for="t in options"
      :key="t"
      type="button"
      role="radio"
      :aria-checked="modelValue === t"
      :aria-label="LABELS[t]"
      class="relative z-[1] flex-1 inline-flex items-center justify-center gap-1.5 h-7 px-3 rounded-full text-xs font-medium transition-colors"
      :class="
        modelValue === t
          ? 'text-primary-foreground'
          : 'text-muted-foreground hover:text-foreground'
      "
      @click="set(t)"
    >
      <component :is="ICONS[t]" class="size-3.5" />
      <span>{{ LABELS[t] }}</span>
    </button>
  </div>

  <!-- Switch: iOS-style 2-state toggle with thumb that slides -->
  <button
    v-else-if="variant === 'switch'"
    type="button"
    role="switch"
    :aria-checked="modelValue === 'dark'"
    :aria-label="LABELS[modelValue]"
    :class="[
      'relative inline-flex w-16 h-8 items-center rounded-full border border-border transition-colors',
      modelValue === 'dark' ? 'bg-zinc-900' : 'bg-amber-100',
      $props.class,
    ]"
    @click="set(modelValue === 'dark' ? 'light' : 'dark')"
  >
    <Sun
      class="absolute left-1.5 size-4 text-amber-500 transition-opacity"
      :class="modelValue === 'dark' ? 'opacity-30' : 'opacity-100'"
    />
    <Moon
      class="absolute right-1.5 size-4 text-zinc-300 transition-opacity"
      :class="modelValue === 'light' ? 'opacity-30' : 'opacity-100'"
    />
    <span
      aria-hidden
      class="absolute size-6 rounded-full bg-card shadow border border-border transition-transform duration-300 ease-out"
      :style="{ transform: `translateX(${modelValue === 'dark' ? '36px' : '4px'})` }"
    />
  </button>
</template>
