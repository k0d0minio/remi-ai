# Project rules — what is true of THIS repo (Layer 3 reference, project-owned)

The stage and lane contracts under `stages/` and `lanes/`, the shared doctrine in `_shared/`
(`github`, `ci`, `stage-preamble`, `scope-template`, `conventions`), `intake/CONTEXT.md` and the
factory scripts are **template-owned**: byte-identical in every pipeline repo in the estate,
synced from `icm-board/_system/template/icm-pipeline/` by `icm-sync.sh`, and carrying no repo's
identity. Everything specific to Remi AI lives in the project-owned files the sync never touches —
`.icm/project.json` for the values a script reads, `_shared/knowledge-map.md` for the doc pages,
`scripts/{format,lint,validate-knowledge-map,notify}.sh` for this repo's own hooks,
`runs/README.md`, and **this file** for the rules a stage reads. A contract that says "see
`_shared/project-rules.md`" means: the answer is here, and it is ours. (Estate decision D20,
2026-09-18.)

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
  run the same whole job — a format check over `**/*.{ts,tsx,md}`, lint with a zero-warning
  ceiling, the type check, and the `@remi/services` vitest suite — so here the "cheap tier" and
  the "full gate" the contracts distinguish are one and the same verdict, and `ci-status.sh`
  names the tier by the PR's draft state alone. The full sweep is blocked in-session by
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
- **Deploy projects (Vercel)** — six, one per app. **Previews build on every push, draft or
  ready** — there is no draft suppression here, so the contracts' "drafts build no previews" is
  stricter than what happens: a draft head's preview simply exists earlier, and nothing depends
  on its absence. Each project carries `ignoreCommand: npx turbo-ignore <package>
  --fallback=HEAD^1` in its `vercel.json`, so a project the diff does not affect posts `success`
  with the description `Canceled by Ignored Build Step` — a skip, not a pass (`ci-status.sh`
  classes it `skipped`).

  | Context                  | App                                                            |
  | ------------------------ | -------------------------------------------------------------- |
  | `Vercel – app`           | `apps/web` — the product                                       |
  | `Vercel – admin`         | `apps/admin` — the console; its build runs `db:migrate` first  |
  | `Vercel – marketing`     | `apps/marketing`                                               |
  | `Vercel – documentation` | `apps/docs` — where Release's docs and changelog pages land    |
  | `Vercel – support`       | `apps/support`                                                 |
  | `Vercel – demo`          | `apps/demo` — mock data only, no backend                       |

  The admin build migrates whatever `DATABASE_URL` it is given, and the preview guard in
  `packages/services/scripts/migrate.mjs` is not in force on the admin project today — the open
  stub `intake/triage/previews-migrate-the-shared-database.md` is where that gets settled. Until
  it is, a migration-bearing branch's preview writes its schema into the shared database.
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

## Announcing

- **Post-merge notification** — `scripts/notify.sh` **is wired**: it sends the one-line summary
  Release (or a lane with a user-visible change) hands it as an email through Resend — the mail
  vendor the product already uses — to `SHIP_NOTE_RECIPIENTS` (normally one channel inbox) from
  `SHIP_NOTE_FROM` or `EMAIL_FROM`, with `RESEND_API_KEY`, all read from the process environment
  (`.icm/docs/ENV.md` § Pipeline). When any of those is unset — a remote session rarely carries
  them — it prints the note and reports `RESULT: SKIPPED`, exit 0: **written, not sent** is a
  normal outcome to record in the `## Release` record, not a failure, and a release is complete
  at the merge either way. No CI workflow announces and there is no alert channel; nothing
  verifies the archive after the merge — the close-out riding the PR is the whole guarantee.
- **Changelog** — `apps/docs/app/changelog/<YYYY-MM-DD>-<slug>/page.mdx` (date = the merge
  date), one page per shipped feature, in the user's voice: sentence case, what changed for the
  person reading, no internal terms, no slugs, no file paths. The H1 is the outcome in one line —
  that line is the summary `notify.sh` sends — followed by an italic date line and the body.
  Register the entry at the **top** of `apps/docs/app/changelog/_meta.ts` (newest first) and in
  the `## Entries` list of `apps/docs/app/changelog/page.mdx` (the open stub
  `intake/triage/changelog-index-missing-entries.md` is about making that one list). No skill
  owns the shape; this section does. Audience: a user-visible change gets a page and the note
  (`announce: public`); an internal change — infra, security, performance — gets no page and the
  note alone, framed as reliability or trust (`announce: internal`); nothing worth saying is
  `announce: none`. Bug and tweak lanes write a page when the change is user-visible; chore never
  does.

## Capability skills the stages may call

None yet — `.claude/SKILLS.md` says why, and names the candidates (`shared-component`,
`service-adapter`, `changelog-entry`, `docs-sync`). Until one exists the contracts' fallbacks
apply: Release and the knowledge lane edit `apps/docs` pages under Nextra's own conventions
(MDX, `_meta.ts` for navigation, the register `CONVENTIONS.md` § Working languages sets), Scope
writes in the same register, and the changelog shape is the section above. There is no router
hook: `/pipeline` is explicit and the bare forms route through the skill's own description.
