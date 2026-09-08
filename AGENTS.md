# Remi AI — AI agent guide (Layer 0)

This is the identity + routing file: what this repo is, and where to find the rules. The rules
themselves live in [`CONVENTIONS.md`](CONVENTIONS.md) — keep this file to orientation and pointers,
so nothing is stated in two places that can disagree.

## Project context

Remi AI is an AI product built as a Turborepo monorepo: six Next.js apps sharing two packages — a
design system and a services layer. The services layer defines **seams**, not integrations: storage,
email and AI each have an interface and a registration point. Storage runs on Neon Postgres and
email on Resend, each through one adapter behind its seam; AI has no vendor yet. Choosing or
changing one means writing one adapter, not rewriting the callers.

## Monorepo structure

```text
apps/
  web/          the product — signed-in surface (:3000)
  marketing/    the public site — unauthenticated, indexable (:3001)
  admin/        internal operations — operator-only, separate deployment (:3002)
  docs/         the reference site — Nextra (:3003)
  support/      the public help centre — unauthenticated, indexable (:3004)
  demo/         the prototype sandbox — mock data only, no backend (:3005)
packages/
  ui/           @remi/ui — the design system; the only home for primitives
  services/     @remi/services — storage, email, AI, env; seams, not integrations
.icm/           the work layer — intake, docs, and the delivery pipeline
```

The dependency arrow points **app → package**, only ever. No app imports another app; a package
importing an app is a lint error.

## Tech stack

| Layer      | Technology                                      |
| ---------- | ----------------------------------------------- |
| Monorepo   | Turborepo 2, pnpm 10 workspaces, Node 22        |
| Framework  | Next.js 16 (App Router), React 19               |
| Language   | TypeScript 5 — strict everywhere                |
| Styling    | Tailwind CSS 4; tokens in `@remi/ui/tokens.css` |
| Primitives | shadcn/ui (New York) over Radix, lucide-react   |
| Docs       | Nextra 4                                        |
| Packages   | tsup → ESM                                      |
| Hosting    | Vercel — one project per app                    |

Storage is Neon Postgres (Drizzle, migrations in the repo), email is Resend, operator auth is
vendor-free (`packages/services/src/auth/`); AI is deliberately unchosen. See
`packages/services/AGENTS.md`.

## Commands

```bash
pnpm install
pnpm packages:build     # @remi/ui + @remi/services — needed before any app compiles
pnpm dev                # every app (builds packages first)
pnpm web:dev            # one app — also admin:dev / marketing:dev / docs:dev / support:dev / demo:dev
pnpm packages:dev       # rebuild the packages on change, alongside an app
```

**Do not run `build`, `lint`, `typecheck` or `format` yourself** — the factory owns them (Husky, CI,
the Vercel preview) and `.claude/hooks/block-local-checks.sh` blocks them. Push, then read the
result back from the PR's check runs.

## Where the rules live (routing)

Nothing below is restated here. Each rule lives once, and loads on demand.

- **[`CONVENTIONS.md`](CONVENTIONS.md)** — code style, design-system rules, leanness rules,
  working languages, git.
  The canonical code rules: the Build stage loads it by path. Read it before editing code.
- **[`.icm/CONTEXT.md`](.icm/CONTEXT.md)** — the delivery pipeline. The map of its four gated
  stages; each stage's contract is `.icm/stages/NN_*/CONTEXT.md`.
- **[`.icm/docs/ENV.md`](.icm/docs/ENV.md)** — the single catalogue of environment variables and secrets.
  Bus-factor insurance: the setup is never trapped in one person's head.
- **[`.claude/skills/`](.claude/skills/)** — one-job capability skills, called by pipeline stages.
- **Subtree deltas** — `apps/*/AGENTS.md` and `packages/*/AGENTS.md` hold rules specific to that
  subtree (e.g. [`apps/demo/AGENTS.md`](apps/demo/AGENTS.md),
  [`packages/services/AGENTS.md`](packages/services/AGENTS.md)). The global rules still apply.
- **[`.icm/docs/`](.icm/docs/README.md)** — the source of truth for **what REMI is**. Its
  [`braindump/`](.icm/docs/braindump/) is Morgane's own material and outranks every other account
  of the product; [`remi-status-report.html`](.icm/docs/remi-status-report.html) is the plan
  derived from it. Read its README for the precedence order before trusting anything about
  direction.
- **Product knowledge** — `apps/docs/app/technical/**` (architecture) and
  `app/business/**` (direction), routed per stage by
  [`.icm/_shared/knowledge-map.md`](.icm/_shared/knowledge-map.md). Load the named page,
  never the whole site. The business pages are reconciled with the braindump and the direction of
  record; `.icm/docs/` still outranks them, so where one drifts, `.icm/docs/` wins and the page is
  the thing to fix.

## How work gets done here

Through the pipeline, not ad hoc. The spine is **four stages — Scope → Define → Build → Release**,
the estate's standard set (`_system/template/icm-pipeline/` in icm-board):

| Stage       | What it owns                                                                   |
| ----------- | ------------------------------------------------------------------------------ |
| **Scope**   | interrogate the business logic → `scope.md` → cut the intake batch. No PR.     |
| **Define**  | one stub → an approvable `spec.md`; opens the run's **one** feature PR (draft) |
| **Build**   | implement the spec on the branch, prove CI green, flip the PR draft → open     |
| **Release** | review passes · docs + changelog in-PR → gated squash-merge → ship note        |

`/pipeline scope "<topic>"` for a new capability; `/pipeline bug | tweak | chore "<request>"` for the
fast lanes; `/pipeline status` to see where everything stands. Every stage has a human gate at its
boundary and the agent never crosses one on its own.

**Two binding gates, both PR checkboxes, both the owner's to tick.** **Spec approved** before Build;
**Ready to merge** before the squash-merge. Ticking the second one **attests your own manual and
signed-in testing of the change** — that is why Release has no quality gate of its own and never
asks you to re-test. Once it is ticked, only three things may still stop the merge: a blocking CI
failure, a security-critical finding introduced by the diff, or a deploy-breaking config finding.
Everything else is parked as a stub in `.icm/intake/triage/` and the merge proceeds.

**`apps/demo` is not a pipeline stage.** The six-stage pipeline had a **Design** stage that made a
prototype in `apps/demo` mandatory between Scope and Define. In twelve runs it was never once used,
so it was **dropped** rather than folded into Scope or kept as a lane (Jamie's call, 2026-09-08).
Prototyping is Build's when a change wants one; `apps/demo` survives as an ordinary app with its own
[`AGENTS.md`](apps/demo/AGENTS.md) and its own guards, reachable by any lane or run that needs it.
`stage:verify`, `stage:ship` and `type:design` remain in [`.github/labels.yml`](.github/labels.yml)
as **historical only**, so the archived runs' merged PRs keep valid labels.

**CI is the source of truth.** Never run local checks; push and read the verdict back through
`.icm/scripts/ci-status.sh` — one blocking call per push ([`.icm/_shared/ci.md`](.icm/_shared/ci.md)).
And **no PR in this repository is subscribed to**: a single push produces a dozen-plus deploy and
job events, none of them a verdict ([`.icm/_shared/github.md`](.icm/_shared/github.md) § PR events).

The ordered backlog lives in [`.icm/intake/`](.icm/intake/README.md) (estate ticket standard,
formerly `ISSUES/`): one markdown ticket per unit of work, each with a pasteable agent prompt.
**The PR that implements a ticket is the PR that retires it** — the move into `_done/` rides along
with the work, never a follow-up sweep. The mechanics are in that README.
