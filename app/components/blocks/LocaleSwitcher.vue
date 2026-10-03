<script setup lang="ts">
import { Check, ChevronDown, Globe } from '@/lib/icon-pack'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

// Header control: switch UI language. @nuxtjs/i18n persists the choice in
// its cookie, so it survives reloads (same mechanism as Settings → Forms).
const { t, locale, locales, setLocale } = useI18n()
const options = computed(() =>
  (unref(locales) as { code: string, name?: string }[]).map(l => ({ code: l.code, label: l.name || l.code.toUpperCase() })),
)
const current = computed(() => options.value.find(o => o.code === locale.value)?.label ?? locale.value)
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        variant="ghost"
        size="sm"
        class="text-muted-foreground hover:text-foreground h-8 max-w-40 gap-1.5 px-2.5 text-xs font-medium"
        :aria-label="t('header.language.label')"
        :title="t('header.language.label')"
      >
        <Globe
          class="size-3.5 shrink-0"
          aria-hidden="true"
        />
        <span class="truncate">{{ current }}</span>
        <ChevronDown
          class="size-3 shrink-0"
          aria-hidden="true"
        />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      align="end"
      class="w-40"
    >
      <DropdownMenuLabel class="text-muted-foreground text-xs font-medium">
        {{ t('header.language.label') }}
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        v-for="o in options"
        :key="o.code"
        @select="setLocale(o.code as 'en' | 'es')"
      >
        {{ o.label }}
        <Check
          v-if="o.code === locale"
          class="ml-auto size-4"
          aria-hidden="true"
        />
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
