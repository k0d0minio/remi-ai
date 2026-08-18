# Remi AI

A Turborepo monorepo: six Next.js apps over two shared packages, with a gated delivery pipeline
that work flows through.

## Layout

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

## Getting started

```bash
pnpm install
pnpm packages:build   # @remi/ui and @remi/services must exist before an app can compile
pnpm web:dev          # or admin:dev / marketing:dev / docs:dev / support:dev / demo:dev
```

`turbo run dev` declares `dependsOn: ["^build"]`, so a bare `pnpm dev` builds the packages first.
Run `pnpm packages:dev` in a second terminal to rebuild them on change.

## Two things that are deliberately absent

**No database, auth, email or AI vendor is committed.** `@remi/services` defines each as a **seam** —
an interface plus a `register*()` call — and the concrete adapter is registered once at process
start by the app that owns the process. Choosing a vendor later is one adapter file and one
registration line, not a rewrite of the callers. See
[`packages/services/AGENTS.md`](packages/services/AGENTS.md).

**No local checks.** Format, lint, typecheck and build belong to Husky, CI and the Vercel preview —
not to a terminal or an agent's context window. Push, then read the result back from the PR's check
runs. `.claude/hooks/block-local-checks.sh` enforces this for agent sessions.

## How work gets done

Through the pipeline, not ad hoc:

```text
scope → design → new/define → build → verify → ship     the spine (one PR from Define onward)
bug | tweak | chore                                     the fast lanes (one merge gate)
```

Five human gates, two of them PR checkboxes — **Spec approved** and **Ready to merge**. An agent
reads them and never ticks them. Start with `/pipeline scope "<topic>"`, or `/pipeline status` to
see where everything stands. The map is [`pipeline/CONTEXT.md`](pipeline/CONTEXT.md).

## Where the rules live

| For…                              | Read                                                     |
| --------------------------------- | -------------------------------------------------------- |
| Code style, design system, git    | [`CONVENTIONS.md`](CONVENTIONS.md)                       |
| Repo identity and routing         | [`CLAUDE.md`](CLAUDE.md)                                 |
| The delivery pipeline             | [`pipeline/CONTEXT.md`](pipeline/CONTEXT.md)             |
| Environment variables and secrets | [`.icm/docs/ENV.md`](.icm/docs/ENV.md)                   |
| Rules for one app or package      | that subtree's `AGENTS.md`                               |
| What the product is and does      | `apps/docs` — business direction and technical reference |

Each rule lives in exactly one of those. If two files say the same thing, one of them is wrong.

[remiai](https://www.remiai.be/) ·
[manus pitch deck](https://remi-ai-ppt-mnnqjh7r.manus.space/) ·
[remiai odoo](https://remiai1.odoo.com/)
