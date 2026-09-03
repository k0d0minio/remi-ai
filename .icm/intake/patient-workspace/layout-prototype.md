# Stub: Layout prototype — the three views, approved from the live demo

- feature-slug: layout-prototype
- sequence: 1 of 6
- depends-on: none
- priority: P1
- size: M
- sources: breakdown.md § The design · § Research R1–R30 · `pipeline/stages/02_design/CONTEXT.md`
  · `apps/demo/AGENTS.md`

## What this is

The whole epic is a layout, and a layout is the one thing a paragraph cannot get approved: the
Design stage exists so the owner reviews "the real deployed thing, never a screenshot". This stub
builds the patient page's three views in `apps/demo` on mock data, ships them to the live demo
URL through the demo-PR loop, and collects the taste decisions on it before a line of admin
changes.

What the prototype shows, in one route (`/practitioner/clients/<id>` already exists in the demo —
rebuild it as this page rather than adding a second):

- **Desktop ≥ `lg`** — `wide` container, sticky one-row patient banner, work column + sticky rail
  with the section index and the at-a-glance strip (R1, R2, R10, R29).
- **Medium `md`** — one column, the "En bref" fold under the banner, the horizontally scrolling
  anchor row (R3, R10).
- **Phone** — the two-line banner, the ≤ 5-segment control with the segment in the URL, list rows
  instead of nested cards, folds for archived material, the pinned "Ajouter" bottom action opening
  a bottom sheet (R7, R11, R13, R15, R23).

The mock patient carries every section the real page has **and** the three still queued in
`patient-record` (living summary, goals with check-ins, supplement protocol), each populated
realistically, with archived rows in at least two of them — an empty prototype approves nothing.

## Worth knowing

- Primitives from `@remi/ui` only (`Tabs`, `Sheet`, `Accordion`, `Container`, `Card`, `Badge`,
  `Typography`); tokens, never palette classes. A variant the design needs and the package lacks
  is added to `packages/ui` with the demo as its consumer — that is allowed; a local primitive is
  not.
- One tree. The demo proves the "views over one DOM order" rule (decision #2) rather than three
  page files — if it cannot be done that way in the sandbox, that is a finding for `page-frame`.
- Container queries are native Tailwind 4 (`@container` / `@md:`) — no plugin.
- The stage rule applies: demo PRs touch `apps/demo/**` (plus this epic's intake files) only, may
  merge autonomously when CI is green, and each is recorded. Declare **throwaway vs seed** in the
  closing note — expect _seed_: the section compositions are what `page-frame` re-implements
  against the real components.

## Open questions — flag these on pickup

Collected on the live URL, not answered in the demo:

- **Segment names and grouping.** Provisional: _Suivi_ (link, summary, goals, recommendations,
  supplements, pantry, recipes) · _Journal_ (meals, learnings) · _Dossier_ (consultations,
  anamnesis) · _Profil_ (profile, sensitive zone). French labels are Morgane's — show the
  provisional set, collect hers.
- **What she wants in the rail at a glance** — last consultation, meals awaiting feedback, active
  goals, the standing instruction, link last opened: which of these, in what order?
- **The recommendation form.** Today it is always open because encoding a protocol is the most
  frequent act on the page. Does it stay open on desktop, or join the other adds behind a trigger?
- **Archived material** — folded by default everywhere (R16), or visible by default for recipes,
  whose history is "the record of adaptations, not a bin"?
- **The sensitive zone** — folded in the rail, or in the "Ajouter"-menu's overflow, or left as a
  last section?

## Prompt

Run `/pipeline new .icm/intake/patient-workspace/layout-prototype.md` in the remi-ai repo and
follow the pipeline from there. Read the stub and its epic's `breakdown.md` first — the breakdown
holds the research and the design; do not redo either. Scope: the admin patient page's three views
(desktop two-column with rail, medium single column, phone segments) prototyped in `apps/demo`
only, on realistic mock data covering every current and queued section, shipped to the live demo
URL via demo PRs under the Design-stage rules, with a closing throwaway-vs-seed declaration.
Nothing outside `apps/demo/**` and this epic's intake files. Raise the stub's open questions on
the live URL rather than answering them in the prototype.
