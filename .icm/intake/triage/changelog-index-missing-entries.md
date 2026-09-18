# Stub: the changelog index page has stopped listing new entries

- feature-slug: changelog-index-missing-entries
- lane: chore
- priority: P3
- found-by: the `ciqual-import` Release docs pass, 2026-09-17
- sources: `apps/docs/app/changelog/page.mdx` § Entries · `apps/docs/app/changelog/_meta.ts`

## What this is

There are two lists of changelog entries and only one of them is being maintained. `_meta.ts` is
Nextra's navigation and every run has updated it. The `## Entries` list on the index page is
hand-written prose, and five entries are missing from it: `at-a-glance-page`, `copy-context`,
`link-writes`, `consultation-update` and `recipe-in-place`.

`ciqual-import` added its own line rather than widen the fix, so the gap is now five rather than
six — which is the shape of a list that will keep drifting until it stops being hand-written.

## Proposed change

Derive the index from `_meta.ts` and the entry files rather than maintaining a second copy — Nextra
can list a folder's pages — or drop the `## Entries` section entirely and let the sidebar be the
index. Either way there should be one list.

If it stays hand-written, backfill the five and say in `04_release/CONTEXT.md` that the entry goes
in both places, because "the changelog can never be more than one merge out of date" is a claim the
index page makes about itself and currently does not keep.

## Acceptance criteria (rough)

- [ ] There is one list of changelog entries, not two that can disagree
- [ ] Every shipped entry is reachable from `/changelog`
