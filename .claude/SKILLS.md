# Skills — the catalog and the rule for adding one

## The model this serves

The pipeline (`.icm/`) is a context workspace: **folder structure is the orchestration.** One
`/pipeline` router skill routes between gated stages, and the stages call flat, **one-job capability
skills** in `.claude/skills/`.

A skill earns its place only if **both** hold:

1. it matches the real stack and product, and
2. a pipeline stage or a common dev task would actually invoke it.

Generic skills, near-duplicates, broken stubs and stack mismatches dilute the model — an agent
scanning a list of forty descriptions to find the two that apply is worse off than one with no list
at all. Keep this small.

## Repo-local skills

| Skill            | What it does                                                                                                |
| ---------------- | ----------------------------------------------------------------------------------------------------------- |
| `pipeline`       | The delivery pipeline router. Non-negotiable — it _is_ the workflow. Template-owned: synced from icm-board. |
| `setup`          | `/setup` — is the repo complete, current and configured for the pipeline; runs `.icm/scripts/setup.sh`.  |
| `ticket-craft`   | The estate ticket standard as working knowledge (canonical estate asset).                                   |
| `pr-conventions` | Branches, commits, CI-is-truth, no secrets (canonical estate asset).                                        |

That is the whole list today, and that is the correct size for a repo at this stage. The
**pipeline's own capability skills** live elsewhere — `.icm/skills/<name>/SKILL.md`, three-tier
(front matter, body, `references/` + `scripts/`), loaded by a stage only when one of their triggers
matches the step in front of it; `.icm/scripts/list-skills.sh --bare` prints the registry and the
session-start hook injects it. Three are seeded and template-owned: `security-audit`,
`database-migration`, `preview-deploy`. No repo-local capability skill exists yet;
`.icm/_shared/project-rules.md` → Capability skills says what the stages do instead. Everything
else comes from the globally installed skills (Next.js, Vercel, security, accessibility, testing,
and so on), which need no copy here.

## Adding one

Before writing a skill, check three things:

1. **Is it one job?** "Add a shared component" is a skill. "Frontend work" is not.
2. **Who calls it?** Name the stage or the task. A skill nothing invokes is documentation with extra
   steps — write it in `CONVENTIONS.md` or an `AGENTS.md` instead.
3. **Does a global skill already cover it?** If so, the answer is to use that one, not to fork it
   with a repo-specific tweak — the fork will drift.

Candidates worth building once the repo has the surface to justify them:

- **`shared-component`** — add a primitive to `packages/ui`: shadcn add, rewrite to house style,
  export from the barrel, wire a consumer. Called by Build.
- **`service-adapter`** — implement and register a seam adapter in `packages/services` (storage,
  email, AI) with its env vars, `.icm/docs/ENV.md` row and `turbo.json` entry. Called by Build.
- **`changelog-entry`** — the changelog page's shape and user-voice copy rules, today inlined in
  `.icm/_shared/project-rules.md` → Announcing. Called by Release and the bug/tweak lanes.
- **`docs-sync`** — update the affected `apps/docs` pages under Nextra's conventions. Called by
  Release and the knowledge lane.

Each is currently inlined in the contract or the project rules that would call it. Extract one into
a skill when the inline version starts repeating itself — not before.

## A note on permissions

`.claude/settings.json` allowlists every `.icm/scripts/*.sh` and the three capability skills'
scripts. Each script is one job, invoked by exactly one contract step the operator triggered,
prints what it did, and stops: the read-only ones (`resolve-run.sh`, the validators, `ci-status.sh`,
`triage-report.sh`, `env-check.sh`, `setup.sh`, `deploy-status.sh`, `health-check.sh`,
`client-status.sh`, `select-model.sh`, `list-skills.sh`, `usage-snapshot.sh`), the ones whose
effect stays inside the run, its PR or the working tree (`project-labels.sh`, `project-body.sh`,
`close-out.sh`, `run-pack.sh`, `retrospective.sh`, `check-migrations.sh`, `security-check.sh`,
`db-branch.sh`, `process-raw.sh`, `format.sh`, `lint.sh`), and the few with an outward effect —
`new-run.sh` opens the run's one draft PR, `promote-uat.sh approve` opens a promotion PR (UAT
repos only), `env.sh add` creates a variable from stdin, `report.sh` announces or alerts on the
channels `.icm/project.json` → `reporting` maps — whose effect is the stage's declared output,
not a side effect, and which refuse or skip plainly rather than act on a guess. `rollback.sh`
prepares a recovery and executes nothing. The gates are not scripts: no script ticks a checkbox,
merges a PR, or records a client's approval on its own.
