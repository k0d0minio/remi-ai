# Stub: protocol_templates — a name's uniqueness is a service rule, not a constraint

- lane: chore
- found-by: the `reuse-and-duplicate` Release code review · 2026-09-18
- size: S

## Problem

`saveProtocolTemplate` treats a template name as unique per operator per kind: it looks the name up
and overwrites the set rather than inserting a second one. Nothing in the database enforces that.
`protocol_templates` has no unique index on `(operator_id, kind, name)`, so two saves that race
past the service's lookup both insert, and the operator ends up with two sets under one name — the
list then shows both and « Insérer » becomes a guess.

The practical path to it was closed in the run that found it (the save button now guards against a
second click while the first is in flight), so this is the belt to that braces: the invariant is
stated in the schema's own comment and in the service's docstring, and an invariant only comments
enforce is one that drifts.

Not folded into `reuse-and-duplicate` because adding the index means another migration, and that
run's migration had **already been applied to the live database by its preview build** — editing it
in place would have collided exactly as it did once already
(`runs/_done/reuse-and-duplicate/03_build/output/notes.md`). A new migration is the honest shape,
and it is not that run's ticket.

## Proposed change

Add a unique index on `(operator_id, kind, name)` to `protocol_templates` in its own migration,
and decide what the service does when the database refuses — most likely surface the existing
"another template already uses that name" `invalid_input`, so the behaviour is unchanged and only
the guarantee is stronger.

Check for duplicates before adding the index: the table is new and lightly used, but a unique index
fails to create if any exist.

## Acceptance criteria (rough)

- [ ] A unique index on `(operator_id, kind, name)` exists, added by its own migration generated
      after the newest one on `main`
- [ ] A save that loses a race returns the same `invalid_input` a name clash already returns, not
      an unhandled driver error
- [ ] The schema comment on `name` and the service docstring say the constraint enforces it

## Prompt

Run `/pipeline chore protocol-template-name-unique-index` in the remi-ai repo. The lane pre-seeds
from this stub and moves it to `triage/_done/` when it opens the PR. Scope is the Proposed change
and nothing wider. Generate the migration fresh — never renumber or edit an existing one
(`CONVENTIONS.md` § "Regenerate a migration, never renumber it").
