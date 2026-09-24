# Project rules — what is true of THIS repo (Layer 3 reference, project-owned)

The stage and lane contracts under `stages/` and `lanes/`, the shared doctrine in `_shared/`
(`github`, `ci`, `stage-preamble`, `scope-template`, `conventions`, the `run-pack/` files),
`intake/CONTEXT.md`, `uat/CONTEXT.md`, the capability skills under `skills/` and the factory
scripts are **template-owned**: byte-identical in every pipeline repo in the estate, listed in
`.icm/MANIFEST`, synced from `icm-board/_system/template/icm-pipeline/` by `icm-sync.sh`
(`.icm/template-version` says which template this copy was last brought up to), and carrying no
repo's identity. Everything specific to Remi AI lives in the project-owned files the sync never
touches — `.icm/project.json` for the values a script reads, `_shared/knowledge-map.md` for the
doc pages, `scripts/{format,lint,validate-knowledge-map,report}.sh` for this repo's own hooks,
`runs/README.md`, and **this file** for the rules a stage reads. A contract that says "see
`_shared/project-rules.md`" means: the answer is here, and it is ours. (Estate decisions D20 and
D23; `/setup` — `.icm/scripts/setup.sh` — says whether the two are complete and in step.)

## People and gates

- **The operator** — Jamie: ticks **Spec approved** and **Ready to merge**, smoke-tests the
  preview by hand before the second tick, and merges every PR from GitHub — spine and lane alike.
  Those two checkboxes are the only binding approvals in the system; the business's involvement
  ends when the scope is settled at Scope.
- **Authors** — where a story or request comes from (`run.md` → `author/source:`): Morgane (the
  founder, and the practitioner whose consultation the product follows — her feedback and her
  documents rank first in `.icm/docs/README.md` § Precedence), Arnaud, the Friday call, a document
  under `.icm/docs/collaboration/`, a chat thread. Scope settles the source with the operator in
  session; nothing is answered out of band. Vocabulary: the product speaks French and its terms
  are quoted in « » (`CONVENTIONS.md` § Working languages); everything the pipeline writes is
  English.
- **The front pushes straight to `main`.** `main`'s ruleset (« Quality Assurance ») requires the
  `Format, lint, typecheck` check, allows squash merges only, requires a PR — and names one bypass
  actor, the owner's GitHub user, in `always` mode. Verified so far:
  - **the owner's identity — by history:** `39236e0`, a planning commit, landed on `main`
    directly.
  - **a remote session's identity — by history:** `0ae5055`, `35a1a53`, `e1344bb` and `5ced044`
    are post-merge record commits pushed straight to `main` by Release runs whose own records say
    they ran in remote Claude Code sessions; every push was accepted, so that identity is on the
    bypass list too.

  A refused push is a **ruleset problem to fix** (add the identity to the bypass list), never a
  reason to open a PR: Scope STOPs and reports it. Record the answer for any newly verified
  identity here.

- **The client contact** — no client-facing report leaves the pipeline on its own: the operator
  relays. What shipped reaches the founders through the REMI Slack workspace (`report.sh
  announce` → the channel `SLACK_ANNOUNCE_CHANNEL_ID` names) and the public changelog;
  `/pipeline status` compiles `.icm/output/client-status-latest.md` in their words when a written
  account is wanted, and handing it to them is the operator's act.
- **UAT sign-off** — none: `uat` in `.icm/project.json` is undeclared, so every run merges into
  `main` and ships on the merge, and the operator's own smoke of the preview before **Ready to
  merge** is the whole test. A persistent UAT environment (one branch, one fixed address, a batch
  the founders sign off before it reaches production — `.icm/uat/CONTEXT.md`) is `/setup`'s to
  declare, the day they want to test a batch rather than a feature.

- **The GitHub repo** is `k0d0minio/remi-ai`, and it is **public**. The scripts derive it from
  `origin`; a remote session's GitHub connection provides the credential (`GH_TOKEN`), a local
  session a logged-in `gh`. Nothing commercial, personal or contractual goes into `.icm/` beyond
  what the product needs — client words and product knowledge, yes; terms, figures and
  credentials, never (`.icm/docs/ENV.md` is names and purposes only).

## Knowledge

- **Docs tree** — `apps/docs/app` (`docs_path` in `.icm/project.json`), the Nextra 4 reference
  site. Direction under `business/` (`initiatives`, `scope`, `roles`), technical reference under
  `technical/` (`architecture`, `applications`, `packages`, `development`, `decisions`); the
  stages read them through `_shared/knowledge-map.md`. The pages restate the **direction of
  record**, which is `.icm/docs/` and its precedence order (`.icm/docs/README.md`): where a page
  and `.icm/docs/` disagree, `.icm/docs/` wins and the page is the thing to fix — with
  `knowledge edit`.
