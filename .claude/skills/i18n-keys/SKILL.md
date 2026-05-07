---
name: i18n-keys
description: Use this skill when adding or modifying any user-facing string in a Vue template or script that uses `t(…)`, `$t(…)`, or `useI18n().t(…)` in this Nuxt boilerplate. Enforces parity between `i18n/locales/en.json` and `i18n/locales/es.json` so missing keys don't silently render the namespace path. Trigger phrases include "add a string", "translate this", "i18n key", "t('…')", or any edit that adds a new `t(` call.
---

# i18n-keys

The boilerplate ships two locales (`en`, `es`) and `@nuxtjs/i18n` with `defaultLocale: 'en'`. Missing keys don't error — they render the key path verbatim. Adding `t('settings.account.deleteWarning')` without the corresponding JSON entry means Spanish users see `settings.account.deleteWarning` on screen.

## The rule

For every new `t('foo.bar')` or `$t('foo.bar')` call, the same key must exist in **both** locale files:

- `i18n/locales/en.json`
- `i18n/locales/es.json`

The `i18n-audit` skill (global, in `~/.claude/skills/i18n-audit/`) is the reactive audit — it scans the whole tree and surfaces missing keys after the fact. This skill is preventive: enforce parity at the moment the call is added.

## Workflow

When adding a new translated string:

1. Pick the key path. Reuse the existing namespace tree — don't invent a new top-level for a one-off:
   - `auth.*` — auth flows
   - `nav.*` — sidebar / header / breadcrumbs
   - `settings.*` — settings pages
   - `common.*` — generic verbs / nouns reused across pages (cancel, save, delete)
   - Page-specific: use the page's path as the namespace (`dashboard.calendar.*`, `projects.detail.*`)

2. Add to `i18n/locales/en.json` first with the source-of-truth English.

3. Add the same path to `i18n/locales/es.json`. If you don't have a translation yet, use a recognizable placeholder like `'[ES] Foo bar'` so it's obviously not-yet-translated rather than missing. Never leave only English.

4. Use in the component:

```vue
<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <h1>{{ t('dashboard.calendar.title') }}</h1>
</template>
```

For string interpolation, use named placeholders:

```json
{ "dashboard": { "welcome": "Welcome back, {name}" } }
```

```vue
{{ t('dashboard.welcome', { name: user.name }) }}
```

Match the placeholder name in every locale.

## Common gotchas

### 1. New page with hardcoded strings

If you `cp` an existing page as a template, you'll inherit its translated strings — but any new copy you add is in English only. After every new page, grep for hardcoded English in the template:

```bash
# Look for static English-looking strings in the new page
grep -E ">[A-Z][a-z]+( [a-z]+)+<\|>[A-Z][a-z]+\." app/pages/<new-path>.vue
```

Anything that pops out is a candidate for translation.

### 2. Block component shared across locales

When adding to `app/components/blocks/`, the block typically renders the same strings across every page that includes it. So a `<NotificationsPopover>` with hardcoded "Mark all as read" needs translation once; the block becomes reusable.

### 3. Interpolation drift

```json
// en
{ "billing": { "ratesFrom": "Starting at {amount} per month" } }
// es — WRONG: placeholder name differs
{ "billing": { "ratesFrom": "Desde {price} al mes" } }
```

Pin the placeholder name; the locale only changes the surrounding text.

### 4. Plurals

Nuxt i18n supports plural forms via pipe-separated values. Use them rather than inventing `t('user.count') + ' ' + (n > 1 ? t('users') : t('user'))`:

```json
{ "user": { "count": "no users | one user | {n} users" } }
```

```vue
{{ t('user.count', n) }}
```

## Verification

After adding new keys:

```bash
# 1. Diff the keys between locales — should be empty
diff <(node -e "const d=require('./i18n/locales/en.json');function f(o,p=''){return Object.entries(o).flatMap(([k,v])=>v&&typeof v==='object'?f(v,p+k+'.'):[p+k])}console.log(f(d).sort().join('\n'))") \
     <(node -e "const d=require('./i18n/locales/es.json');function f(o,p=''){return Object.entries(o).flatMap(([k,v])=>v&&typeof v==='object'?f(v,p+k+'.'):[p+k])}console.log(f(d).sort().join('\n'))")

# 2. Every t() call in the diff resolves
grep -oE "t\(['\"][a-zA-Z][a-zA-Z0-9._]+['\"]" <touched-files> | sort -u
# manually confirm each path exists in en.json
```

Or just run the reactive audit:

```bash
# If/when i18n-audit skill is available globally
```

## When to escalate

If the user adds 10+ keys at once for a new feature, suggest using the `i18n-audit` skill (global) on the resulting branch to confirm parity at scale — manual key-by-key verification fatigues.

## Refusal

If a diff adds a `t('foo.bar')` call but the JSON files don't gain the matching key, stop and add the key — to both locales — before continuing.
