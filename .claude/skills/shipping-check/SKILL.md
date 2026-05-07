---
name: shipping-check
description: Use this skill after implementing any feature, bug fix, or refactor in this Nuxt boilerplate, BEFORE staging or committing. Runs the quality gate that the lefthook pre-commit hook will run anyway, plus extra checks the hook doesn't catch (duplicates, dead code, untracked-but-needed files). Trigger phrases include "I'm done", "ready to commit", "looks good, ship it", "finished the feature", or any signal that work is complete and about to land.
---

# shipping-check

The boilerplate ships with lefthook + commitlint + eslint, but those only fire **inside `git commit`**. This skill runs the same gate **before** that, plus the wider checks (knip, jscpd, build) that the hook deliberately skips for speed.

## When to invoke

- User says "done", "ready", "commit this", "ship it", or any other "wrap-up" signal.
- You're about to call `Bash git commit` or `Bash git add` for a non-trivial change.
- Right after `Edit`/`Write` for a feature, before reporting completion.

## When NOT to invoke

- Pure documentation changes touching only `.md` files (the gate is fast anyway, but it's noise).
- Drafts the user explicitly marked WIP.
- Inside a `/safe-remove` flow — that skill has its own audit matrix.

## The gate

Run all six checks. Surface PASS/FAIL for each. Stop on the first FAIL and fix before continuing.

```bash
npm run lint          # 1. ESLint flat config + auto-fix on staged
npm run typecheck     # 2. vue-tsc via nuxi typecheck
npm run knip          # 3. unused files/exports/deps
npm run duplicates    # 4. jscpd copy-paste (must stay <2.5%)
npx nuxi prepare      # 5. regenerate .nuxt types if module list changed
```

Plus one human-judgment check:

6. **Boundary check** — touched files form a coherent change? No `.env`, no `node_modules` accidentally staged? `git status -s` shows only the files you intended?

## Pass criteria

| Check | Pass means |
|---|---|
| lint | `0 errors` (warnings allowed — boilerplate ships with 51 from demo pages) |
| typecheck | `0 errors`. If pre-existing baseline existed, count must not increase |
| knip | No NEW entries vs `git stash && npm run knip` baseline. Pre-existing dead code is fine, regressions are not |
| duplicates | `Found N clones` where N ≤ current commit's baseline. New clones are flagged for refactor or jscpd config update |
| nuxi prepare | Exits 0. Required because @nuxt/eslint's flat config in `.nuxt/eslint.config.mjs` regenerates from `nuxt.config.ts` |
| boundary | `git status -s` only lists files relevant to the stated task |

## Fail handling

**lint fails:** `npm run lint:fix` first. If errors remain after fix, they're real — solve them, don't downgrade to warnings without a comment explaining why.

**typecheck fails:** Read the error. Common causes in this codebase:
- New ref typed too loosely; explicit generic helps.
- Auto-imports not regenerated → run `npx nuxi prepare`.
- Cross-package type brand mismatch (e.g. `@internationalized/date` vs reka-ui's re-export) → cast at the boundary with a comment.
- Strict indexed access (`noUncheckedIndexedAccess`) — guard with `?? default` or hoist into a computed.

**knip fails (new unused export):** Either the export is genuinely dead → delete; or it's consumed dynamically → add to `knip.json` `ignoreDependencies` or `ignore` with a comment.

**duplicates fails:** Look at the clones. If they're real copy-paste, extract a block in `app/components/blocks/` or a composable in `app/composables/`. If they're cosmetic (e.g. similar Card+Header structure across settings pages), bump the threshold in `.jscpd.json` rather than refactor — but explain why in the commit.

**boundary fails:** Stash unrelated changes (`git stash --keep-index`), commit the focused change, then unstash.

## Output template

When invoking, report the gate result like this:

```
### Shipping check — <feature name>

| Check        | Status | Evidence                            |
|--------------|--------|-------------------------------------|
| lint         | PASS   | 0 errors, 51 warnings (unchanged)   |
| typecheck    | PASS   | 0 errors                            |
| knip         | PASS   | 2 unused types (pre-existing)       |
| duplicates   | PASS   | 0.95% (6 clones, unchanged)         |
| nuxi prepare | PASS   | Types regenerated                   |
| boundary     | PASS   | 7 files, all under app/pages/foo/   |

Ready to commit.
```

Don't claim PASS unless you ran the command and saw the output. "I think it's fine" is not PASS.

## What this skill explicitly does NOT do

- It does NOT run `npm run build`. Build is slow and the dev server already validated runtime. CI runs build on every PR (see `.github/workflows/ci.yml`).
- It does NOT run end-to-end tests. There are none yet in the boilerplate. Add a Playwright smoke test before the first production deploy.
- It does NOT commit. Surface the gate result, wait for the user to say "commit" or fix any failure.
- It does NOT replace `/safe-remove` for deletions. Run that first if your change removes anything.
