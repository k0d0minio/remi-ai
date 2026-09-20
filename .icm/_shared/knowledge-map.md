# Knowledge map — what each stage reads, and where (Layer 3 routing, project-owned)

Project knowledge — **what Remi AI is, who it serves, how it is built** — is canonical in the docs
app, `apps/docs/app/` (`docs_path` in `.icm/project.json`). This file is the router: it says which
doc pages each stage reads and writes, so a stage loads a small, named slice instead of the whole
site. That scoping is the whole payoff — **never load "all of the docs app".** Read the `.mdx`
source directly; there is no need to run the site. Every page below is named as `business/<page>`,
`technical/<page>` or `changelog/<entry>` — a path relative to `apps/docs/app/`, where `<path>/page.mdx` is
the page — and `.icm/scripts/validate-knowledge-map.sh` proves each one resolves.

> Code conventions are **not** here — they stay canonical in `CONVENTIONS.md` at the repo root
> plus the subtree `AGENTS.md` files. This map covers product direction and architecture only.

> The **direction of record** is `.icm/docs/` and its precedence order (`.icm/docs/README.md`):
> Morgane's feedback, the direction letter, the call summary, her braindump. The business pages
> restate it for the stages; where one drifts, `.icm/docs/` wins and the page is the thing to fix
> (`knowledge edit`). A page that says a thing is not decided is the answer; a stage does not fill
> the gap by inventing one.

## Where the knowledge lives

### Direction and product — `apps/docs/app/business/`

- `business/initiatives` — the current initiative (a patient experience validated on real
  terrain, in time for the December open day) and the objectives table a spec's Problem ties to
- `business/scope` — the frozen V2 feature list and what is explicitly out of it; a request not
  on it is a question for the owner, not a build
- `business/roles` — the three personas (patient, practitioner, operator): what each sees and may
  change; the `personas` vocabulary in `.icm/project.json`

### Technical reference — `apps/docs/app/technical/`

- `technical/architecture` — the monorepo, the stack, how a request flows (the page a spec's
  `touches:` is filled from)
- `technical/applications` — the six apps, their ports, their boundaries
- `technical/packages` — the ui and services packages: the seams and which entrypoint to import
  (the full rules are in each package's `AGENTS.md`)
- `technical/development` — getting started, the factory, CI/CD, delivery
- `technical/decisions` — the technical decision log: settled choices a spec cites instead of
  reopening

### The changelog — `apps/docs/app/changelog/`

- `changelog/<YYYY-MM-DD>-<slug>` — one page per shipped feature, written by Release (and by a
  bug or tweak lane when the change is user-visible); registered in `changelog/_meta.ts` alone —
  the index `changelog/page.mdx` derives its list from the folder. The shape is
  `.icm/_shared/project-rules.md` → Announcing. A record
  of what shipped — no stage reads it as knowledge.

## What each stage reads / writes

| Stage                     | Reads from docs                                                                                                                                                                                                                                                                                         | Writes to docs                                                                                                                             |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Scope** (incl. the cut) | may read everything — the repo, the docs app, `CONVENTIONS.md`, the `AGENTS.md` files — to check requirements are clear, nothing breaks, and the feature fits what exists; prefers `business/roles` (who), `business/initiatives` (the why-now) and `business/scope` (is it in the build) for vocabulary | — (its artifacts are `.icm/runs/<slug>/01_scope/**` + `.icm/intake/<slug>/`)                                                               |
| **Define**                | `business/initiatives`, `business/scope`, `business/roles`, `technical/architecture` (for `touches:`), `technical/decisions`                                                                                                                                                                           | —                                                                                                                                          |
| **Build**                 | `technical/architecture`, `technical/packages`, `technical/development`, `technical/decisions`; the code rules (`.icm/_shared/conventions.md` → `CONVENTIONS.md`)                                                                                                                                        | —                                                                                                                                          |
| **Release**               | `business/roles` (the audience) · the affected `business/**` or `technical/**` page(s)                                                                                                                                                                                                                 | **updates** the affected page(s) in the same feature PR, and adds the `changelog/` page                                                    |
| **`knowledge` lane**      | this map, then only the page the request names                                                                                                                                                                                                                                                          | **adds / edits / removes** one `business/**` or `technical/**` page in a docs-only PR, and updates this map when a page was added or removed |

Load only the page(s) named for the stage.

## Keeping this map current

- **Changing knowledge outside a Release** — `knowledge add|edit|remove "<what>"`
  (`.icm/lanes/knowledge/CONTEXT.md`) is the one sanctioned way: it routes to the page through
  this map, makes the change under Nextra's own conventions, updates the routing above when a
  page was added or removed, and opens a docs-only PR. A stage that finds a slice stale does not
  work from memory and does not patch the page inside its own PR.
- **Dead paths** — `.icm/scripts/validate-knowledge-map.sh` → `RESULT: OK | INVALID` checks
  that every path this file names exists under `apps/docs/app/`. The Pipeline workflow runs it,
  advisory, on any PR touching `apps/docs/app/business/`, `apps/docs/app/technical/` or this
  file; the `knowledge` lane runs it before opening its PR.

## Also in `.icm/_shared/`

- `project-rules.md` — what is true of this repo: people and gates, the factory, announcing.
- `github.md` — the PR regimes, the GitHub calls, gates, and the label vocabulary.
- `ci.md` — what the checks are and what green means; how `ci-status.sh` reads them.
- `stage-preamble.md` — the one canonical "resolve the run or STOP" procedure.
- `scope-template.md` — the shape of the settled scope Scope writes.
- `conventions.md` — redirect to `CONVENTIONS.md` (code rules; deliberately not in the docs app).
