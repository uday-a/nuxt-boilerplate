---
name: db-migration
description: Use this skill when modifying `server/db/schema.ts` in this Nuxt boilerplate — adding/dropping a table, adding/dropping/renaming a column, changing a column type, adding/dropping an enum value, or changing a default/constraint. Enforces running `drizzle-kit generate` to emit the SQL migration into `server/db/migrations/` and verifying the result before commit. Trigger phrases include "add a column", "new table", "schema change", "drizzle", "migration", or any edit to `server/db/schema.ts`.
---

# db-migration

Drizzle's `schema.ts` is the source of truth for the TypeScript types BUT not for the database itself. Until you run `npx drizzle-kit generate`, the schema change exists only in code — production DBs don't know about it, and `npx drizzle-kit migrate` has nothing to apply.

This skill makes sure no schema edit ships without its migration.

## When to invoke

- Any `Edit` or `Write` against `server/db/schema.ts`.
- User says "add a column", "new table", "schema change", "migration".
- Diff includes `pgTable(`, `pgEnum(`, `serial(`, `varchar(`, `integer(`, `timestamp(`, etc. additions/changes.

## The workflow

After EVERY schema edit:

```bash
npx drizzle-kit generate
```

This:

1. Diffs `server/db/schema.ts` against `server/db/migrations/meta/_journal.json` (Drizzle's snapshot of the previous state).
2. Emits a new `NNNN_<adjective>_<noun>.sql` file under `server/db/migrations/`.
3. Updates `_journal.json` so the next generate diffs from this state.

**Both files must be committed together with the schema change.** Forgetting the migration means anyone who pulls + runs `drizzle-kit migrate` on a fresh DB will apply only the historical migrations, leaving the DB out of sync with the TS types.

## Naming hint

Drizzle picks a random name suffix (e.g. `0001_steady_jubilee.sql`). That's fine — the journal tracks order, not file name. Don't rename the generated file; let Drizzle own it.

## Reviewing the generated SQL

After `drizzle-kit generate`, **read the new SQL file** before committing. Things to confirm:

- The expected `ALTER TABLE` / `CREATE TABLE` / `ADD COLUMN` operations are present.
- No unexpected `DROP TABLE` or `DROP COLUMN` — Drizzle infers drops from schema absence, so a typo in `schema.ts` can produce a destructive migration.
- Enum changes use `ALTER TYPE ADD VALUE` (additive) — Postgres can't remove enum values; dropping an enum value requires a manual data migration.

## Common scenarios

### Adding a column

```ts
// schema.ts — add a column
export const users = pgTable('users', {
  // ...existing...
  newField: varchar('new_field', { length: 64 }),
})
```

Then:

```bash
npx drizzle-kit generate
```

Expect a migration like:

```sql
ALTER TABLE "users" ADD COLUMN "new_field" varchar(64);
```

### Adding a NOT NULL column to an existing table

Two-step migration is safer than one. Drizzle emits a single ALTER which will fail if rows exist:

```ts
newField: varchar('new_field', { length: 64 }).notNull(),
```

Generates:

```sql
ALTER TABLE "users" ADD COLUMN "new_field" varchar(64) NOT NULL;
-- fails if "users" has rows because each existing row has no value
```

Manual edit needed: either add a `DEFAULT` for the migration, or split into add-nullable / backfill / set-not-null. Document the choice in the SQL file with a comment.

### Renaming a column

Drizzle can't infer a rename — it'll emit `DROP` + `ADD`, which loses data. For renames, manually edit the generated SQL to use `ALTER TABLE ... RENAME COLUMN`, and delete the destructive lines.

### Adding an enum value

```ts
export const userRole = pgEnum('user_role', ['user', 'admin', 'editor', 'viewer'])
```

Generates:

```sql
ALTER TYPE "public"."user_role" ADD VALUE 'viewer';
```

Note: `ADD VALUE` can't run inside a transaction in older Postgres. Drizzle handles this — but if you wrap migrations in your own transaction wrapper, this enum migration will fail. Run it solo.

### Removing an enum value

Postgres has no `DROP VALUE`. Path:

1. Migrate data: `UPDATE users SET role = 'user' WHERE role = 'viewer'`
2. Create new enum without the value, swap tables to use it, drop old enum.

Don't try to express this in Drizzle's diff. Write the SQL by hand under `server/db/migrations/`, increment the journal manually if needed, and review carefully.

## Applying migrations

After generating, optionally apply against a local DB:

```bash
npx drizzle-kit migrate
```

This uses `DATABASE_URL` from the env. If `DATABASE_URL` isn't set, drizzle-kit refuses — that's correct; you don't want to "test" a migration without knowing where.

For local dev:

- Either run a Postgres locally and set `DATABASE_URL` to it.
- Or apply to your prod DB via your deploy platform's run-once hook — most platforms (Fly, Render, Vercel + Neon, etc.) have a "release command" slot.

## Verification

```bash
# 1. server/db/schema.ts was edited but no new migration file?
{ git diff --name-only HEAD server/db/schema.ts | grep -q schema.ts; } && \
  { git status server/db/migrations | grep -q "new file"; } || \
  echo "Schema changed but no new migration generated. Run: npx drizzle-kit generate"

# 2. Migration file syntax check (only works if you have psql)
psql --no-psqlrc -c "$(cat server/db/migrations/<latest>.sql)" --dry-run 2>&1 | head

# 3. Journal updated?
git diff --name-only HEAD server/db/migrations/meta/_journal.json
# should be in the diff alongside the new .sql
```

## Refusal

If a diff modifies `server/db/schema.ts` but does NOT add a corresponding file under `server/db/migrations/*.sql`, stop and run `npx drizzle-kit generate`. Never let a schema edit ship without the migration — the next deploy will silently diverge.

If a generated migration contains `DROP TABLE`, `DROP COLUMN`, or `DROP TYPE` that wasn't explicitly requested, stop and audit. Drizzle inferred a destructive op from a schema typo or accidental deletion.
