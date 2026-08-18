# Stage 06 — Ship (contract)

Invoked via `/pipeline ship <slug>`. Your job: take the verified change from "reviewable" to
"announced" — docs and changelog in the PR, the **checkbox-gated squash-merge**, then the ship note.
Running this stage _is_ the authorisation for the send.

One PR, one branch: code, docs, changelog and any last cleanup all land in this run's PR. Never open
a second one (`_shared/github.md`).

## Inputs (read only these)

- `pipeline/_shared/stage-preamble.md` — run it **first**: resolve the run, or STOP.
- `pipeline/runs/<slug>/run.md` — branch and PR pointers.
- `pipeline/runs/<slug>/05_verify/output/verify.md` — the quality-gate record.
- `pipeline/runs/<slug>/03_define/output/spec.md` — acceptance criteria and problem; they ground the
  notes.
- `pipeline/_shared/github.md` — gate read, merge, review-comment calls.
- `pipeline/_shared/knowledge-map.md` — routes to the canonical knowledge in `apps/docs`. Read only
  the page(s) the change touches, plus `business/initiatives` for the ship note's tie-in. Take those
  words from the page; don't invent them.

Context budget: the Inputs above are the budget (`pipeline/CONTEXT.md` → Layers). Record overruns on
a one-line `Context budget:` note in `release.md`.

## Process

1. **Run the shared preamble**, then **confirm Verify passed**: `verify.md` must exist with no
   unresolved blocking finding. Missing or red → send back to `/pipeline verify <slug>`. Ship does
   not re-run the reviews and does not ship past a failed gate.

2. **Sync the docs, in this PR.** If the change alters documented reality — technical
   (`apps/docs/app/technical/**`: an app, a package, a route, an env var, a build or CI step, the
   architecture) or business (`business/**`: user-facing behaviour) — update the affected page(s)
   **now, on the branch**. Record "no docs impact" when that's true. Docs that lag the product are
   docs nobody trusts, and untrusted docs get re-derived from the code every time — which is exactly
   the cost the docs site exists to remove.

3. **Write the release notes, in this PR.** One plain sentence first — _what a user can now do, and
   why it matters_ — then the audience cut:
   - User-facing change → **both** notes.
   - Infra, security, performance, internal → **ship note only**, framed as reliability, trust or
     velocity; record "no end-user note".
   - Nothing worth announcing → record "no release notes" and skip the send in step 6.

   The two artifacts:

   - **Ship note** → `pipeline/runs/<slug>/06_ship/output/ship-note.md`, fixed template below, with a
     **hard cap of 60 words of body** (the links line sits outside the cap). Short is the contract,
     not a suggestion. The initiative tie-in is one line, taken verbatim from
     `business/initiatives` — if that page is still a stub, say so plainly rather than inventing a
     strategy. Sent as **plain text**, so markdown links render as literal characters. `Dig deeper`
     links are filled after the merge (step 5).

     ```md
     # <Outcome in one line — what's now possible>

     **Who it's for:** <who this affects>
     **What shipped:** <one sentence, plain English — no jargon>
     **Why it matters:** <the outcome, tied to an initiative — one line>

     <optional: one sentence of evidence — a metric or an acceptance criterion>

     Dig deeper: <merged-PR URL> · <changelog entry URL>
     ```

   - **Changelog** → one entry on the branch at
     `apps/docs/app/changelog/<YYYY-MM-DD>-<slug>/page.mdx` (date = merge date). Committing it _is_
     the publish. User voice: sentence case, describes what changed for the person reading, no
     internal terms, no slugs, no file paths. Keep the run's copy at `06_ship/output/changelog.md`.

4. **Merge on the ticked box — never on red checks.** Push everything, then triage any open review
   comments; trivial fixes land on the branch now. Read the **Ready to merge** checkbox:
   - Unticked → **STOP** and ask for the tick. Never tick it yourself.
   - Ticked → check the PR's check runs **once**. Any failure → **STOP, do not attempt the merge**:
     read the failing logs, fix, push, and re-check when CI finishes. Green → squash-merge per
     `_shared/github.md`, attempted **once**.

   The squash carries the run folder, the docs and the changelog onto `main` — the changelog is live
   with this merge.

5. **Fill the links** immediately after the merge: the merged-PR URL and the changelog entry's live
   URL into `ship-note.md`, and repoint the PR body's spec link to its `blob/main/` URL — the branch
   link dies with the squash-merge, and the record has to survive it.

6. **Send the ship note — no approval prompt.** Unless the audience cut was "none":

   ```bash
   pipeline/scripts/send-ship-note.sh <slug> --send
   ```

   Config from the environment (`RESEND_API_KEY`, `SHIP_NOTE_RECIPIENTS`, `SHIP_NOTE_FROM` /
   `EMAIL_FROM` — see `.icm/docs/ENV.md`). Running Ship is the authorisation; the no-flag dry run exists
   for debugging.

7. **Close out.** Write `release.md` and tell the user the run is complete. The run folder stays on
   `main` as the durable record.

## Outputs

`pipeline/runs/<slug>/06_ship/output/release.md`:

```md
# Ship: <slug>

- pr: <#21 / url> · merged: <yes — when / no>
- CI: <green / what failed and how it was fixed>
- technical docs: <pages updated in this PR · or "no technical docs impact">
- business docs: <pages updated in this PR · or "no business docs impact">
- release notes: <both · ship-note-only · none>
- sent: <none | ship note sent <YYYY-MM-DD>>

## Acceptance check (vs spec)

- [x] <criterion> — verified in Verify / demonstrated where
```

Plus `06_ship/output/ship-note.md` (sent verbatim by step 6) and the live changelog entry at
`apps/docs/app/changelog/<date>-<slug>/page.mdx` (run copy at `06_ship/output/changelog.md`).

## Verify (before declaring shipped)

- Verify's gate had passed before anything here ran; no blocking finding was outstanding.
- Everything shipped in the **one PR** — docs, changelog, cleanup included. No second branch or PR.
- Affected docs pages were updated in this PR, or "no impact" is recorded.
- The changelog entry reads in the user's voice; the ship note fits the template and the 60-word
  cap; every claim traces to the spec or the verify record; any initiative named is real.
- The merge happened only on a ticked **Ready to merge** box (which you did not tick) **and** green
  check runs — Ship never merged on red — attempted once.
- The ship note, if sent, ends with working links to the merged PR and the live changelog entry, and
  the PR body's spec link was repointed to `blob/main/`.
- `release.md` reflects all of the above.
