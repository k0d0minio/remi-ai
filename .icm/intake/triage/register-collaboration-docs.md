# Stub: `.icm/docs/collaboration/` is invisible to the precedence order

- feature-slug: register-collaboration-docs
- lane: chore
- priority: P2
- found-by: the session that cut the patient-record and patient-surface epics, 2026-09-01
- sources: commit b9c8dc6 ("important docs") · `.icm/docs/README.md` § Precedence

## What this is

Commit b9c8dc6 added `.icm/docs/collaboration/` — Morgane's v2 structure brainstorm (the document
two live epics are now cut from), the pitch deck, and the Fagron meeting playbook — but
`.icm/docs/README.md`, whose precedence table is "the whole point of the folder", does not mention
it. A future session reading the README as the map will not find the newest statement of what
Morgane wants, and cannot know whether it outranks the braindump where they disagree.

The fix is documentation only: list `collaboration/` in the README's contents and give the
brainstorm a row in the precedence table. Where it ranks is the owner's call to confirm —
plausibly with the braindump on *what REMI is* (it is her material, newer and more precise on the
V2 structure), still below `new-development-direction.docx` on sequencing — but propose, don't
decide.

## Prompt

In the remi-ai repo, read `.icm/docs/README.md` and
`.icm/intake/triage/register-collaboration-docs.md`, then register `.icm/docs/collaboration/` in
the README: a contents entry describing the three files, and a precedence-table row for
`remi-v2-structure-brainstorm.docx` with a proposed rank stated as a proposal for the owner to
confirm in the PR. Documentation-only chore — run it as `/pipeline chore`. Move this stub to
`.icm/intake/triage/_done/` in the same PR.
