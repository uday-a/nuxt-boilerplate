---
name: uipkge-first
description: Use when the user asks to add, build, or create any UI component or primitive (button, card, dialog, sheet, command palette, table, form field, chart, etc.) in this Nuxt boilerplate. Routes to the @uipkge registry instead of hand-rolling shadcn-vue primitives. Trigger phrases include "add a button", "I need a dialog", "create a table", "we need a date picker", "make a sidebar", or any request that would naturally land in `app/components/ui/`.
---

# uipkge-first

This boilerplate's UI is **100% @uipkge-registry-driven**. There is no hand-rolled shadcn-vue, no copy-pasted Radix wrappers, no "I'll just inline this Tailwind class group." Every primitive in `app/components/ui/` was pulled from the registry via `npx shadcn-vue add @uipkge/<name>`.

## The rule

**Before writing any component that lives in `app/components/ui/`, check the registry.** If it exists there, install it. If it doesn't, ask the user whether to (a) check the registry roadmap or (b) approve a hand-rolled exception — never silently hand-roll.

## How to invoke

```bash
npx shadcn-vue add @uipkge/<name>
```

Names follow the registry's catalog (e.g. `button`, `card`, `dialog`, `sheet`, `tabs`, `form`, `data-table`, `command`, `chart-line`, etc.). Run without args to list:

```bash
npx shadcn-vue add @uipkge
```

After install, each ui dir auto-exports via `index.ts`, so use the named import:

```vue
<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
</script>
```

## Why registry-driven is right for vibe-coders

1. **No abstraction debt.** The code is in your repo, you own every line. shadcn-vue's "you own it" philosophy + a registry means you get a starting point without inheriting a maintained dependency.
2. **Consistency across surfaces.** Every Card on every page shares the same border radius, padding scale, shadow token. Vibe-coders building 12 pages in 3 days don't have time to make 12 subtly-different Cards.
3. **Token-bound.** Registry components consume CSS variables (`--background`, `--foreground`, `--primary`, etc.) that the theme system already wires up. Hand-rolled primitives drift off the token system within a week.
4. **Accessibility is pre-solved.** reka-ui primitives underneath each Card/Dialog/Sheet have correct ARIA, focus management, keyboard handling. Hand-rolling means re-deriving that.
5. **Upgrade path.** `npx shadcn-vue add @uipkge/<name> --overwrite` re-pulls the latest registry version. Hand-rolled forks can't.
6. **AI agents reason about it.** When the next Claude session reads the codebase, "Card from @/components/ui/card" is universally recognized. Hand-rolled `MyFancyBox` is opaque.

## Composition pattern

Build pages from **registry primitives (`app/components/ui/`) → composed blocks (`app/components/blocks/`) → pages (`app/pages/`)**.

- `ui/` is registry-managed. Don't edit those files by hand unless you've decided to fork that specific component permanently — and if you do, leave a comment explaining why.
- `blocks/` is project-owned. Combine registry primitives here (e.g. `AuthSignIn.vue`, `Hero01.vue`, `Sidebar02.vue`). These are where your app's voice lives.
- `pages/` consumes both. Keep page files thin; push composition into blocks.

## What to do when registry doesn't have it

1. **Check first.** `npx shadcn-vue add @uipkge` and scan the list.
2. **Compose from primitives.** Often what looks like "we need component X" is actually "we need Card + Button + Input arranged differently." Build that as a block in `app/components/blocks/`.
3. **Reka UI direct.** If you need a Radix-style primitive that's not in the registry yet, build a thin block on top of `reka-ui` (already a dep) with the same prop shape the registry would use — so when the registry catches up, swapping is mechanical.
4. **Ask the user.** "Registry doesn't have a Foo. Options: compose from Card+Button, or I roll one in `blocks/`. Which?" Don't silently hand-roll.

## Anti-patterns to refuse

- Pasting a shadcn-vue.com snippet directly into `app/components/ui/`. Use the registry instead.
- Inlining Tailwind class combinations that duplicate what `Button` or `Card` already provides.
- Wrapping a registry component in a thin project-specific wrapper "just to add one prop" — usually the registry component already takes that prop, or you can pass it through `class` + `cn()`.
- Hand-rolling forms with raw `<input>` instead of `Input` + `Label` + `FormField` from `@/components/ui/form`.
- Building a new sidebar instead of consuming `@/components/ui/sidebar` + `app/components/blocks/sidebar-02/*`.

## Verification

After adding a registry component, confirm:

1. `app/components/ui/<name>/index.ts` exists and re-exports.
2. Auto-import works: in any `.vue` template, the PascalCase name (e.g. `<Button>`) resolves without an explicit import (Nuxt scans `app/components/` with `pathPrefix: false`).
3. The component honors the dark mode toggle (it should — registry components consume CSS vars).
4. `npm run lint` passes (registry files often need stylistic fixes which `lint:fix` handles).

If any of those fail, the registry component install may have collided with an existing file (e.g. `label/Label.vue`) — re-run with `--overwrite` if appropriate.
