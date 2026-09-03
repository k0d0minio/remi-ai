# Chore: register-collaboration-docs

- invariant: no product behaviour, no code and no build output changes — only
  `.icm/docs/README.md` gains a contents section and one precedence row, and one triage stub
  changes folder. No file in `.icm/docs/collaboration/` is edited.
- change: `.icm/docs/README.md`: a `### collaboration/` contents section describing all three
  documents added in b9c8dc6, and a precedence-table row for
  `remi-v2-structure-brainstorm.docx` at a **proposed** rank `3?` (above the braindump on
  structure, below 1–2 on sequencing), with the paragraph above the table stating that the rank
  is a proposal for Morgane or Arnaud to confirm. Rows 3–8 renumber to 4–9. The pitch deck and
  the meeting playbook get no precedence row — they are outward-facing preparation, not sources
  of direction — and the section says so.
- change: `.icm/intake/triage/register-collaboration-docs.md` → `triage/_done/`, per the intake
  rule that the PR implementing a stub retires it.
- rollback: `git revert` the two commits. Nothing depends on the row: the `3?` rank is advisory
  until confirmed, and no code reads this README.

## Open question for the owner

**Confirm the rank.** `3?` is a proposal, not a decision. Accepting it means renaming `3?` to
`3`; rejecting it means moving the row and renumbering. The case for 3: the brainstorm is
Morgane's own material, is newer than the braindump (1 Sept vs 18 Aug 2026), is far more precise
about how the V2 is structured, and two live epics (`patient-record`, `patient-surface`) are
already cut from it. The case against: the braindump is 40 documents of vision and the brainstorm
is one document about structure, so ranking it higher could over-read a working note.

Context budget: `.icm/docs/README.md`, the triage stub, `.icm/intake/README.md`, the three
`collaboration/` documents, `CONVENTIONS.md` § Working languages + § Git, `_shared/github.md`.
