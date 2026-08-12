# REMI-021 · Promote the admin console's entities into the shared model layer

|                |                                                                                         |
| -------------- | --------------------------------------------------------------------------------------- |
| Status         | ready                                                                                   |
| **Type**       | chore / feature                                                                         |
| **Priority**   | P2 — becomes P1 when the first real admin feature (pilot enrolment) is scoped           |
| **Size**       | A day                                                                                   |
| **Depends on** | REMI-018 (base entity, audit trail conventions)                                         |
| **Blocked by** | REQ-11 (if a real pilot-application list exists, model against it, not invented shapes) |
| **Sources**    | audit F-15; info-gathering REQ-11                                                       |

## Problem statement

Five entity types the quarter's own objective depends on — `PilotApplication`, `PilotCohort`,
`SupportTicket`, `FeatureFlag`, `AuditEntry` — exist only as fixture types inside the admin app,
not in `packages/services/src/db/models/` where every other entity lives. The first real admin
feature (tracking actual pilot applications) either persists them app-locally (forking the
architecture) or starts with an unplanned model migration.

## Required steps

1. Ask for REQ-11's answer: if a real applications list exists (spreadsheet, inbox), derive the
   `PilotApplication` fields from it.
2. Move the five entity types into the shared model layer, conformed to the REMI-018 base entity
   (ids, timestamps, actor attribution, soft delete). `AuditEntry` merges with REMI-018's audit
   entity rather than duplicating it.
3. Update `apps/admin`'s fixtures and components to import the shared types.
4. Tests for any promoted logic.

## Acceptance criteria

- [ ] No entity type is defined inside `apps/admin/lib/fixtures.ts` — the app imports models.
- [ ] One audit-entry entity exists in the whole repo.
- [ ] Admin app compiles and renders identically against the shared types.

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md, CONVENTIONS.md, packages/services/AGENTS.md, then
.icm/docs/audit-report.md finding F-15, then apps/admin/lib/fixtures.ts (the app-local entity
definitions around lines 781, 799, 1121, 1407, 1535).

Task: give the admin domain its real home.
1. Move PilotApplication, PilotCohort, SupportTicket, and FeatureFlag from apps/admin/lib/
   fixtures.ts into packages/services/src/db/models/, one file each, conformed to the repo's
   base-entity conventions (see the existing models and the REMI-018 additions: actor
   attribution, soft delete).
2. Do NOT create a second audit entity: if an AuditEntry model already exists from the REMI-018
   modelling pass, conform admin's fixture type to it; otherwise promote admin's version into the
   shared layer as the single audit entity.
3. Update apps/admin's fixtures, components and lib code to import from @remi/services; the
   dependency arrow stays app → package.
4. If the session owner can supply the real pilot-application list's fields (REQ-11 in
   .icm/docs/info-gathering.md), shape PilotApplication from it and note the source in the PR;
   otherwise keep the fixture-derived shape and flag it as unvalidated.
5. Add model tests consistent with the existing model test style.
Run tests only; push a feature branch and open a PR.
```
