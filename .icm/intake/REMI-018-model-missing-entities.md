# REMI-018 · Model the missing entities

|                |                                                                                                                                                                                    |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Type**       | feature (design-heavy)                                                                                                                                                             |
| **Priority**   | P1 — Blocker-severity underneath: must precede the first adapter and the first real record                                                                                         |
| **Size**       | A few days (the decisions attached are the real work)                                                                                                                              |
| **Depends on** | — (informs REMI-019/020/022)                                                                                                                                                       |
| **Blocked by** | Owner decision D-v1-2 / REQ-30 (patient- vs practitioner-facing) shapes several entities; proceed with the practitioner↔person model regardless — it is decided in the repo's docs |
| **Sources**    | audit F-14 (Blocker), F-16, F-17, F-18, checklist item 7; v1-report §5.1, §8, §9.2                                                                                                 |

## Problem statement

The access-control entity the docs call "decided" — a practitioner↔person **CareRelationship**
with start/end dates, where the end date ends access — does not exist; what exists is a bare
`practitionerId` on Person, with no dates and no history. There are no entities at all for
sessions/auth, consent capture, the audit trail, or AI-generation records — the structures GDPR
and the product's own safety rules require _before_ the first real record, not after. Several
relationships are stored twice or as prose and will drift the day writes exist, and several
primitives (free-text quantities, `Date` for calendar days, counter-only completion) will calcify.
The v1 report supplies the concrete real-world input this modelling pass was waiting for: 13
tables' worth of proven shapes (§5.1) and 12 defects to fix by construction (§8).

## Required steps

1. **CareRelationship** (F-14): practitioner↔person with start/end dates; adjust `Person` to stop
   carrying a bare `practitionerId`. Every future query scopes through it.
2. **Consent record** (F-16 + v1 §8.10): explicit consent as a database entity — kind (health-data
   processing, terms), timestamp, version of the text consented to, captured _before_ account
   data. v1's localStorage consent flow is the anti-pattern.
3. **Audit-trail entity** (F-16 + v1 §8.5): who did what to whose record, when — covering
   destructive admin operations and document-validation actions.
4. **AI-generation record** (F-16 + v1 §5.2): every AI output persisted with its input context —
   v1's `guardian_validation_result` seven-dimension schema is the concrete shape to carry.
5. **Session/token entity** for the decided magic-link auth shape.
6. **Fix drift-prone relationships** (F-17): one owning side each (plan↔step, practitioner↔frame);
   make `Recipe.honours` a typed reference, not prose; type the ambiguous signal reference.
7. **Fix calcifying primitives** (F-18): structured `Ingredient.quantity`, structured
   `shoppingDay`, calendar-day type instead of `Date` for day-precision concepts, per-day
   completion instead of a counter, a language field on Recipe.
8. **Incorporate v1's proven entities** where the audiences reconcile (documents-with-history
   replacing v1's destructive single-document model, questionnaires with computed outcomes,
   weekly feedback with a real FK, skipped meals, supplement calendar, week plans with a unique
   (person, week) key and a real job/run entity instead of empty-row locks — v1 §8.4–8.7).
9. Add base-entity support for actor attribution and soft deletion (F-16), and model the
   genotype field's special-category status explicitly (F-34 note).
10. Everything as TypeScript models in `packages/services/src/db/models/` with tests (REMI-008),
    reviewed as its own PR before any adapter work.

## Acceptance criteria

- [ ] CareRelationship exists; no bare `practitionerId` remains on Person.
- [ ] Consent, audit, AI-generation, and session entities exist with tests.
- [ ] No relationship is stored on both sides; no prose-typed references remain.
- [ ] The F-18 primitives are restructured; existing fixture data updated to match.
- [ ] Each v1 §8 data-model defect has a written answer in the models (comment or doc).

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md, CONVENTIONS.md, packages/services/AGENTS.md, then:
.icm/docs/audit-report.md findings F-14, F-16, F-17, F-18 (and the F-34 genotype note);
.icm/docs/v1-report.md §5.1 (the proven schema), §8 (defects that must not survive), §9.2;
apps/docs/app/technical/decisions/page.mdx (the decided tenancy model);
every file in packages/services/src/db/models/.

Task: the modelling pass that must precede the first database adapter. Deliver revised/new entity
models in packages/services/src/db/models/ with colocated Vitest tests:
1. CareRelationship (practitioner↔person, start/end dates, end date ends access); remove
   Person.practitionerId in favour of it and update every fixture/query that used it.
2. ConsentRecord (kind, text version, timestamp, subject), AuditEntry (actor, action, target,
   timestamp, detail), AiGeneration (input context, output, model id, timestamp, and a
   validation-result shape carrying v1's seven Guardian dimensions), and a Session entity for
   magic-link auth.
3. Fix F-17: single owning side for plan↔step and practitioner↔frame; Recipe.honours becomes a
   typed reference to Recommendation ids; ProgressSignal's loose id gets a typed discriminator.
4. Fix F-18: structured quantity {amount, unit} with a parser kept for legacy strings; structured
   shopping day; a CalendarDate (YYYY-MM-DD) type for day-precision fields; Step per-day
   completion records; Recipe.language.
5. Fold in v1's entities where they fit the practitioner model: MedicalDocument (with history —
   uploads never destroy prior rows), Questionnaire (responses + computed scores/profile),
   WeeklyFeedback (real FK to the week plan), SkippedMeal, SupplementCalendar, WeekPlan (unique
   person+week, no empty-row-as-lock — add a GenerationRun job entity instead).
6. Extend the base entity with createdBy/deletedAt; mark genotype data as special-category in the
   model's doc comment.
Keep this a models-only PR: no adapter, no query changes beyond compilation, fixtures updated to
the new shapes. Update apps' fixture data minimally to compile. Run tests only; push a feature
branch, open a PR that maps each audit finding and each v1 §8 defect to how the models answer it.
```
