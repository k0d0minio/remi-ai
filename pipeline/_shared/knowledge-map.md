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

### Technical reference — `apps/docs/app/technical/`

- `architecture/` — repository structure, technology stack, how a request flows
- `applications/` — the five apps, their ports, their boundaries
- `packages/` — `@remi/ui` and `@remi/services`, and which entrypoint to import
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
