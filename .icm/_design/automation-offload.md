# Automation offload — design notes (human-only)

Nothing in `_design/` is loaded at runtime. This file records **why** parts of the pipeline are
scripts and CI jobs rather than instructions to an agent, so the reasoning survives the next time
someone is tempted to move work back into a prompt.

## The principle

An agent's context window is expensive and non-deterministic. Any step that is fully specified —
same inputs, same outputs, every time — is cheaper, faster and more reliable as a script. The
pipeline pushes exactly those steps out, and keeps the agent for the parts that need judgement.

| Work                                    | Owner                    | Why                                                              |
| --------------------------------------- | ------------------------ | ---------------------------------------------------------------- |
| Format                                  | Husky pre-commit         | Zero judgement; must happen before the diff exists               |
| Lint, typecheck                         | CI (`quality.yaml`)      | Zero judgement; a full-repo sweep costs a session nothing in CI  |
| Build                                   | The Vercel preview       | The preview has to build anyway — reuse it                       |
| Resolving a run into the working tree   | `resolve-run.sh`         | Deterministic; the failure mode (fabricating a run) is expensive |
| Opening the run's PR                    | `new-run.sh`             | A fixed body projection from `spec.md`                           |
| Projecting labels                       | `project-labels.sh` + CI | A pure function of the spec header and which outputs exist       |
| Checking the spec's structure           | `validate-spec.sh`       | Header fields and checkbox shape are mechanical                  |
| Sending the ship note                   | `send-ship-note.sh`      | The draft is the email; nothing to decide                        |
| Reading the factory's verdict           | `ci-status.sh`           | Two surfaces, newest attempt wins — a rule, not a judgement      |
| Writing the spec, the code, the reviews | The agent                | Judgement — this is the whole point                              |

## 1 · Blocking local checks

`.claude/hooks/block-local-checks.sh` is a `PreToolUse` hook that blocks `pnpm build|lint|typecheck|
format`, `turbo run build|lint|typecheck`, and the bare binaries (`tsc`, `next build`, `prettier`,
`eslint`) at a command-segment boundary. Contracts saying "don't run these" was not enough —
nothing enforced it, and a session would routinely burn ten minutes compiling the monorepo to learn
what CI would have told it for free.

It fails **open**: no `jq`, malformed input, or an empty command all exit 0. A guard that breaks the
session when it misfires is worse than no guard.

## 2 · The labels job

`.github/workflows/pipeline.yaml` re-projects labels on every push touching `.icm/runs/**`, and
derives `stage:*` from which output files exist. This is why the contracts tell stages to commit
their output rather than to call `project-labels.sh`: **pushing the output is what moves the board.**
The script stays as the manual fallback for when CI is unavailable.

The same workflow runs `validate-spec.sh` as an **advisory** check on later pushes. Define's own
pre-gate call is the real check; the CI pass only flags drift in the job summary and never
red-blocks the PR.

## 3 · What is deliberately not automated

- **The gates.** Three human gates, two of them PR checkboxes. Automating either checkbox would
  remove the only thing standing between a plausible-looking spec and a merged one.
- **The merge.** Release reads the checkbox and one settled `ci-status.sh` verdict, then merges
  once. It never polls, never retries in a loop, and never merges on red — a merge that "eventually
  succeeded" hides the reason it failed the first time.
- **The manual smoke pass.** There is no test suite yet, and the collapse to four stages made that
  explicit rather than ceremonial: the **owner's Ready-to-merge tick is the smoke test's record.**
  Verify used to walk a Definition-of-Done checklist split between agent and operator, then hand to
  a second stage that gated on it again — two stages and two gates for one person's testing. Release
  asks for none of it: the tick attests the manual and signed-in testing, and the agent's job is the
  factory's verdict and the review passes. When a Playwright suite exists, the automatable half of
  that testing moves into CI and the tick means less work, not a shorter contract.

## 4 · Open items

- **Error tracking.** Until a DSN is wired (`.icm/docs/ENV.md` → Not wired yet), a production exception
  is invisible, and Release's readiness pass has nothing to point at. Top unstarted ops item.
- **A smoke suite.** Sign-in, each app's landing route, one write path. Would convert most of what
  the Ready-to-merge tick currently attests from operator-demonstrated to CI-enforced.
- **A `persona:` label axis.** Blocked on `apps/docs/app/business/roles` being written. `app:` is
  the honest dimension until then.
