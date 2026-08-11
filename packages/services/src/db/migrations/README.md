# Migrations

One forward-only chain for the whole repo, applied in filename order and recorded in
`schema_migrations`. REMI-001 started it with the auth tables; REMI-022's tooling picks up this
same directory rather than opening a second one — two chains against one database is how a
migration ends up applied in staging and not in production.

## Rules

- **Numbered, immutable, forward-only.** `NNNN_short-name.sql`, four digits. Once a file has been
  applied anywhere it is never edited — a correction is the next number.
- **It must replay from empty.** The chain is the definition of the schema, so `db:migrate` against
  a fresh database has to produce the current one. No `IF NOT EXISTS`: a statement that quietly
  no-ops hides a chain that has drifted.
- **No data in a schema migration.** Operators are created by `auth:create-operator`, which takes a
  password on the command line and never leaves one in the repo.

## Running it

```bash
# DATABASE_URL must be the Neon pooled connection string — see docs/ENV.md.
pnpm --filter @remi/services db:migrate
```

The runner creates `schema_migrations` on first use, applies every file not yet recorded there, and
prints what it applied. Running it twice is a no-op.
