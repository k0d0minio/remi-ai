# Knowledge map (Layer 3 routing)

Project knowledge — **what Remi AI is, who it serves, how it's built** — is canonical in the docs
app (`apps/docs`). This file is the router: it says which doc pages each stage reads and writes, so
a stage loads a small, named slice instead of the whole site. That scoping is the whole payoff —
**never load "all of `apps/docs`".**

Read the `.mdx` source under `apps/docs/app/` directly; there is no need to run the site. Business
knowledge lives under `app/business/`, technical reference under `app/technical/`.

> Code conventions are **not** here — they stay canonical in [`/CONVENTIONS.md`](../../CONVENTIONS.md)
> plus the subtree `AGENTS.md` files. This map covers product direction and architecture only.

## Where things live in the docs

### Direction and product — `apps/docs/app/business/`

- `initiatives/` — the strategy a feature ladders up to, and the current objectives
- `roles/` — who the product serves, what each role sees, and what they can change

Both are written. Quote them rather than paraphrasing — Ship takes its initiative tie-in verbatim
from `initiatives/`, and a spec that contradicts `roles/` contradicts a documented decision right,
not an opinion. Where a page says a thing is not decided, that is the answer; a stage does not fill
the gap by inventing one.

> **These pages are outranked.** They were written before Morgane's braindump landed
> (18 August 2026), and some of what they state — notably the pilot's pricing and dates — came from
> demo fixture data and was never true. The source of truth for direction is
> [`.icm/docs/braindump/`](../../.icm/docs/braindump/), with the plan in
> [`.icm/docs/remi-status-report.html`](../../.icm/docs/remi-status-report.html). Where the two
> disagree, `.icm/docs/` wins and the docs page is the thing to fix. Reconciling them is an open
> intake ticket.

### Technical reference — `apps/docs/app/technical/`

- `architecture/` — repository structure, technology stack, how a request flows
- `applications/` — the six apps, their ports, their boundaries
- `packages/` — `@remi/ui` and `@remi/services`: the build units, the seams, and which entrypoint
  to import (the full rules live in each package's `AGENTS.md`, which the page points at)
- `development/` — getting started, the factory, CI/CD, delivery
- `decisions/` — the technical decision log: set choices a spec cites instead of reopening

## What each stage reads and writes

| Stage      | Reads from docs                                                                                                  | Writes to docs                                                                                                          |
| ---------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Scope**  | `business/roles`, `business/initiatives` — the who and the why-now                                               | — (its artifacts are `scope.md` + `pipeline/intake/<slug>/`)                                                            |
| **Design** | `business/roles` for the lens; `technical/applications` for what `apps/demo` may do                              | —                                                                                                                       |
| **Define** | `business/initiatives`, `business/roles`, `technical/architecture` (for `touches:`), `technical/decisions`       | —                                                                                                                       |
| **Build**  | `technical/architecture`, the relevant `technical/packages` page, `technical/development`, `technical/decisions` | —                                                                                                                       |
| **Verify** | — (works from the spec, the diff, and its own contract)                                                          | —                                                                                                                       |
| **Ship**   | `business/initiatives` (the ship note's tie-in) + the page(s) the change affects                                 | **updates** the affected `technical/**` and `business/**` page(s), in the same feature PR, and adds the changelog entry |

Load only the page(s) named for the stage.

## Also in `_shared/`

- `github.md` — the two PR regimes, the CLI calls, the gates, the label vocabulary.
- `stage-preamble.md` — the one canonical "resolve the run or STOP" procedure.
- `conventions.md` — a redirect to `/CONVENTIONS.md`.
