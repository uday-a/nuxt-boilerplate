<script setup lang="ts">

</script>

<template>
  <section class="border-y bg-muted/30">
    <div class="mx-auto max-w-6xl px-6 py-12">
      <p class="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Trusted by teams at
      </p>
      <div
        class="mt-8 grid grid-cols-2 items-center justify-items-center gap-x-10 gap-y-8 sm:grid-cols-3 lg:grid-cols-6"
      >
        <svg viewBox="0 0 140 28" class="h-6 w-auto text-muted-foreground transition-colors hover:text-foreground" aria-label="Northwind">
          <circle cx="14" cy="14" r="10" fill="none" stroke="currentColor" stroke-width="2" />
          <text x="32" y="19" font-family="ui-sans-serif, system-ui" font-size="15" font-weight="600" fill="currentColor">Northwind</text>
        </svg>

        <svg viewBox="0 0 120 28" class="h-6 w-auto text-muted-foreground transition-colors hover:text-foreground" aria-label="Helio">
          <path d="M6 14 L14 4 L22 14 L14 24 Z" fill="currentColor" />
          <text x="30" y="19" font-family="ui-sans-serif, system-ui" font-size="15" font-weight="600" fill="currentColor">Helio</text>
        </svg>

        <svg viewBox="0 0 130 28" class="h-6 w-auto text-muted-foreground transition-colors hover:text-foreground" aria-label="Pixel & Co">
          <rect x="4" y="4" width="8" height="8" fill="currentColor" />
          <rect x="16" y="4" width="8" height="8" fill="currentColor" opacity="0.5" />
          <rect x="4" y="16" width="8" height="8" fill="currentColor" opacity="0.5" />
          <rect x="16" y="16" width="8" height="8" fill="currentColor" />
          <text x="32" y="19" font-family="ui-sans-serif, system-ui" font-size="15" font-weight="600" fill="currentColor">Pixel &amp; Co</text>
        </svg>

        <svg viewBox="0 0 120 28" class="h-6 w-auto text-muted-foreground transition-colors hover:text-foreground" aria-label="Lumen">
          <path d="M4 22 L14 4 L24 22 Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
          <text x="32" y="19" font-family="ui-sans-serif, system-ui" font-size="15" font-weight="600" fill="currentColor">Lumen</text>
        </svg>

        <svg viewBox="0 0 130 28" class="h-6 w-auto text-muted-foreground transition-colors hover:text-foreground" aria-label="Cohort">
          <circle cx="10" cy="14" r="6" fill="currentColor" />
          <circle cx="20" cy="14" r="6" fill="currentColor" opacity="0.5" />
          <text x="32" y="19" font-family="ui-sans-serif, system-ui" font-size="15" font-weight="600" fill="currentColor">Cohort</text>
        </svg>

        <svg viewBox="0 0 120 28" class="h-6 w-auto text-muted-foreground transition-colors hover:text-foreground" aria-label="Vector">
          <path d="M4 4 L24 14 L4 24 Z" fill="currentColor" />
          <text x="32" y="19" font-family="ui-sans-serif, system-ui" font-size="15" font-weight="600" fill="currentColor">Vector</text>
        </svg>
      </div>
    </div>
  </section>
</template>
