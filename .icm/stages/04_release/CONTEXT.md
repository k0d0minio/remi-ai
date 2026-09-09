# Stage 04 — Release (contract)

Invoked via `/pipeline release <slug>`. **One stage, one human decision.** By the time this runs,
Build has flipped the PR draft → open, CI has settled on that head, and the owner has smoke-tested
the change by hand and ticked **Ready to merge**. **That tick attests all manual and signed-in
testing, so this stage never re-asks for it** — there is no second gate, no Definition-of-Done
list to walk, no "please confirm the preview". Your job: confirm the factory agrees, run the review
passes, park anything off-ticket, put the docs and the changelog on the branch, squash-merge, and
announce.

Verify and Ship used to be two stages with two gates. They were one owner's work either way, so
they are one stage now, resting on the one tick that was always the real authorisation.

**What may stop the merge — nothing else may:**

1. A **blocking CI failure** (`RESULT: RED`, or a `PENDING` that will not settle).
2. A **security-critical finding introduced by this diff** — an exploitable defect.
3. A **deploy-breaking config finding** — a missing env var, a migration without a working `down`,
   a service adapter that isn't registered, config the deploy target doesn't carry.

Every other finding — style, structure, "should be refactored", anything not this run's — is
**parked as a stub in `.icm/intake/triage/`** and the merge proceeds. A ticked box plus a green
factory is the authorisation; do not manufacture reasons to hold it.

## Inputs (read only these)

- `.icm/_shared/stage-preamble.md` — run it **first**: resolve the run, or STOP.
- `.icm/runs/<slug>/run.md` — branch and PR pointers.
- `.icm/runs/<slug>/02_define/output/spec.md` — acceptance criteria, `complexity:` (which sets
  review effort), `apps:` and `touches:`.
- `.icm/runs/<slug>/03_build/output/notes.md` — what changed, known gaps, notes for Release.
- The branch diff (`git diff main...HEAD`) — what the reviews run against.
- `.icm/_shared/github.md` — gate read, merge mechanics, the no-subscriptions rule.
- `.icm/_shared/ci.md` — what green means.
- `.icm/_shared/knowledge-map.md` — routes to the canonical knowledge in `apps/docs`. Read only
  the page(s) the change touches, plus `business/initiatives` for the ship note's tie-in. Take
  those words from the page; don't invent them.

Context budget: the Inputs above are the budget (`.icm/CONTEXT.md` → Layers). Record overruns on
a one-line `Context budget:` note in `release.md`.

## Process

1. **Run the shared preamble**, then confirm Build finished: `notes.md` exists and the PR is open
   (not draft). An acceptance criterion Build flagged unmet → back to `/pipeline build <slug>`;
   don't release known-broken work.

2. **Read the gate.** **Ready to merge** must be `[x]`. Unticked → **STOP** and say so — this is
   the stage's one stop-and-wait, and you never tick it. The tick means the change was tested by
   hand, signed-in paths included; anything that had failed that testing would have gone back to
   Build instead. **Do not re-run the owner's testing and do not ask them to repeat it.**

3. **Establish CI green:**

   ```bash
   .icm/scripts/ci-status.sh <slug>
   ```

   `GREEN` → carry on. `RED` → fix on the branch if it's this run's, else back to Build. `PENDING`
   → re-run the call; not-yet-red is not green. Never run local checks (`.icm/_shared/ci.md`).

