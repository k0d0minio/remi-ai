# Remi AI — platform

Remi AI's product, built by Legible Consulting with Jamie as the company's CTO, and tracked
against `legible-consulting/blueprint` (tier `platform`) through `.copier-answers.yml`. A
Turborepo monorepo: six Next.js apps over two shared packages. The services package defines
seams, not integrations: storage, email and AI each have an interface and one adapter. This
file is identity and routing only. The rules live once, in the files it points at.

## Apps and packages

| Path | Is | Deploys as |
|---|---|---|
| `apps/web/` | the product, signed-in (:3000) | Vercel `app` |
| `apps/marketing/` | the public site, indexable (:3001) | Vercel `marketing` |
| `apps/admin/` | internal operations, operator only (:3002) | Vercel `admin` |
| `apps/docs/` | the reference site, Nextra (:3003) | Vercel `documentation` |
| `apps/support/` | the public help centre (:3004) | Vercel `support` |
| `apps/demo/` | the prototype sandbox, mock data only (:3005) | Vercel `demo` |
| `packages/ui/` | `@remi/ui`, the design system, the only home for primitives | — |
| `packages/services/` | `@remi/services`: storage (Neon Postgres, Drizzle), email (Resend), AI (no vendor yet), env | — |

The dependency arrow points app → package, only ever. No app imports another app. Stack:
Turborepo 2, pnpm 10, Node 22, Next.js 16, React 19, TypeScript 5 strict, Tailwind CSS 4,
shadcn/ui over Radix, Nextra 4, tsup. Each app is one Vercel project in team `remi21`.

## Routing

| You are asked to | Go to |
|---|---|
| build the next ticket, or any ticket | `.icm/intake/CONTEXT.md` (the loop), then the stub |
| open, fill or finish a pull request | `.github/pull_request_template.md`. The gates sit at its top |
| plan new work | `.icm/intake/CONTEXT.md` (an epic with a breakdown), never a loose list. `.icm/intake/README.md` holds the epics in order and the decisions of record |
| write code | `CONVENTIONS.md` first: code style, design-system rules, leanness, git. Then the subtree's `AGENTS.md` (`apps/<app>/AGENTS.md`, `packages/<pkg>/AGENTS.md`) |
| know what Remi is for, and which account wins | `.icm/docs/README.md`: its `braindump/` is Morgane's own material and outranks every other account. `remi-status-report.html` is the plan derived from it |
| read product knowledge | `apps/docs/app/technical/**` (architecture), `apps/docs/app/business/**` (direction). `.icm/docs/` still wins where they differ |
| add or change an environment variable | `.icm/docs/ENV.md`, the one catalogue of names. Values never enter git |
| change what CI checks | `legible-consulting/.github` (`check-client.yml`). `ci.yml` here only calls it |
| change a file the blueprint renders | the blueprint, then `copier update` here |

## Release

`ci.yml` runs the client checks on every push and pull request. `quality.yaml` is this
repo's own advisory job: lint, typecheck and tests on a ready pull request, never required.
`release.yaml` runs on the merge of a pull request to `main`: the merge is the production
release, and the job announces it (a GitHub Release and Slack, named in `.icm/project.json`).
There is no UAT environment. Jamie merges.

## Rules

- Client-facing text in `fr-BE` and `en`. Code, commits and notes in English.
- Technical text (stubs, pull request bodies, commits, questions) in Simplified Technical
  English: short active sentences, one instruction each, no semicolons. A question for Jamie
  is numbered and carries a default answer.
- CI is truth: never run build, lint, typecheck, test, format or dev locally. Push, then read
  the `ci` run and the previews. `.claude/hooks/block-local-checks.sh` blocks the commands.
- Secrets never in git: names only, in `.icm/docs/ENV.md` and each app's `.env.example`.
  Values in GitHub or Vercel settings. Flag any plaintext credential found.
- One ticket is one branch and one pull request. The pull request moves the stub to `_done/`.
- `main` changes by pull request, squash-merged. Gates are human checkboxes: read them, never
  tick them. The merge is Jamie's.
- `apps/demo` is mock data only. Prototyping belongs there.