- **Code rules** — `/CONVENTIONS.md` at the repo root (code style, the design system, leanness,
  working languages, testing, environment variables, git) plus the subtree deltas in
  `apps/*/AGENTS.md` and `packages/*/AGENTS.md`. Build loads `/CONVENTIONS.md` directly;
  `_shared/conventions.md` redirects there. The three-list rule for a new environment variable
  (the zod schema in `packages/services`, `globalEnv` in `turbo.json`, a row in
  `.icm/docs/ENV.md`) is what Release's deploy-breaking-config hold reads against.
- **Personas** — `patient`, `practitioner`, `operator`: the three roles of `business/roles`, the
  `personas` array in `.icm/project.json`, and the `persona:*` labels in `.github/labels.yml`. A
  spec's `- personas:` line names at least one.

## The factory

- **Required CI check** — `Format, lint, typecheck` (`required_checks` in `.icm/project.json`;
  the name contains commas, which is why the list is an array and `PIPELINE_REQUIRED_CHECKS`,
  when used as an override, is newline-separated). The workflow is `Quality`
  (`.github/workflows/quality.yaml`); the **check run** is named after its one job. It runs on
  every PR and on `main`, with no path filter and **no tiering**: a draft head and a ready head
  run the same whole job — the migration-order check (`Migration order`, pull requests only:
  `CONVENTIONS.md` § the factory), a format check over `**/*.{ts,tsx,md}`, lint with a
  zero-warning ceiling, the type check, and the `@remi/services` vitest suite — so here the
  "cheap tier" and the "full gate" the contracts distinguish are one and the same verdict, and
  `ci-status.sh` names the tier by the PR's draft state alone. The full sweep is blocked in-session by
  `.claude/hooks/block-local-checks.sh`; Husky (`lint-staged`) formats staged `.ts/.tsx/.md` on
  commit wherever `node_modules` is installed.
- **The other check runs on a PR:**

  | Name                        | Class    | What it means                                                                                                                                                                                                                                                                                                                                       |
  | --------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `Project run labels`        | blocking | `Pipeline` (`.github/workflows/pipeline.yaml`) — one job: projects `stage:*` / `type:*` / `persona:*` / `complexity:*` from the run's outputs, then re-validates spec structure, intake bookkeeping, release completeness and the knowledge map as **advisory steps** — summary lines and `::warning::`s; only a label-projection fault can red it. |
  | `Pipeline gates (advisory)` | advisory | `Gates` (`.github/workflows/gates.yaml`) — reads the two gate anchors in the PR body and is red while a present gate is unticked. A visible signal for the human, not a factory verdict: the stage contracts read the checkbox itself, and the ruleset does not require this check. Advisory by name, so `ci-status.sh` never reds on it.           |

  `Vercel Preview Comments` is noise (`_shared/ci.md`). There is no smoke check (`smoke_check`
  is absent from `.icm/project.json`) — the operator's smoke is by hand.

- **Local feedback scripts** — `.icm/scripts/format.sh` (the repo's formatter over the
  `.ts/.tsx/.md` files the branch changed, honouring `.prettierignore`) and
  `.icm/scripts/lint.sh` (the repo's linter over the same files, run inside each workspace
  package with its own config, no `--fix`, zero warnings — the ceiling `quality.yaml` enforces).
  Feedback before a push, never the verdict — CI's `Format, lint, typecheck` is the verdict
  (estate decision D21).
