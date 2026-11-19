# Remi AI — platform

Remi AI's product, with Jamie as the company's CTO. The work pipeline is the BAXTER blueprint
(`.icm/_system/`, version in `.icm/_system/VERSION`, answers in `.icm/.copier-answers.yml`). A
Turborepo monorepo: four Next.js apps over two shared packages. The services package defines
seams, not integrations: storage, email and AI each have an interface and one adapter. This
file is identity and routing only. The rules live once, in the files it points at.

## Apps and packages

| Path                 | Is                                                                                          | Deploys as             |
| -------------------- | ------------------------------------------------------------------------------------------- | ---------------------- |
| `apps/web/`          | the product, signed-in (:3000)                                                              | Vercel `app`           |
| `apps/marketing/`    | the public site, indexable (:3001)                                                          | Vercel `marketing`     |
| `apps/admin/`        | internal operations, operator only (:3002)                                                  | Vercel `admin`         |
| `apps/docs/`         | the reference site, Nextra (:3003)                                                          | Vercel `documentation` |
| `packages/ui/`       | `@remi/ui`, the design system, the only home for primitives                                 | —                      |
| `packages/services/` | `@remi/services`: storage (Neon Postgres, Drizzle), email (Resend), AI (no vendor yet), env | —                      |

The dependency arrow points app → package, only ever. No app imports another app. Stack:
Turborepo 2, pnpm 10, Node 22, Next.js 16, React 19, TypeScript 5 strict, Tailwind CSS 4,
shadcn/ui over Radix, Nextra 4, tsup. Each app is one Vercel project in team `remi21`.

## Routing

@.icm/_system/ROUTER.md

The router has the commands, the stages and the lanes. A ticket is a Linear key of the team
`REM`. The files below belong to this repo.

| You are asked to                                                         | Go to                                                                                                                           |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| write code                                                               | `CONVENTIONS.md` first. Then the subtree's `AGENTS.md` (`apps/<app>/AGENTS.md`, `packages/<package>/AGENTS.md`)                 |
| build or change a screen, a component, a token or text that a user reads | `packages/ui/brand/charte-graphique.md`: Morgane's charter. It wins on identity. The user stories win on function               |
| know what Remi is for, and which account wins                            | `.icm/docs/README.md`: its `braindump/` is Morgane's own material and outranks every other account                              |
| read product knowledge                                                   | `apps/docs/app/technical/**` (architecture), `apps/docs/app/business/**` (direction). `.icm/docs/` still wins where they differ |
| read a decision, the epics or the backlog of before 2026-11-17           | `.icm/intake/README.md`, and `.icm/local/ROUTES.md` for the markdown stubs                                                      |
| add or change an environment variable                                    | `.icm/docs/ENV.md`, the one catalogue of names. Values never enter git                                                          |
| read where the build runs                                                | `.icm/environments.md`, the one home of the addresses                                                                           |
| read the UAT batch, record the client's sign-off, promote, roll back     | `.icm/_system/features/uat.md`, then `.icm/_system/scripts/promote.sh`                                                          |
| change the database, or read where a preview's database comes from       | `.icm/local/database.md`, then `.icm/local/vercel-build.sh`                                                                     |
| do a setup act in Vercel, GitHub or the database provider                | `.icm/setup/`: one file for each act. A person ticks its boxes                                                                  |
| change what CI checks or how a release is cut                            | The blueprint (`~/jarvis_workspace/blueprint/`). `ci.yml`, `promote.yml` and `icm.yml` come from it                             |

## Release

`ci.yml` runs the checks on every push and pull request. Its release job keeps the
release-please pull request open on `main`, and that pull request is the batch. Every merge to
`main` deploys UAT and builds a production deployment that stays staged. Production moves on a
promotion, as `.icm/_system/features/uat.md` says. `admin` and `app` have `uat`. `marketing`
has `uat` and follows `main` (D-37). `documentation` follows `main`. The admin `uat` build
migrates the UAT database (`.icm/local/vercel-build.sh`). No workflow migrates production now:
the production database moves to Postgres 18 at the next promotion (Jamie, 2026-11-17).

## Rules

- Client-facing text in `fr-BE` and `en`. Code, commits and notes in English.
- Technical text (pull request bodies, commits, questions) in Simplified Technical English:
  short active sentences, one instruction each, no semicolons. A question for Jamie is numbered
  and carries a default answer.
- CI is truth: never run build, lint, typecheck, test, format or dev locally. Push, then read
  the `ci` run and the previews. `.claude/hooks/block-local-checks.sh` blocks the commands.
- Secrets never in git: names only, in `.icm/docs/ENV.md` and each app's `.env.example`.
  Values in GitHub or Vercel settings. Flag any plaintext credential found.
- One ticket is one run, one branch and one pull request.
- `main` changes by pull request. Gates are human checkboxes: read them, never tick them.
  Jamie ticks Ready to merge. The Release stage merges.
- A ticket's merge reaches the UAT environment, where the client tests the batch. Production
  moves only on Jamie's word, after the client's sign-off (`.icm/_system/features/uat.md`).
- Linear: BAXTER makes the tickets and moves their states. GitHub is not connected to Linear,
  and this repo has no Linear key. A session in this repo does not write to Linear.
