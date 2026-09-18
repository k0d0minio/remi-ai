# Stub: label-map lookups assume the database row is in-union

- feature-slug: label-map-lookups-assume-valid-enums
- priority: P3
- size: S
- sources: `/code-review` on `secondary-sections` (#100) ·
  `apps/admin/components/patients/vocabulary.ts` and every consumer of it

## What this is

The console reads enum-ish columns — `locale`, `status`, `sex`, `likes_cooking`,
`consent_channel`, `category` — and indexes a `Record<…, string>` in `vocabulary.ts` to render
them. TypeScript says the value is in-union because the model type says so; nothing at the read
boundary checks that the row actually is. A value outside the union yields `undefined`, and a
consumer that then calls a string method on it throws during render instead of showing « — ».

This is **not** specific to the profile read summary — the roster, the status banner, both
recommendation forms and the profile form all index the same maps the same way, and have since
they were written. `secondary-sections` added one more consumer, which is how it surfaced.

## Worth knowing

- The values only go out of union through a hand-written SQL update, a migration that widens a
  column without widening the constant, or a restore from an older schema. All three are real but
  none is routine.
- Two candidate fixes, and they are different sizes: validate at the read boundary in
  `packages/services/src/db/` (zod on the row, one place, catches everything), or make the lookups
  total in `vocabulary.ts` (a helper returning the label or « — », app-local, catches only what the
  console renders). The first is the honest fix.
- Whichever is chosen, it is one change across all consumers — not per-component patches, which is
  exactly the drift `CONVENTIONS.md` § leanness warns about.

## Open questions — flag these on pickup

- Is a row out of union worth a runtime guard at all, or is the schema constraint plus review the
  intended defence? If the latter, this stub closes as a decision rather than a fix.

## Prompt

Run `/pipeline chore "label-map lookups assume the database row is in-union"` in the remi-ai repo.
Read this stub and `apps/admin/components/patients/vocabulary.ts` first. Scope: pick one of the two
fixes named in the stub and apply it once, across every consumer — never per-component. No
behaviour change for in-union values. Raise the open question rather than answering it.