- **Deploy** — `deploy` in `.icm/project.json`: Vercel, team **`remi21`** — a separate team
  boundary from the kodominio estate, so the token is this team's own — `VERCEL_TOKEN_REMI21` in
  the operator's shell, plain `VERCEL_TOKEN` the fallback a cloud panel sets — and never written here — six projects, one per app, **all `class:
  product`** because **previews build on every push, draft or ready**: there is no draft
  suppression and no quiet project here, so the contracts' "drafts build no previews" is stricter
  than what happens — a draft head's preview simply exists earlier, and nothing depends on its
  absence. Each project carries `ignoreCommand: npx turbo-ignore <package> --fallback=HEAD^1` in
  its `vercel.json`, so a project the diff does not affect posts `success` with the description
  `Canceled by Ignored Build Step` — a skip, not a pass (`ci-status.sh` classes it `skipped`).
  `deploy-status.sh` reads all six production deployments once after a merge; `rollback.sh
  --vercel` names the previous READY one per project and executes nothing. **Known:** a merge
  that touches no app (docs-only, `.icm`-only) leaves every project CANCELED by the ignore step,
  which `deploy-status.sh` cannot see through its SHA filter — it waits out its timeout and
  records `PENDING`; read that as the skip when the diff touched no app (icm-board triage stub
  `deploy-status-ignore-step-cancel`).

  | Context                  | Vercel project  | App                                                           | Production                            |
  | ------------------------ | --------------- | ------------------------------------------------------------- | ------------------------------------- |
  | `Vercel – app`           | `app`           | `apps/web` — the product                                      | `app-remi21.vercel.app` (no domain yet) |
  | `Vercel – admin`         | `admin`         | `apps/admin` — the console; its build runs `db:migrate` first | `admin.remi-ai.tech`                  |
  | `Vercel – marketing`     | `marketing`     | `apps/marketing`                                              | `marketing-remi21.vercel.app` (no domain yet) |
  | `Vercel – documentation` | `documentation` | `apps/docs` — where Release's docs and changelog pages land   | `docs.remi-ai.tech`                   |
  | `Vercel – support`       | `support`       | `apps/support`                                                | `support-remi21.vercel.app` (no domain yet) |
  | `Vercel – demo`          | `demo`          | `apps/demo` — mock data only, no backend                      | `demo-remi21.vercel.app` (no domain yet) |

  `remi-ai.tech` is registered with Vercel on the team; `remiai.be` is held elsewhere and not
  assigned. The four projects without a custom domain answer on their `*.vercel.app` production
  alias **behind Vercel's deployment protection** (a 302 to Vercel SSO) — reachable to a signed-in
  team member, not to the public, until a domain is assigned.

  The admin build migrates whatever `DATABASE_URL` it is given, and the preview guard in
  `packages/services/scripts/migrate.mjs` is not in force on the admin project today — the open
  stub `intake/triage/previews-migrate-the-shared-database.md` is where that gets settled. Until
  it is, a migration-bearing branch's preview writes its schema into the shared database.
- **Migrations** — `migrations` in `.icm/project.json`: Drizzle, `packages/services/src/db/migrations/`,
  forward-only (no `down` scripts — a code revert must tolerate the newer schema; `rollback.sh`
  says so). **Drizzle names the files** (`NNNN_<words>.sql` beside `meta/_journal.json`, from
  `pnpm db:generate`) and the repo's own `Migration order` CI step orders them
  (`CONVENTIONS.md` § the factory: regenerate on the merged tree, never renumber, never
  hand-edit `idx`). The template's `check-migrations.sh` reads only stamped files
  (`V<17 digits>__` or `<14 digits>_`), finds none here and reports `SKIP` — correct, not a gap.
  Never use its `--new` in this repo; `stamp: millis` and `out_of_order: false` in the block are
  statements for the record, not switches.
- **Environment surfaces** — six `.env.example`, one per app (`env.sh audit` walks
  `deploy.projects`); `.icm/docs/ENV.md` is the catalogue, with the per-project matrix of which
  app needs which. The pipeline's own variables — `VERCEL_TOKEN_REMI21`, `SLACK_BOT_TOKEN`,
  `SLACK_ANNOUNCE_CHANNEL_ID`, `SLACK_ALERTS_CHANNEL_ID`, `GH_TOKEN` — are **not** app variables:
  they live in the session's environment (the operator's shell; the Claude cloud environment
  panel for a remote session) and in this repository's Actions where a CI caller needs them —
  never in an app's manifest, never on a Vercel project. The three-edit rule for an app variable
  (the zod schema, `turbo.json` `globalEnv`, an ENV.md row) stands.
- **The security gate** — `scripts/security-check.sh` runs before every commit in Build and
  before every lane's push (template-owned; the one local check that is a gate). Not wired as a
  git hook: `.husky/pre-commit` runs `lint-staged` only, and the stages call the gate themselves.
  gitleaks is not installed on the operator's machine — the built-in patterns are the floor, and
  the script says so aloud; `pnpm audit --audit-level=high` runs when the lockfile moved on the
  staged scope. `security.audit_command` is empty: pnpm is detected.
- **The run's database** — `database.isolation: none`, deliberately for now: the one Neon
  database serves production, previews and CI alike, and the **admin** build applies migrations
  behind `migrate.mjs`'s production-only guard (`.icm/docs/ENV.md` § Storage), so a run's schema
  reaches the live database on the merge and not before. A schema per run (`schema` — `run_<slug>`
  on the database `DATABASE_URL` names) is the natural next step once the open triage stub
  `previews-migrate-the-shared-database` settles where previews migrate; until then
  `db-branch.sh` reports `SKIP`.
- **Health endpoint** — per project under `deploy.projects[]`: `https://admin.remi-ai.tech/sign-in`
  and `https://docs.remi-ai.tech/`, the two custom domains, both answering 200
  (`health-check.sh` follows redirects, so the console's `/` → `/sign-in` counts). The other four
  have none until a custom domain is assigned: their `*.vercel.app` alias answers 302 to Vercel
  SSO, which would read as healthy after the redirect whether or not the app is up. Add each
  project's endpoint the day its domain lands — `/api/health` if one is ever built, else the
  public page.
- **Archive** — the estate defaults: `runs_archive` = `.icm/runs/_done`, `intake_archive` =
  `.icm/intake/_done` (both in `.icm/project.json`). Nothing serves them; git is the record. The
  close-out's path guard is `.icm/runs/**` and `.icm/intake/**`, nothing else. Older archived runs
  carry the folder shape they were written in; nothing is renumbered and nothing reads them but a
  human.
- **The labels job** — `pipeline.yaml` re-projects labels on every push touching `.icm/runs/**`
  and derives `stage:*` from which outputs exist, which is why the contracts tell stages to
  commit their output rather than call `project-labels.sh` (Release excepted — it projects its
  own label at step 1). The job diffs `origin/$BASE_REF...$HEAD_SHA` — the PR's own files, never
  what `main` did in the meantime — and labels only a run whose `run.md` points at this PR.

## Reporting

- **Kinds → channels** — `reporting` in `.icm/project.json`: `announce` → `github-release` (the
  estate default: one Release per merge on `k0d0minio/remi-ai`, public like the changelog; tag
  `release/<date>-<slug>` on the merge SHA, idempotent by tag) **+ `slack`** — the REMI Slack
  workspace, the channel `SLACK_ANNOUNCE_CHANNEL_ID` names; `alert` → `slack` — the channel
  `SLACK_ALERTS_CHANNEL_ID` names, where `health-check.sh` posts a production read that failed
  after a merge; `economics` → none — icm-board's `run-economics.sh` writes it into the deal
  folder. The Slack app posts with `SLACK_BOT_TOKEN` (scope `chat:write`, the app invited to both
  channels). Channel variables are NAMES here and in `project.json`; the values live in **this
  repository's Actions secrets and variables** — `SLACK_BOT_TOKEN` a secret, the two channel ids
  variables (`.icm/docs/ENV.md` § Pipeline) — because the hook is called from CI (below). A
  variable unset where `report.sh` runs prints `SKIPPED slack` and exits 0; in the workflow a
  message no channel took is a red job, and that red job alerts. Email through Resend is
  configured by name (`REPORT_EMAIL_FROM`, `REPORT_EMAIL_TO`, `RESEND_API_KEY`) and mapped to
  nothing; adding `"email"` to an array and its lines to the workflow turns it on. Nothing
  verifies the archive after the merge — the close-out riding the PR is the whole guarantee.
- **Who calls the hook** — `announce_from: ci`: `.github/workflows/release.yaml` calls
  `report.sh announce` when a PR merges into `main` — every merge, whether or not a session was
  open, since the operator merges from GitHub. The session's `## Release` record says
  `announce: deferred to CI`. The workflow is the seeded reference with three per-repo edits:
  the Slack lines live in both steps, and the message is the changelog page's H1 with the
  page's address on `docs.remi-ai.tech` as the link (§ Changelog) — the PR's Summary line and
  URL stand in when a run shipped no page. `announce: none` or `audience: internal` in the PR
  body is honoured. **One caveat:** the health probe (Release step 9a) still runs in the
  session, so its `report.sh alert` posts only where the session's shell carries the Slack
  variables; otherwise the parked bug stub and the stop message are the alert.
- **Changelog** — `apps/docs/app/changelog/<YYYY-MM-DD>-<slug>/page.mdx` (date = the merge
  date), one page per shipped feature, in the user's voice: sentence case, what changed for the
  person reading, no internal terms, no slugs, no file paths. The H1 is the outcome in one line —
  that line is the summary `notify.sh` sends — followed by an italic date line and the body.
  Register the entry at the **top** of `apps/docs/app/changelog/_meta.ts` (newest first) — and
  nowhere else: the `## Entries` list on `apps/docs/app/changelog/page.mdx` derives itself from
  the folder, so a page that exists is already listed. No skill owns the shape; this section does. Audience: a user-visible change gets a page and the note
  (`announce: public`); an internal change — infra, security, performance — gets no page and the
  note alone, framed as reliability or trust (`announce: internal`); nothing worth saying is
  `announce: none`. Bug and tweak lanes write a page when the change is user-visible; chore never
  does.
- **Workflows** — `release.yaml` present: the reference announce-on-merge workflow, seeded
  once on 2026-09-23 and this repo's own since (the edits above); `workflow_dispatch` with a slug
  re-announces from `main`. The reference `labels.yaml` is absent: `pipeline.yaml` is this
  repo's labels job and `gates.yaml` its advisory gate read (§ The factory); it is not to be
  seeded here.

## Support

- **Tier** — `support.tier: none`: no after-handover support line is agreed — the operator is
  also the builder, on call by being in delivery. No fail-safe page. Sentry is not wired
  (`.icm/docs/ENV.md` § Not wired yet — the top unstarted ops item), so
  `monitoring.sentry_dsn_env` names `SENTRY_DSN` for the day it is. Revisit at handover.

## Capability skills the stages may call

- **Pipeline capability skills** — `.icm/skills/<name>/SKILL.md` (three-tier, loaded on a
  trigger; `.icm/skills/README.md`; `list-skills.sh --bare` is the registry the session-start
  hook prints). Seeded and template-owned: `security-audit`, `database-migration`,
  `preview-deploy`. This repo's own additions: none.
- **Repo skills** — none yet — `.claude/SKILLS.md` says why, and names the candidates
  (`shared-component`, `service-adapter`, `changelog-entry`, `docs-sync`). Until one exists the
  contracts' fallbacks apply: Release and the knowledge lane edit `apps/docs` pages under
  Nextra's own conventions (MDX, `_meta.ts` for navigation, the register `CONVENTIONS.md` §
  Working languages sets), Scope writes in the same register, and the changelog shape is the
  section above. There is no router hook: `/pipeline` is explicit and the bare forms route
  through the skill's own description.

