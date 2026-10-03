<script setup lang="ts">
import { Check, Monitor, Moon, Palette, RotateCcw, Sun } from '@/lib/icon-pack'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { COLOR_THEMES, RADIUS_OPTIONS } from '@/lib/color-themes'
import { useColorTheme } from '@/composables/useColorTheme'
import { ICON_PACKS, useIconPackControl } from '@/composables/useIconPack'

// Header "Customize" panel — a port of the uipkge.dev site customiser:
// primary colour, corner radius and colour mode, with a reset.
const { t } = useI18n()
const { colorTheme, radius, reset } = useColorTheme()
const { theme, setTheme } = useTheme()
const iconPack = useIconPackControl()

const MODES = [
  { id: 'light', icon: Sun },
  { id: 'dark', icon: Moon },
  { id: 'system', icon: Monitor },
] as const

function resetAll() {
  reset()
  setTheme('system')
  iconPack.set('lucide')
}

const optionClass = (on: boolean) => [
  'hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring/50 rounded-md border text-xs font-medium transition-colors outline-none focus-visible:ring-[3px]',
  on ? 'border-primary bg-secondary text-secondary-foreground' : 'border-border',
]
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button
        variant="ghost"
        size="icon"
        class="text-muted-foreground hover:text-foreground size-8"
        :aria-label="t('header.theme.aria')"
        :title="t('header.theme.aria')"
      >
        <Palette class="size-4" />
      </Button>
    </PopoverTrigger>
    <PopoverContent
      align="end"
      class="w-[min(calc(100vw-2rem),22rem)] p-4"
    >
      <div class="mb-4 border-b pb-3">
        <div class="flex items-baseline justify-between gap-2">
          <span class="text-sm font-semibold">{{ t('header.theme.title') }}</span>
          <span class="text-muted-foreground text-xs">{{ t('header.theme.saved') }}</span>
        </div>
        <div class="text-muted-foreground mt-0.5 truncate text-xs">
          {{ t('header.theme.hint') }}
        </div>
      </div>

      <div class="space-y-4">
        <fieldset>
          <legend class="mb-2 text-xs font-semibold">
            {{ t('header.theme.primary') }}
          </legend>
          <div class="grid grid-cols-3 gap-1.5">
            <button
              v-for="c in COLOR_THEMES"
              :key="c.id"
              type="button"
              :aria-pressed="colorTheme === c.id"
              :class="[optionClass(colorTheme === c.id), 'flex items-center gap-2 px-2 py-1.5 text-left', colorTheme !== c.id && 'border-transparent']"
              @click="colorTheme = c.id"
            >
              <span
                class="ring-border/60 relative flex size-3.5 shrink-0 items-center justify-center rounded-full ring-1 ring-inset"
                :style="{ background: c.swatch }"
              >
                <Check
                  v-if="colorTheme === c.id"
                  class="size-2.5 text-white"
                  :stroke-width="4"
                  aria-hidden="true"
                />
              </span>
              <span class="truncate">{{ t(`header.theme.names.${c.id}`) }}</span>
            </button>
          </div>
        </fieldset>

        <fieldset>
          <legend class="mb-2 text-xs font-semibold">
            {{ t('header.theme.radius') }}
          </legend>
          <div class="grid grid-cols-5 gap-1.5">
            <button
              v-for="r in RADIUS_OPTIONS"
              :key="r"
              type="button"
              :aria-pressed="radius === r"
              :class="[optionClass(radius === r), 'px-1 py-1.5']"
              @click="radius = r"
            >
              {{ r }}
            </button>
          </div>
        </fieldset>

        <fieldset>
          <legend class="mb-2 text-xs font-semibold">
            {{ t('header.theme.mode') }}
          </legend>
          <div class="grid grid-cols-3 gap-1.5">
            <button
              v-for="m in MODES"
              :key="m.id"
              type="button"
              :aria-pressed="theme === m.id"
              :class="[optionClass(theme === m.id), 'flex items-center justify-center gap-1.5 px-2 py-1.5']"
              @click="setTheme(m.id)"
            >
              <component
                :is="m.icon"
                class="size-3.5"
                aria-hidden="true"
              />
              {{ t(`header.theme.modes.${m.id}`) }}
            </button>
          </div>
        </fieldset>

        <fieldset>
          <legend class="mb-2 text-xs font-semibold">
            {{ t('header.theme.icons') }}
          </legend>
          <div class="grid grid-cols-4 gap-1.5">
            <button
              v-for="p in ICON_PACKS"
              :key="p"
              type="button"
              :aria-pressed="iconPack.pack.value === p"
              :class="[optionClass(iconPack.pack.value === p), 'px-2 py-1.5']"
              @click="iconPack.set(p)"
            >
              {{ t(`header.theme.iconPacks.${p}`) }}
            </button>
          </div>
        </fieldset>

        <Button
          variant="outline"
          size="sm"
          class="text-muted-foreground w-full gap-2 text-xs"
          @click="resetAll"
        >
          <RotateCcw
            class="size-3.5"
            aria-hidden="true"
          />
          {{ t('header.theme.reset') }}
        </Button>
      </div>
    </PopoverContent>
  </Popover>
</template>
