# REMI-040 · Rename the `person` session role to `patient`

|                |                                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------------------ |
| Status         | done                                                                                                   |
| **Type**       | refactor                                                                                               |
| **Priority**   | P2 — costs nothing today, costs more every week the patient surfaces grow                              |
| **Size**       | Half a day                                                                                             |
| **Depends on** | —                                                                                                      |
| **Blocked by** | —                                                                                                      |
| **Sources**    | Found in REMI-008's sweep · `.icm/docs/braindump/roadmap/features.md` · `apps/docs/app/business/roles` |

## Problem statement

The product's own vocabulary is now **patient** — the braindump says it, the direction of record says
it, the database schema and the admin console say it, and `apps/docs/app/business/roles` was rewritten
to say it in REMI-008. The `web` session role is still spelled `person`, from a pre-braindump framing
("person, not patient") that no source document supports any more.

Two vocabularies for one audience is how a spec ends up contradicting the code it describes. It is
cheap to fix now and gets dearer as the patient surfaces grow — REMI-018 through REMI-021 all land
there.

Known sites:

- `apps/web/lib/auth/session.ts` — the `Role` union, and the comment on the id it carries
- `apps/web/lib/auth/development-session.ts`, `apps/web/lib/actions/session.ts`
- `apps/web/components/auth/sign-in-form.tsx`, `apps/web/components/shell/user-menu.tsx`
- `apps/web/lib/queries/people.ts` and its callers
- `apps/demo` — `JournalViewer`, `MessageAuthor`, `person-messages.tsx`, the mock data
- The `persona:` label axis in `pipeline/_shared/github.md`, once it exists

## Required steps

1. Rename the role value, the type union and the file/identifier names in one pass. `patient`, not
   `Patient` — it is a session-role string, and the naming table in `CONVENTIONS.md` applies.
2. Sweep for the word in prose that describes the role rather than a human being; leave prose where
   "person" is simply the right English word.
3. Remove the note in `apps/docs/app/business/roles` that records the mismatch — it exists only
   until this lands.

## Open questions — flag these on pickup

- **Does anything persisted carry the string?** If a `person` value has been written to the database
  or a cookie by the time this is picked up, the rename needs a migration or a read-side fallback
  rather than a find-and-replace.

## Prompt

```text
Work in the remi-ai monorepo. Read `.icm/intake/REMI-040-person-to-patient-rename.md` for the full
context and `CONVENTIONS.md` for the naming rules.

The `web` session role is spelled `person`; every source of truth — the braindump, the direction of
record, the database schema, the admin console and `apps/docs/app/business/roles` — says **patient**.
Rename the role value, its type union and the identifiers and files around it, per the ticket's
required steps, and delete the note in the roles page that records the mismatch.

Check first whether any `person` string has been persisted to the database or a cookie; if it has,
say so and propose the migration rather than doing a find-and-replace. Do not run
build/lint/typecheck/format locally — CI owns them. Push a `claude/` branch, open a PR, `git mv` this
ticket into `.icm/intake/_done/` in the same PR, and raise the open question in the PR body.
```
