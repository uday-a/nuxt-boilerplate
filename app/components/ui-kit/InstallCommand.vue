<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { Check, Copy } from '@/lib/icon-pack'
import { Button } from '@/components/ui/button'

const props = defineProps<{ command: string }>()

const { t } = useI18n()
const { copy, copied } = useClipboard({ copiedDuring: 1500, legacy: true })
</script>

<template>
  <div class="bg-muted flex items-center gap-2 rounded-md py-1 pr-1 pl-3">
    <code class="text-muted-foreground min-w-0 flex-1 truncate font-mono text-xs">{{ props.command }}</code>
    <Button
      variant="ghost"
      size="icon-sm"
      class="shrink-0"
      :aria-label="copied ? t('uiKit.card.copied') : t('uiKit.card.copy')"
      @click="copy(props.command)"
    >
      <Check
        v-if="copied"
        class="text-success size-4"
        aria-hidden="true"
      />
      <Copy
        v-else
        class="size-4"
        aria-hidden="true"
      />
    </Button>
    <span
      class="sr-only"
      aria-live="polite"
    >{{ copied ? t('uiKit.card.copied') : '' }}</span>
  </div>
</template>
