# REMI-019 · Extend the database seam: sort, range, batch, scoped queries

|                |                                                        |
| -------------- | ------------------------------------------------------ |
| **Type**       | feature (interface design)                             |
| **Priority**   | P1 — its own small reviewed change, before the adapter |
| **Size**       | A day                                                  |
| **Depends on** | REMI-018 (CareRelationship shapes the scoping design)  |
| **Blocked by** | —                                                      |
| **Sources**    | audit F-09, F-10, F-37                                 |

## Problem statement

The `Collection` interface offers find-by-id and find-by-exact-match only: no sorting, no ranges,
no "any of these values" — while existing screens already need meals sorted by date and signals
by recency. The pagination type is cursor-based with no defined sort order, which cannot be
implemented deterministically. The decided access model (every query scopes through a
CareRelationship) cannot be expressed through the seam at all, forcing tenancy checks into app
code per query — the classic origin of "practitioner A saw practitioner B's patient". And the
roster page's 1+3×N query pattern needs a batched read, or it becomes the first slow page.

## Required steps

1. Extend `Collection`: sort (with a defined order backing the cursor), range filters, in-list
   filters, and a batched multi-id/multi-parent read (F-37's shape).
2. Design the scoped-query capability: queries carry the acting practitioner's context and the
   seam (or database-level row security — decide and write it down) enforces the
   CareRelationship check, once, below app code (F-10).
3. Make cursor pagination deterministic (cursor = sort key + tiebreak id).
4. Tests for the contract using an in-memory reference implementation — the same tests the real
   adapter must later pass (contract-test pattern).
5. Update `packages/services/AGENTS.md` where it describes the seam's capabilities.

## Acceptance criteria

- [ ] The interface can express every query the existing eight `apps/web/lib/queries/*` modules
      actually perform (sorting and batching included) — verified by listing them.
- [ ] Access scoping has one enforced home below app code, with the decision documented.
- [ ] A reference in-memory implementation passes the contract tests.

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md, CONVENTIONS.md, packages/services/AGENTS.md, then
docs/audit-report.md findings F-09, F-10, F-37, then packages/services/src/db/client.ts and
types/index.ts, and all eight files in apps/web/lib/queries/ (they are the demand the interface
must meet).

Task: grow the database seam before any adapter exists.
1. Extend the Collection interface with: orderBy (field + direction, composable), range and
   in-list filter operators alongside exact match, and a batched read (fetch related records for
   many parent ids in one call — the roster page's 1+3×N pattern in
   apps/web/lib/queries/clients.ts is the driving case).
2. Make pagination deterministic: cursors encode the sort key plus id tiebreak; document the
   contract in the type's comment.
3. Add scoped queries: an AccessContext (acting practitioner) parameter so the CareRelationship
   check (from the REMI-018 models) is enforced by the seam, not per-screen. If you conclude
   database-level row security is the better home, design the seam to pass the context down and
   write the decision into packages/services/AGENTS.md — either way, app code must not hand-roll
   tenancy checks.
4. Write contract tests (Vitest) against a small in-memory implementation of the interface;
   structure them so a future real adapter can run the identical suite.
5. Keep the fixture-backed query modules compiling; do not wire them to the seam yet (that is
   the adapter ticket's job).
Run tests only; push a feature branch, open a PR showing, for each existing query module, which
new interface capability serves it.
```
