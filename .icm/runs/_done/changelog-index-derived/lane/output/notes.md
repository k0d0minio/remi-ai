# Chore: changelog-index-derived

- invariant: every changelog page that exists is listed on `/changelog`; nothing about the
  entries themselves, their URLs or the sidebar changes. Only where the index's list comes from
  differs — the folder, not a hand-written copy beside it.
- change: `apps/docs/app/changelog/entry-list.tsx` (new): a server component that reads the
  changelog page map (`getPageMap('/changelog')` → `normalizePages`), drops the index itself,
  sorts by the `<YYYY-MM-DD>-` prefix in each entry's directory name and renders the list with
  the theme's own MDX components, so it typesets exactly as the markdown list did.
  `apps/docs/app/changelog/page.mdx`: the hand-written `## Entries` list is replaced by
  `<EntryList />`. Seven entries were missing from it — `at-a-glance-page`, `copy-context`,
  `link-writes`, `consultation-update`, `recipe-in-place`, `bulk-entry` and `secondary-sections`
  (the stub counted five; two more shipped after it was parked) — and all seven are now listed,
  because the folder is the list.
  `.icm/_shared/project-rules.md` § Announcing and `.icm/_shared/knowledge-map.md`: the
  instruction that produced the second list now says `_meta.ts` and nowhere else.
- rollback: revert the PR. Nothing is generated, migrated or cached — the entry pages and
  `_meta.ts` are untouched, so the previous hand-written list comes back with the revert.

## What the list no longer carries

The old `## Entries` list gave each entry a one-sentence blurb, written by hand and stored
nowhere else — the entry pages carry no frontmatter and no description. A derived list cannot
reproduce them, so the list is now title and date, and the title (the line `_meta.ts` already
holds, in the user's voice) is the summary. Restoring the blurbs would mean giving every entry
page a `description` frontmatter and asking Release to write one; that is a wider change than
this stub, and it is not needed for either acceptance criterion.