## Learned rules

*The constraints earlier runs paid for, appended before each close-out by two writers with one
shape: `.icm/scripts/retrospective.sh --apply` (at Release and at the end of every lane — one
line per error class a run fixed and flagged with `- rule:` in its `error.log`, or fixed again
after an earlier run already had, counted across the archive's `error.log`s) and
`.icm/scripts/run-pack.sh --sync-rules` (called by `close-out.sh` — the `## Learned rules` a run
wrote in its `FAILURE.md`: what no tool logged — a wrong assumption, a STOP, a skipped step).
Each line carries the run it was learned in. Build and the lanes read this section before their
first edit, with the same standing as the code rules. Edit or delete lines freely — this file is
the repo's own, never synced — and delete a line that reads as a slip rather than a constraint.*

<!-- Retrospective Learned Rule [2026-09-24] -->
- `security-check.sh` has no baseline: any change that moves the lockfile, and every `--branch --audit` read, re-reports main's own high/critical advisories (20 on 2026-09-24, parked as the P0 chore `triage/dependency-audit-next-rce`). Compare `pnpm audit --audit-level=high` on `origin/main` against the branch; an identical set is not the branch's — record it in `error.log`, commit behind the secret scan with `--no-audit`, name it in Notes for Release, and at Release ask the operator for the waiver. Never bump `next` or clear them inside a feature PR. (`security-check/dependency-audit`, seen 4× — patient-documents-and-links, challenges)
<!-- Retrospective Learned Rule [2026-09-24] -->
- After a push, check that the head `ci-status.sh` names is `git rev-parse HEAD` before trusting its verdict; re-run it when it names an older commit. (`FAILURE.md` — patient-documents-and-links)

<!-- Retrospective Learned Rule [2026-09-24] -->
- never write a literal to a `token:`/`password:`-style key in a test — derive it from a created row (`patient.shareToken`) so `security-check.sh` stays quiet. (`security-check/generic-secret-assignment`, seen 1× — general-feedback; apps/admin, apps/docs, apps/web, packages/services)
<!-- Retrospective Learned Rule [2026-09-24] -->
- Before a push that should produce previews, make sure its head commit touches app or package code against its parent — fold `.icm/` run-file updates into the code commit rather than pushing them on top, or the Vercel ignore step skips every project. (`FAILURE.md` — general-feedback)
<!-- Retrospective Learned Rule [2026-09-24] -->
- A PR that sits `PENDING` with its required check never registered is first a merge-conflict question: check `mergeable` before re-running anything. (`FAILURE.md` — general-feedback)
