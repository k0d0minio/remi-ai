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

---

## Closing note — the prototype, and what it is for

Built in `apps/demo` and merged to the live demo URL under the Design-stage rules. Nothing outside
`apps/demo/**` and this epic's intake files was touched: no `apps/admin`, no `packages/ui`, no
service, nothing on the patient link.

**Where to look**

- Desktop and medium: <https://remi-demo.jamienisbet.com/practitioner/clients/camille>
- Phone segments (the segment is in the URL): `?vue=suivi` · `?vue=journal` · `?vue=dossier` ·
  `?vue=profil` · `?vue=brief`
- The early case, to check the frame holds on an almost-empty record:
  `/practitioner/clients/pierre`
- Two other records, half-full: `/practitioner/clients/thomas` · `/practitioner/clients/naima`

**Throwaway vs seed: seed.** The section compositions — the shell that drops its frame on a phone,
the homogeneous row list, the archived fold with its count, the section registry the index and the
segments both read — are what `page-frame` re-implements against the real components. It is a
**visual** seed only: `apps/demo` has no services and no auth, so nothing here ports; the mock
record in `apps/demo/lib/mock/workspace.ts` is view-shaped and is not a schema proposal.

**What the prototype proves**

- One tree holds. The thirteen sections render once, on the server, in one DOM order; `lg` places
  that list in a work column beside a sticky rail, `md` stacks it under a scrolling anchor row, and
  a phone shows one segment of it at a time. Nothing is rendered twice for a second screen size,
  and no JS media query decides what the server renders (decision #2). The one piece of state that
  cannot be CSS — the phone segment — lives in the URL and is read server-side, so a shared link
  lands on its segment and the back button restores the previous one.
- The rail, the medium "En bref" fold and the phone's "En bref" segment are one element placed
  three ways, not three blocks.
- Container queries carry the two-column row layouts (essentials, recipes, anamnesis, profile), so
  a section lays itself out from its own width rather than the window's.

**Findings for `page-frame`**

1. **`Card` is not polymorphic.** It renders a `div` and takes no `as`, so a section landmark needs
   a wrapping `<section>` around it. Either the frame keeps that wrapper or `packages/ui` gains an
   `as` prop on `Card` — a `packages/ui` change is out of this stub's remit, so it is recorded here
   rather than made.
2. **A sticky anchor row at `md` needs its own grid slot.** Nested inside the rail element it is
   pinned to a short containing block and unsticks immediately. The prototype ships the medium
   anchor row non-sticky; making it sticky means lifting it out of the rail, which changes the grid,
   so it is a decision for the frame rather than a detail.
3. **The three "queued" sections are no longer queued.** The living summary, the goals with their
   check-ins and the supplement protocol all shipped from `patient-record` (#80, #73, #79). The
   prototype renders thirteen sections, all of them current — `page-frame`'s section registry has no
   "landing later" case to design for. `breakdown.md` is corrected accordingly.
4. **The cut stands.** Prototyping did not resplit the work: `page-frame`, `phone-segments`,
   `history-folds`, `add-surfaces` and `rail-at-a-glance` each still map to a distinct part of what
   was built, in the order the breakdown gives.

**The open questions are still open.** They were raised on the live URL, not answered here. The
prototype shows the provisional set so there is something concrete to react to:

- Segment names and grouping — shown as _En bref · Suivi · Journal · Dossier · Profil_.
- The rail's at-a-glance — shown with all five candidates, in the breakdown's order.
- The recommendation form — shown open on desktop, behind a trigger on the phone, which is what
  today's page does.
- Archived material — folded everywhere, recipes included.
- The sensitive zone — left as the last section.

Whichever way each is answered, the answer belongs in `page-frame`'s spec, not in this prototype.
