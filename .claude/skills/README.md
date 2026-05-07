# Project skills for this Nuxt boilerplate

This directory ships **Claude Code skills** that turn the boilerplate's conventions into agent-enforced guardrails. They activate automatically when their trigger phrases appear in a session, so a vibe-coder building on this fork gets the same discipline as the original author.

Skills are loaded by Claude Code from `.claude/skills/<name>/SKILL.md` in the working directory. Nothing to install — they're picked up automatically.

## What's here

| Skill | Fires when | What it does |
|---|---|---|
| [`uipkge-first`](./uipkge-first/SKILL.md) | User wants to add a UI primitive (Button, Card, Dialog, Form, etc.) | Routes to `npx shadcn-vue add @uipkge/<name>` and refuses silent hand-rolling. Explains why a registry-driven UI is the right call for solo / AI-assisted builders. |
| [`add-page`](./add-page/SKILL.md) | User creates a file under `app/pages/**` | Picks the right page bucket (authenticated, public, auth-entry, dynamic), sets `definePageMeta`, `useHead`, and i18n correctly. |
| [`auth-gating-check`](./auth-gating-check/SKILL.md) | Diff touches `server/api/**`, `server/routes/**`, `app/pages/**`, or `app/middleware/**` | Verifies every protected page declares `middleware: 'auth'` and every protected API route calls `requireUserSession` / `requireRole`. Surfaces unguarded endpoints. |
| [`secret-exposure-check`](./secret-exposure-check/SKILL.md) | Before commit/push when env, runtimeConfig, logs, or error responses changed | Catches `process.env` in client code, secrets in `runtimeConfig.public`, sensitive context in error envelopes, session/token data in logs. |
| [`logger-conventions`](./logger-conventions/SKILL.md) | Any log statement added or modified in `server/**` | Enforces dot-namespaced event names, structured fields, no PII, no `console.log` surviving to prod. |
| [`response-envelope`](./response-envelope/SKILL.md) | Any new or modified `server/api/**` handler | Forces `apiHandler` wrapper + `ok()` / `apiError(code, msg)` over raw `defineEventHandler` and `createError`. |
| [`error-handling`](./error-handling/SKILL.md) | Any try/catch, throw, rethrow, or error-pathing logic added or modified | Enforces typed errors, no silent swallow, no leaked stack traces, no logging raw `Error` instances. |
| [`i18n-keys`](./i18n-keys/SKILL.md) | Adding or modifying a `t('…')` / `$t('…')` call | Enforces key parity across `i18n/locales/en.json` and `es.json` so missing translations don't render the namespace path. |
| [`db-migration`](./db-migration/SKILL.md) | Editing `server/db/schema.ts` (table / column / enum changes) | Forces `npx drizzle-kit generate` to emit a migration file, surfaces destructive operations, calls out two-step migrations for NOT NULL adds. |
| [`shipping-check`](./shipping-check/SKILL.md) | User signals "done", "ready to commit", "ship it" | Runs the full quality gate: lint, typecheck, knip, jscpd, `nuxi prepare`, staged-files boundary. Surfaces PASS/FAIL per check before committing. |

## How they relate to the boilerplate's other guardrails

Skills are the *agent-side* of the same quality bar that the boilerplate enforces *tool-side*. The toolchain is real; the skills make sure the next AI session running on a fork knows when to invoke it.

| Concern | Tool-side enforcement | Skill that triggers it |
|---|---|---|
| Lint / format | `lefthook` pre-commit + `eslint --fix` | `shipping-check` |
| Commit messages | `commitlint` via lefthook commit-msg | `shipping-check` |
| Type safety | `npm run typecheck` + CI | `shipping-check` |
| Dead code | `knip` | `shipping-check` |
| Duplicate code | `jscpd` (threshold 2.5%) | `shipping-check` |
| Env validation | `zod` schema in `server/utils/env.ts` (fail-fast on boot) | `secret-exposure-check` |
| Auth gating | `requireUserSession` / `requireRole` helpers in `server/utils/guards.ts` | `auth-gating-check` |
| UI consistency | `@uipkge` registry consumed via `components.json` | `uipkge-first` |
| Deletion safety | Global `/safe-remove` skill (`~/.claude/skills/safe-remove`) | Independent — invoke directly when deleting |

## Why these specific skills

The boilerplate's target user is a **vibe-coder**: someone moving fast, often with AI assistance, who needs to ship a SaaS in days, not quarters. The failure modes that bite that audience are:

1. **Subtle inconsistency** — every page is a slightly different Card. Two months in, the design system is gone. → `uipkge-first` enforces a single source.
2. **Forgotten auth gate** — a copy-pasted page lands without `middleware: 'auth'`, the data behind it is publicly fetchable for a week before someone notices. → `auth-gating-check` catches it before commit.
3. **Leaked env** — `process.env.STRIPE_SECRET` referenced from a `composables/` file gets bundled into the client JS. → `secret-exposure-check` finds it.
4. **Drift from conventions** — pages with the wrong layout, missing breadcrumbs, no `useHead` title. → `add-page` standardizes the scaffolding.
5. **Skipped verification** — "looks good, commit it" without running lint/typecheck/duplicates. → `shipping-check` is the gate.

If you're not a vibe-coder — say, you're a senior engineer who already runs `npm run lint && npm run typecheck` on muscle memory — the skills still help, but they save you nothing. Disable any you find redundant by deleting the corresponding directory.

## Adding your own skills

Drop a new file at `.claude/skills/<your-name>/SKILL.md` with frontmatter like:

```markdown
---
name: <your-name>
description: Use this skill when <specific trigger>. <What it does and why.>
---

# <your-name>

<Skill body — checklists, commands, refusal conditions.>
```

Good skills are:

- **Specific.** "Use when adding a server route" beats "Use when writing code."
- **Action-oriented.** Tell the agent what to run, what to read, what to refuse.
- **Project-aware.** Reference real file paths, scripts, env vars from this repo — not generic Nuxt advice.
- **Bounded.** Each skill does one thing. If you find a skill expanding into "and also...", split it.

Skills that ship with the boilerplate are intentionally short and prescriptive. They're not documentation for humans; they're instructions for the agent reading them at runtime.
