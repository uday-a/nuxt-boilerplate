---
name: add-page
description: Use this skill when creating any new route in `app/pages/**` in this Nuxt boilerplate. Enforces the boilerplate's page conventions: correct layout (`dashboard` for protected app shells, `false` for public marketing), middleware (auth gating), `useHead` title, i18n where applicable, and registry-first composition. Trigger phrases include "add a page", "create a route", "new screen", "make a /foo page", or any `Write` call that creates a file matching `app/pages/**/*.vue`.
---

# add-page

This boilerplate has clear page conventions. Following them gives you a working route in 30 seconds. Diverging means subtle bugs (no auth, no title, no breadcrumb, layout collision).

## Pick the right shape

Every new page falls into exactly one of these buckets. Pick first, then scaffold.

### Bucket 1 — Authenticated app surface

Lives under `dashboard/`, `settings/`, `projects/`, `onboarding/`, or anywhere requiring a logged-in user.

```vue
<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useHead({ title: '<Title> · <Section>' })
</script>

<template>
  <div class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-semibold tracking-tight">
        <Title>
      </h1>
      <p class="text-muted-foreground text-sm">
        <One-line description>
      </p>
    </header>

    <!-- Compose from @/components/ui/* primitives and @/components/blocks/* -->
  </div>
</template>
```

Rules:
- `layout: 'dashboard'` brings the sidebar + breadcrumbs + command palette.
- `middleware: 'auth'` enforces session (demo mode counts as a session).
- `useHead.title` follows pattern `'<Page> · <Section>'` so breadcrumbs and tab titles align.
- Top heading uses `text-2xl font-semibold tracking-tight`. Match existing pages.

### Bucket 2 — Public marketing / legal

Landing, pricing, terms, privacy, contact.

```vue
<script setup lang="ts">
definePageMeta({ auth: false, layout: false })
useHead({
  title: '<Title> · Acme',
  meta: [{ name: 'description', content: '<One sentence>' }],
})
</script>

<template>
  <div class="bg-background text-foreground min-h-screen">
    <Header01 />
    <main>
      <!-- Sections here. Compose from `app/components/blocks/*01.vue`. -->
    </main>
    <Footer01 />
  </div>
</template>
```

Rules:
- `auth: false` explicit. Public pages do not omit it; absence is ambiguous.
- `layout: false` because public pages render their own `<Header01>` + `<Footer01>` shell.
- Meta description for SEO. The `@nuxtjs/seo` umbrella picks it up.
- Reuse landing blocks (`Hero01`, `Pricing01`, `Faq01`, `Cta01`) when sections fit; don't recreate.

### Bucket 3 — Auth entry (sign-in, sign-up, forgot, mfa, reset)

```vue
<script setup lang="ts">
definePageMeta({ auth: false, layout: false })
useHead({ title: '<Title>' })

const { loggedIn } = useUserSession()
if (loggedIn.value) await navigateTo('/dashboard')
</script>

<template>
  <AuthSignIn ... />  <!-- or AuthSignUp, AuthPasswordReset, AuthMfa -->
</template>
```

Rules:
- Same `auth: false, layout: false` as marketing.
- The "redirect-if-logged-in" guard at the top must run **before** `<AuthSignIn>` mounts; otherwise users see a flicker.
- Use the existing `AuthSignIn` / `AuthSignUp` blocks; do not hand-roll forms here. They emit `submit` and `oauth`; wire those to your handlers.

### Bucket 4 — Dynamic route (`[param].vue` or `[[optional]].vue`)

```vue
<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const route = useRoute()
const id = computed(() => String(route.params.id))

useHead(() => ({ title: `${id.value} · Projects` }))
</script>

<template>
  ...
</template>
```

Rules:
- `useHead` is the **function** form so the title reacts to param changes during client-side nav.
- Always coerce `route.params.X` to `String(...)` — Nuxt types it as `string | string[]`.
- Validate the param if it maps to a known set (e.g. a Postgres enum); 404 via `throw createError({ statusCode: 404 })` if it doesn't.

## i18n

If the page contains user-facing strings:

```vue
<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <h1>{{ t('pages.foo.title') }}</h1>
</template>
```

Add the key to **both** `i18n/locales/en.json` AND `i18n/locales/es.json`. Missing locale keys silently fall back; this is a bug magnet. The `i18n-audit` skill catches it later, but cheaper to do it now.

## Sidebar / navigation

If the new page belongs in the sidebar, add it to `app/components/blocks/sidebar-02/Sidebar02.vue`'s `navMain` array. Each entry:

```ts
{ title: t('nav.items.foo'), url: '/path', icon: SomeIcon }
```

If the page is reachable only via deep link (no sidebar entry), no nav update needed.

## Breadcrumbs

The dashboard layout derives breadcrumbs from `route.path`. If the path is `/settings/account`, breadcrumb shows `Settings / Account` automatically. No manual wiring unless you want custom labels — then override in the page via `definePageMeta({ breadcrumb: 'Custom Label' })` (custom meta key, read by `DashboardLayout.vue`).

## SEO + sitemap

`@nuxtjs/seo` auto-discovers pages. New protected pages are added to the sitemap by default — for private routes, exclude them:

```ts
// In nuxt.config.ts under `sitemap:` (add if not present)
sitemap: { exclude: ['/dashboard/**', '/settings/**', '/admin/**'] }
```

Public pages get crawled. Private ones shouldn't be in the sitemap.

## What NOT to do

- **Don't** create `app/pages/<name>.vue` without picking a bucket. "Just a quick page" without `definePageMeta` defaults to the root layout — usually wrong.
- **Don't** copy `forms.vue` (the kitchen-sink demo) as a template. It uses primitives directly; real pages should use `Form` + `FormField` from `@/components/ui/form` if they have validation.
- **Don't** add the page without checking `app/pages/<name>` doesn't already exist as a directory (would shadow each other).
- **Don't** wire a custom layout. Use `dashboard`, `false`, or omit. Adding a third layout has a real maintenance cost.

## Verification

After creating the page:

1. `curl http://localhost:3000/<path>` returns 200 (public) or 302→`/login?next=...` (private without session).
2. Breadcrumb renders correctly in dashboard layout.
3. Tab title matches `useHead.title`.
4. `npm run typecheck` passes — particularly for `useHead(() => ...)` function form on dynamic routes.
5. If protected: invoke `auth-gating-check` skill.