4. **Review passes.** Three, two of them conditional on what the diff touches:

   - **Code review — always.** Run `/code-review` at the effort the spec's complexity dictates:
     `trivial → low`, `standard → medium`, `complex → high`. If a CI review bot already posted
     comments, triage those instead of duplicating the pass.
   - **Production readiness — when the diff touches storage, auth, payments, or environment
     variables** (the spec's `touches:` plus the diff decide). This is how stop-class 3 is found:
     a migration has a working, tested `down`; a new env var is in `.icm/docs/ENV.md`, in the
     `env.ts` schema, in `turbo.json` `globalEnv`, **and** actually set in Vercel and Actions —
     three files and two dashboards, check all five; a new service adapter is registered exactly
     once, at process start, and fails loudly when its configuration is missing.
   - **Security review — when the diff touches auth, payments, PII, route policies, or anything
     under `app/api/`.** This is how stop-class 2 is found. A route handler that doesn't validate
     its body or check its caller is a finding, not a style note.

   A conditional pass that didn't trigger is recorded **with its reason** — never silently skipped.

5. **Triage every finding by the rule at the top.** Trivial and in-run → fix on this branch now.
   The two stop classes → **STOP** and report. Everything else → **one stub in
   `.icm/intake/triage/`**, named, and move on. **Never widen the PR.**

6. **Sync the docs, in this PR.** If the change alters documented reality — technical
   (`apps/docs/app/technical/**`: an app, a package, a route, an env var, a build or CI step, the
   architecture) or business (`business/**`: user-facing behaviour) — update the affected page(s)
   now, on the branch. Record "no docs impact" when that's true. Docs that lag the product are docs
   nobody trusts, and untrusted docs get re-derived from the code every time — exactly the cost the
   docs site exists to remove.

7. **Write the release notes, in this PR.** One plain sentence first — _what a user can now do, and
   why it matters_ — then the audience cut:

   - User-facing change → **both** notes.
   - Infra, security, performance, internal → **ship note only**, framed as reliability, trust or
     velocity; record "no end-user note".
   - Nothing worth announcing → record "no release notes" and skip the send in step 12.

   The two artifacts:

   - **Ship note** → `.icm/runs/<slug>/04_release/output/ship-note.md`, fixed template below, with a
     **hard cap of 60 words of body** (the links line sits outside the cap). Short is the contract,
     not a suggestion. The initiative tie-in is one line, taken verbatim from `business/initiatives`
     — if that page is still a stub, say so plainly rather than inventing a strategy. Sent as
     **plain text**, so markdown links render as literal characters. `Dig deeper` links are filled
     after the merge (step 11).

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
     internal terms, no slugs, no file paths. Keep the run's copy at `04_release/output/changelog.md`.

8. **Write `release.md`** (template below), commit the run files with the docs and the changelog,
   and push. Pushing `release.md` is what advances the PR to `stage:release` — the labels job
   derives it from the outputs on disk, so there is nothing to set by hand.

9. **Close out the run — the last commit on the branch:**

   ```bash
   .icm/scripts/close-out.sh <slug>
   ```

   `RESULT: CLOSED` → it has `git mv`'d `.icm/runs/<slug>/` into `.icm/runs/_done/`, and the
   intake epic into `.icm/intake/_done/` if this run was the last unshipped stub in it, and
   committed both on this branch. Push. The squash-merge in step 10 is what publishes the archive,
   so **nothing runs after the merge and nothing is ever pushed to `main`** — branch protection
   refuses a direct push, and an archive commit stranded on an unmerged branch leaves every
   shipped run sitting in `.icm/runs/` forever. `RESULT: STOP` → read the reason and stop; do not
   move the folder by hand.

   From here on the run's files are under `.icm/runs/_done/<slug>/`. The factory scripts read the
   archive as well as the live folder, so `ci-status.sh`, `send-ship-note.sh` and the labels job
   all keep working across the move.

10. **Re-establish green on the head you just pushed**, then merge. Re-run `ci-status.sh <slug>` —
    one settled verdict per push, and the last one is the verdict that authorises the merge. Re-read
    the gate (it must still be `[x]`), then squash-merge, attempted **once**. Never on RED, never on
    PENDING. The squash carries the run record, the docs and the changelog onto `main` — the
    changelog is live with this merge.

    **The stage ends at the merge.** Steps 11 and 12 are the only things that happen after it,
    and both exist because they need a URL that does not exist until the squash lands.

11. **Fill the links.** The merged-PR URL and the changelog entry's live URL into `ship-note.md`,
    and repoint the PR body's spec link to its `blob/main/` URL — the branch link dies with the
    squash-merge, and the record has to survive it.

12. **Send the ship note — no approval prompt.** Unless the audience cut in step 7 was "none":

    ```bash
    .icm/scripts/send-ship-note.sh <slug> --send
    ```

    Config from the environment (`RESEND_API_KEY`, `SHIP_NOTE_RECIPIENTS`, `SHIP_NOTE_FROM` /
    `EMAIL_FROM` — see `.icm/docs/ENV.md`). Running Release is the authorisation; the no-flag dry
    run exists for debugging. The script reads the note from the archive as readily as the live
    folder, so the close-out in step 9 costs it nothing.

13. **Report.** What merged (SHA), what was parked in triage (by stub name), what was announced,
    and what the close-out archived. The run folder is the durable record on `main` — it now lives
    under `.icm/runs/_done/<slug>/`, so `.icm/runs/` holds only what is still in flight.

## Outputs

`.icm/runs/<slug>/04_release/output/release.md` — written before the close-out, so it is authored
at the live path and reaches `main` under `.icm/runs/_done/<slug>/`:

```md
# Release: <slug>

- gate: Ready to merge ticked — merge authorised
- ci: GREEN on <sha> (ci-status.sh, after the last push)
- pr: <#21 / url> · merged: <yes — when / no>
- code-review: <effort used — findings fixed / parked>
- production-readiness: <run — findings summary | not required (no storage/auth/payments/env in diff)>
- security-review: <run — result | not required (no auth/payments/PII/routes in diff)>
- parked: <triage stub filename(s) | none>
- technical docs: <pages updated in this PR · or "no technical docs impact">
- business docs: <pages updated in this PR · or "no business docs impact">
- release notes: <both · ship-note-only · none>
- sent: <none | ship note sent <YYYY-MM-DD>>
- closed out: <RESULT: CLOSED — run archived; epic <name> archived / no epic finished by this run>

## Acceptance check (vs spec)

- [x] <criterion> — <met, per Build's notes / demonstrated where>
```

Plus `04_release/output/ship-note.md` (sent verbatim by step 12) and the live changelog entry at
`apps/docs/app/changelog/<date>-<slug>/page.mdx` (run copy at `04_release/output/changelog.md`).

## Verify (before declaring released)

- The gate was ticked **before** the merge and re-read after the last push; you never ticked it,
  and you never re-asked for the manual testing it attests.
- Merged **once**, on a settled `GREEN` from `ci-status.sh` established after your own last push —
  never assumed, never a bare check-runs read.
- The only holds applied were the three stop classes; every other finding is a named triage stub.
  Conditional passes that didn't run say why.
- Everything shipped in the **one PR** — code, docs, changelog, cleanup, **and the close-out**. No
  second branch or PR, and nothing pushed to `main` after the merge.
- `close-out.sh` ran **before** the merge and its commit is on the branch: `.icm/runs/<slug>/` is
  gone from the live folder and present under `.icm/runs/_done/<slug>/`.
- The changelog reads in the user's voice; the ship note fits the template and the 60-word cap;
  every claim traces to the spec or the build notes; any initiative named is real.
- The ship note, if sent, ends with working links to the merged PR and the live changelog entry,
  and the PR body's spec link was repointed to `blob/main/`.
- `release.md` reflects all of the above.
