<script setup lang="ts">
import { computed } from 'vue'
import { Briefcase, CalendarDays, Clock, Users } from '@/lib/icon-pack'
import { Badge } from '@/components/ui/badge'
import { kindBadgeVariant, kindDotBg, utcOffsetLabel, type OfficeLocation } from '@/lib/locations'

// Popup card for an office marker. Uses divs, not <p>: Leaflet's stylesheet
// gives `.leaflet-popup-content p` 17px margins, which blew the layout apart.

const props = defineProps<{
  office: OfficeLocation
  // Pre-formatted local time ("14:32"), when the caller has a clock.
  localTime?: string | null
}>()

const { t } = useI18n()
const initials = computed(() => props.office.lead.split(' ').map(n => n[0]).join(''))
</script>

<template>
  <div class="w-60">
    <div class="flex items-start justify-between gap-3 pr-5">
      <div class="min-w-0">
        <div class="flex items-center gap-1.5">
          <span
            :class="['size-2 shrink-0 rounded-full', kindDotBg(office.kind)]"
            aria-hidden="true"
          />
          <span class="truncate text-sm font-semibold">{{ office.city }}</span>
        </div>
        <div class="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-xs">
          <span class="truncate">{{ office.country }}</span>
          <template v-if="localTime">
            <span aria-hidden="true">·</span>
            <Clock
              class="size-3.5 shrink-0"
              aria-hidden="true"
            />
            <span class="tabular-nums">{{ localTime }}</span>
          </template>
        </div>
      </div>
      <Badge
        :variant="kindBadgeVariant(office.kind)"
        class="shrink-0"
      >
        {{ t(`dashboard.locations.kind.${office.kind}`) }}
      </Badge>
    </div>

    <div class="bg-muted/50 mt-3 grid grid-cols-3 divide-x rounded-md border">
      <div class="px-2 py-1.5">
        <div class="text-muted-foreground flex items-center gap-1 text-xs">
          <Users
            class="size-3.5"
            aria-hidden="true"
          />
          {{ t('dashboard.locations.popup.people') }}
        </div>
        <div class="mt-0.5 text-sm font-semibold tabular-nums">
          {{ office.headcount }}
        </div>
        <div class="text-success text-xs tabular-nums">
          +{{ office.growth }}%
        </div>
      </div>
      <div class="px-2 py-1.5">
        <div class="text-muted-foreground flex items-center gap-1 text-xs">
          <Briefcase
            class="size-3.5"
            aria-hidden="true"
          />
          {{ t('dashboard.locations.popup.roles') }}
        </div>
        <div class="mt-0.5 text-sm font-semibold tabular-nums">
          {{ office.openRoles }}
        </div>
        <div class="text-muted-foreground text-xs">
          {{ t('dashboard.locations.popup.hiring') }}
        </div>
      </div>
      <div class="px-2 py-1.5">
        <div class="text-muted-foreground flex items-center gap-1 text-xs">
          <CalendarDays
            class="size-3.5"
            aria-hidden="true"
          />
          {{ t('dashboard.locations.popup.since') }}
        </div>
        <div class="mt-0.5 text-sm font-semibold tabular-nums">
          {{ office.opened }}
        </div>
        <div class="text-muted-foreground text-xs">
          {{ office.timezone ? utcOffsetLabel(office.timezone) : '' }}
        </div>
      </div>
    </div>

    <div class="mt-3 flex items-center gap-2">
      <span class="bg-muted text-muted-foreground flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium">
        {{ initials }}
      </span>
      <div class="min-w-0 text-xs">
        <div
          class="truncate font-medium"
          :title="office.lead"
        >
          {{ office.lead }}
        </div>
        <div class="text-muted-foreground">
          {{ t('dashboard.locations.popup.lead') }}
        </div>
      </div>
    </div>
  </div>
</template>
