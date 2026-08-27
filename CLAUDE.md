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
  demo/         the Design stage's prototype sandbox — mock data only (:3005)
packages/
  ui/           @remi/ui — the design system; the only home for primitives
  services/     @remi/services — storage, email, AI, env; seams, not integrations
pipeline/       the delivery pipeline — stages, lanes, runs, scripts
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
- **[`pipeline/CONTEXT.md`](pipeline/CONTEXT.md)** — the delivery pipeline. The map of its gated
  stages; each stage's contract is `pipeline/stages/NN_*/CONTEXT.md`.
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
  [`pipeline/_shared/knowledge-map.md`](pipeline/_shared/knowledge-map.md). Load the named page,
  never the whole site. **The business pages predate the braindump and have not been reconciled
  with it yet** — where they disagree, `.icm/docs/braindump/` wins.

## How work gets done here

Through the pipeline, not ad hoc. `/pipeline scope "<topic>"` for a new capability;
`/pipeline bug | tweak | chore "<request>"` for the fast lanes; `/pipeline status` to see where
everything stands. Every stage has a human gate at its boundary and the agent never crosses one on
its own.

The ordered backlog lives in [`.icm/intake/`](.icm/intake/README.md) (estate ticket standard,
formerly `ISSUES/`): one markdown ticket per unit of work, each with a pasteable agent prompt.
**The PR that implements a ticket is the PR that retires it** — the move into `_done/` rides along
with the work, never a follow-up sweep. The mechanics are in that README.
