# apps/docs — app rules (Layer 3 delta)

The global rules in [`/CONVENTIONS.md`](../../CONVENTIONS.md) still apply. This file holds only
what is specific to this app.

## What this app is

The canonical reference for **what Remi AI is and how it is built**. Nextra 4, MDX, no Tailwind
pass of its own — `nextra-theme-docs` brings its own styling, and keeping the docs site off the
product design system is deliberate: it is reference material, not product surface.

## Two halves, and the split is load-bearing

| Under            | Holds                                          | Read by                        |
| ---------------- | ---------------------------------------------- | ------------------------------ |
| `app/business/`  | direction, initiatives, roles                  | Scope, Define, Ship            |
| `app/technical/` | architecture, applications, packages, workflow | Build, Ship                    |

`pipeline/_shared/knowledge-map.md` routes each stage to a **named page**, not to "the docs" — that
scoping is what keeps a stage's context small. When you add a page, add its row to the knowledge
map, or no stage will ever find it.

## What does not live here

**Code conventions.** They are canonical in `/CONVENTIONS.md` and the per-subtree `AGENTS.md`
files. Documenting a rule in both places guarantees the two disagree eventually.

## Writing

- Sentence case headings. Present tense. Say what is true today, not what is planned — a roadmap
  item goes under business/initiatives, clearly marked.
- Tables for anything referenceable; prose for reasoning.
- Every page states what it is for in its first two lines, so a stage loading it knows immediately
  whether it has the right page.
- A page that has not been written yet says so plainly, in a blockquote, and describes the shape it
  should take. A confidently-worded empty page is worse than an honest gap.

## Keeping it true

Ship updates the affected pages **in the feature PR**, not afterwards. Documentation that lags the
product is documentation nobody trusts, and untrusted docs get re-derived from the code every time
— which is the cost this site exists to remove.

## Archive

`archive/` holds completed pipeline runs once they are moved off `pipeline/runs/`. Unlisted, not in
navigation, never canonical — the durable paper trail, nothing more.
