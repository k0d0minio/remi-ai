# Stage 05 — Verify (contract)

Invoked via `/pipeline verify <slug>`. Your job is **one thing**: carry the quality load between
"code complete" and "authorised to ship" — the readiness, review and security passes plus the
Definition-of-Done smoke — and record the evidence. No new features here; fixes surfaced by the
reviews land on this same branch, in the one feature PR.

## Inputs (read only these)

- `pipeline/_shared/stage-preamble.md` — run it **first**: resolve the run, or STOP.
- `pipeline/runs/<slug>/run.md` — branch and PR pointers.
- `pipeline/runs/<slug>/03_define/output/spec.md` — acceptance criteria, `complexity:` (which sets
  review effort), `apps:` and `touches:`.
- `pipeline/runs/<slug>/04_build/output/notes.md` — what changed, known gaps.
- The branch diff (`git diff main...HEAD`) — what the reviews run against.
- `pipeline/_shared/github.md` — check runs, review comments.

Context budget: the Inputs above are the budget (`pipeline/CONTEXT.md` → Layers). Record overruns on
a one-line `Context budget:` note in `verify.md`.

## Process

1. **Run the shared preamble**, then confirm Build finished: `notes.md` exists and the PR is open
   (not draft). An unmet acceptance criterion Build already flagged → send back to
   `/pipeline build <slug>` now. Don't review known-broken work.

2. **Production readiness — conditional, but non-negotiable when it triggers.** If the diff touches
   **storage, auth, payments, or environment variables** (the spec's `touches:` plus the diff
   decide), run the readiness pass:
   - A migration has a working, tested `down`.
   - A new env var is in `docs/ENV.md`, in the `env.ts` schema, in `turbo.json` `globalEnv`, **and**
     actually set in Vercel and Actions. Three files and two dashboards; check all five.
   - A new service adapter is registered exactly once, at process start, and fails loudly when its
     configuration is missing.

3. **Code review — always.** Run `/code-review` at the effort the spec's complexity dictates:
   `trivial → low`, `standard → medium`, `complex → high`. If a CI code-review bot posted comments,
   triage those instead of duplicating the pass.

4. **Security review — conditional, but non-negotiable when it triggers.** If the diff touches
   **auth, payments, PII, route policies, or anything under `app/api/`**, run `/security-review` on
   it. A route handler that doesn't validate its body or check its caller is a finding, not a style
   note.

5. **Definition-of-Done smoke on the Vercel preview.** The Definition of Done is this: _every
   acceptance criterion in `spec.md` is **demonstrated on the preview**, not self-certified, and the
   checks below pass for anything the diff could touch._ There is no automated test suite yet, so
   this human pass carries the quality load.

   Split it **explicitly between agent and operator** — the agent has no preview credentials and no
   inbox, so never claim a check it could not perform:
   - **Agent-run:** everything reachable without signing in — the preview loads, public and
     unauthenticated criteria demonstrated, and the code path behind each criterion traced in the
     diff.
   - **Operator-demonstrated (ask, then wait):** every signed-in acceptance criterion on the
     preview; **auth** — the affected users still sign in and reach their landing surface;
     **payments** — if touched, a test transaction completes; **email and notifications** — anything
     expected actually arrives. Email **fails silently by design** in every provider: verify it,
     never assume it. Record the operator's reported results in `verify.md`, attributed. The gate
     must not pass on unverified lines.

   > TODO (deliberate, not blocking): stand up a Playwright smoke suite — sign-in, each app's
   > landing route, one write path — and let CI run this list. Until then the signed-in half is the
   > operator's, by design. Tracked in `pipeline/_design/automation-offload.md` §4.

6. **Fix on-branch.** Trivial findings → fix, commit, push (CI re-verifies; never run local checks).
   Judgement calls → surface them in `verify.md`. Findings that reopen scope → back to Define.

7. **Write `verify.md`**, commit, push — pushing it advances the PR to `stage:verify` automatically.

8. **Gate — HARD, in conversation.** Stop. Ship must not start until the owner confirms the quality
   gate passed. Say what was run, what was found, what was fixed, and that ticking **Ready to merge**
   on the PR plus `/pipeline ship <slug>` is the path onward.

## Outputs

`pipeline/runs/<slug>/05_verify/output/verify.md`:

```md
# Verify: <slug>

- production-readiness: <run — findings summary | not required (no storage/auth/payments/env in diff)>
- code-review: <effort used · findings fixed/accepted | triaged CI review>
- security-review: <run — result | not required (no auth/payments/PII/routes in diff)>
- automated tests: none yet — manual DoD smoke performed instead

## DoD smoke (on the preview — each line says who verified it)

- [x] <acceptance criterion> — demonstrated: <how/where> (agent | operator)
- [x] auth: <who> signs in and reaches <surface> (operator)
- [x] payments: <tested | not touched> (operator)
- [x] email/notifications: <which fired, verified where | none expected> (operator)

## Findings & cleanup

- <finding> — <fixed on branch (commit) / accepted because… / needs an owner decision>
```

## Verify (before handing off)

- The conditional passes ran whenever their trigger matched the diff — "not required" is recorded
  **with its reason**, never silently skipped.
- Every DoD line is evidenced on the preview, and attributed to whoever actually checked it.
- All fixes are commits on this branch — no second PR, and no local check runs.
- `verify.md` is pushed, and you stopped for the human gate. Ship was not started.
