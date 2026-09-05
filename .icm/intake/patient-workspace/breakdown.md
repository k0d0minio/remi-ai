# Epic: patient-workspace — the admin patient page, laid out for the screen it is on

The admin patient page grew, one card at a time, from "a profile and a link" into the whole of
what Morgane does with one patient: link, recommendations, pantry essentials, recipes, meal
journal, learnings, consultations, anamnesis, profile, deletion — seventeen cards today, the last
three of them (living summary, goals and instruction, supplement protocol) landing from
[`patient-record`](../patient-record/breakdown.md) while this epic was being cut. It was cut
phone-first, as one scrolling column, and that was right when it had four cards. It is now a 672px
column of stacked cards on a desktop shell that reserves a 240px sidebar: on a 1440px screen more
than half the width is margin, and on a phone the same stack is seventeen cards deep with an open
form under every list.

This epic re-lays the page — nothing in what it stores, nothing on the patient link — so that it
**uses the whole desktop screen** and **spends phone space on the block she is working in**. It is
the one page Morgane lives in during and between consultations, so both sizes have to be good, not
one adapted from the other.

## What I understood

Jamie's brief (2026-09-03): the page "looks good but on desktop you can tell it is meant for a
phone", and "there is so much stuff on that page now". Research the UI/UX disciplines, design the
page so desktop uses all the available space and phone uses space efficiently, both with
intuitive, well-designed interactions and display surfaces — then write the batch. This is the
batch; the research is recorded below so no stub has to redo it.

## Research — the disciplines the design rests on

Numbered so the stubs can cite them (`R7`, `R23`). Sources are the primary guidance, not blog
summaries of it.

**Layout of a record page**

- **R1** — The standard detail page is a header plus two columns: a primary work column (about
  two thirds) for what changes, a secondary rail for status, metadata and summaries.
  [Polaris resource-details layout](https://polaris-react.shopify.com/patterns/resource-details-layout)
- **R2** — Stripe's customer page: "the primary column contains dynamic information … the
  secondary column contains static information, such as the details and metadata"; common
  actions are promoted to the header. Single-column only when the page has one content focus.
  [Stripe customer page](https://support.stripe.com/questions/updates-to-the-customer-detail-page)
  · [Stripe DetailPage](https://docs.stripe.com/stripe-apps/components/detailpage)
- **R3** — Material's "supporting pane" canonical layout: primary ≈ two thirds, secondary content
  "meaningful only in relation to the primary"; on compact widths the supporting content goes to a
  sheet or below.
  [Material canonical layouts](https://developer.android.com/develop/ui/compose/layouts/adaptive/canonical-layouts)
- **R4** — Linear's fix for "a narrow column on a wide screen": centre the readable content, let
  the properties panel grow with the viewport.
  [Linear issue view layout](https://linear.app/changelog/2021-06-03-issue-view-layout)
- **R5** — Fixed-width grids are for reading pages; "use fluid grids for information-dense pages
  to maximise screen real estate". [Atlassian grid](https://atlassian.design/foundations/grid)
- **R6** — Split views only in a regular-width environment; they collapse to one column on a
  phone. [Apple HIG split views](https://developer.apple.com/design/human-interface-guidelines/split-views)

**Navigating a long record**

- **R7** — Tabs suit content that alternates and never needs side-by-side reading; keep them few,
  labels short — an overflowing tab list "becomes a carousel".
  [NN/g tabs](https://www.nngroup.com/articles/tabs-used-right/)
- **R8** — On desktop, accordions are right only when a reader needs a few sections, not most of
  the page; hiding needed content raises interaction cost.
  [NN/g accordions on desktop](https://www.nngroup.com/articles/accordions-on-desktop/)
- **R9** — On mobile the calculus flips: accordions show the page's structure up front and cut
  scrolling; keep section headings persistent.
  [NN/g mobile accordions](https://www.nngroup.com/articles/mobile-accordions/)
- **R10** — In-page anchor links act as a table of contents; their value rises as the screen
  shrinks; a sticky version must show the current location and never cover the target heading.
  [NN/g in-page links](https://www.nngroup.com/articles/in-page-links/)
- **R11** — A segmented control on a phone holds five segments at most.
  [Apple HIG segmented controls](https://developer.apple.com/design/human-interface-guidelines/segmented-controls)
  · [NN/g mobile navigation](https://www.nngroup.com/articles/mobile-navigation-patterns/)

**Progressive disclosure**

- **R12** — Show what is needed often first; defer the rest to a secondary level with an obvious
  way in. [NN/g progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/)
- **R13** — Cards are for heterogeneous collections; homogeneous items belong in a plain list —
  cards are less scannable and cost space. [NN/g cards](https://www.nngroup.com/articles/cards-component/)
- **R14** — Modal surfaces are for what is critical to continuing; a quick single-field add stays
  inline, a multi-field add earns a sheet.
  [NN/g modal vs nonmodal](https://www.nngroup.com/articles/modal-nonmodal-dialog/)
- **R15** — A pinned action is for the one most common pathway — one action at that level;
  secondary actions go to the header or an overflow.
  [Material FAB](https://developer.android.com/develop/ui/compose/components/fab)
- **R16** — Collapse archived material only when it is genuinely rarely consulted, and say how
  many items are hidden. (Stripe reversed a "hide cancelled" default — R2.)

**Breakpoints, container queries, measure**

- **R17** — Material window size classes: compact < 600, medium 600–839, expanded 840–1199,
  large 1200–1599. Classes derive from the window, never the device.
  [Material window size classes](https://developer.android.com/develop/ui/compose/layouts/adaptive/use-window-size-classes)
- **R18** — Tailwind 4: `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280; container queries
  (`@container`, `@sm`…) let one section lay itself out by its own width — the right tool when
  the same block sits in a wide column or a narrow rail.
  [Tailwind responsive design](https://tailwindcss.com/docs/responsive-design)
- **R19** — Cap prose at 50–75 characters per line (WCAG 1.4.8: ≤ 80). That is the reason to cap
  text measure, never page width. [Baymard line length](https://baymard.com/blog/line-length-readability)

**Density and scent**

- **R20** — Compact density belongs in data-rich views (tables, long forms); avoid it where the
  task is focused input. [Material density](https://m3.material.io/blog/material-density-web)
- **R21** — Inverted pyramid: the most important facts first, so a scanning reader has them in one
  glance. [NN/g inverted pyramid](https://www.nngroup.com/articles/inverted-pyramid/)
- **R22** — A status badge carries an attribute that changes how the reader prioritises or acts —
  never decoration. [Atlassian lozenge](https://atlassian.design/components/lozenge/usage)

**Phone ergonomics**

- **R23** — Three quarters of phone touches are one thumb; the top corners and top edge are the
  worst home for the primary action.
  [Hoober, design for fingers](https://www.uxmatters.com/mt/archives/2017/03/design-for-fingers-touch-and-people-part-1.php)
- **R24** — Targets: WCAG 2.5.8 minimum 24 px, enhanced 44 px; Apple 44 pt; Android 48 dp with 8 dp
  spacing. [WCAG 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- **R25** — Sticky headers cost screen, "particularly acute on mobile": one row, opaque, only if
  needed the whole session. [NN/g sticky headers](https://www.nngroup.com/articles/sticky-headers/)

**Accessibility**

- **R26** — Tabs: `tablist` / `tab` / `tabpanel`, arrow keys between tabs, Tab into the panel.
  [APG tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)
- **R27** — Accordion: a button inside a heading, `aria-expanded` + `aria-controls`; several open
  at once is allowed. [APG accordion](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/)
- **R28** — Honour `prefers-reduced-motion` on sheet and fold animation; a sticky element must not
  hide an anchor target on focus.
  [WCAG 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)

**Clinical charts**

- **R29** — The patient banner: a consistent identification strip so the clinician can verify
  they are in the right record, kept above every view.
  [NHS GP Connect banner](https://developer.nhs.uk/apis/gpconnect-0-7-1/accessrecord_development_html_implementation_guide.html)
- **R30** — The problem list "works as a table of contents of the medical record" — the model for
  what a summary rail holds. [PMC 4970280](https://pmc.ncbi.nlm.nih.gov/articles/PMC4970280/)

## The design — what the batch builds

Three window classes, one tree. The page renders its sections **once, in one DOM order**; each
class is a different _view_ over the same sections, chosen in CSS and one small client island —
never two trees for two screens.

**Desktop (`lg`, ≥ 1024 px — R1, R2, R4, R5).** A full-width page on the `wide` container measure
(88 rem — the token exists in `tokens.css` and nothing in admin uses it yet). A one-row **patient
banner** (R29, R25): pseudonym, status badge, the age · sex · measures line, the copy-link
button, and the page's "Ajouter" menu. It sticks under the shell header. Below it a two-column
grid: a fluid **work column** (≈ 2/3) holding the sections Morgane changes — recommendations,
supplements, pantry, recipes, meal journal, learnings, consultations, anamnesis — and a **rail**
(≈ 20–22 rem, sticky) holding what she reads _about_ the patient: the at-a-glance strip (last
consultation, meals awaiting feedback, active goals, standing instruction), the link's status, the
profile extract with its edit affordance, and, folded, the sensitive zone. Prose inside a section
caps at ~70 ch (R19); the layout does not. A sticky **section index** (R10) sits at the top of the
rail: every section in DOM order, with counts, the current one marked.

**Medium (`md`, 768–1023 px — R3, R10).** Same banner, one column, the rail's blocks fold into a
collapsible "En bref" block under the banner, and the section index becomes a horizontally
scrolling row of anchors under the banner. Sections use container queries (R18) to lay their rows
in two columns where they have the width.

**Phone (< 768 px — R6, R7, R9, R11, R23).** The banner compacts to two lines. A **segmented
control** of at most five segments replaces the stack — provisionally _Suivi · Journal · Dossier ·
Profil_ (+ _En bref_), labels Morgane's to confirm — each showing only its sections; the segment is
in the URL so a link lands on it and back-navigation restores it. Homogeneous rows render as list
rows, not nested cards (R13). Archived material and the sensitive zone are folds at the end of
their segment (R9, R16). One pinned bottom **"Ajouter"** action (R15, R23) opens a bottom sheet
whose first step asks what to add; add forms otherwise live behind the section's own trigger, not
open under every list.

**Every size.** Archived rows fold into their parent section with a count (R16) — four conditional
"archivées" cards disappear. Targets ≥ 44 px on touch (R24). Reduced motion honoured (R28). The
sticky pieces never cover an anchor target (`scroll-margin-top`, R10, R28). All seventeen sections
register in the same list, the three that arrived from `patient-record` included — the registry has
no "landing later" case to design for.

The prototype comes first because a layout is the one thing a stub cannot describe well enough to
approve from a paragraph: Morgane and Jamie approve it from the live demo URL (Design-stage rule),
and every open question below that is a taste call gets answered there, on the thing itself.

## Decisions of record (Jamie, 2026-09-03)

1. **Layout only.** No table changes, no service changes, nothing on `/p/[token]`. A stub that
   finds it needs data the page does not already load is out of its lane — park it.
2. **One tree.** Sections render once in one order; desktop columns, medium single column and
   phone segments are views over that order. No duplicated content per breakpoint, no JS media
   query deciding what to render on the server.
3. **Phone stays a first-class target**, not a fallback — the admin `AGENTS.md` § Interface rule
   is rewritten by `page-frame`, not quietly broken.
4. **The frame is the console's detail-page pattern.** `recipes/[id]`, `account` and `team` adopt
   it later as tweaks — out of this epic.

## Build order

1. `layout-prototype` — the three views on mock data in `apps/demo`, approved from the live demo
   URL; every taste question answered there — depends-on: none
2. `page-frame` — wide container, patient banner, the section registry, desktop two-column grid
   with rail and section index, medium single column with anchor row — depends-on:
   layout-prototype
3. `phone-segments` — the ≤ 5-segment control over the same sections, segment in the URL, compact
   banner — depends-on: page-frame
4. `history-folds` — archived rows fold into their section with a count; homogeneous rows become
   list rows; the sensitive zone folds — depends-on: page-frame
5. `add-surfaces` — add forms behind per-section triggers; inline on desktop, bottom sheet on
   phone; the pinned "Ajouter" on phone — depends-on: phone-segments, history-folds
6. `rail-at-a-glance` — the rail's summary strip and the medium "En bref" fold, from data the page
   already loads — depends-on: page-frame

## Parallelizable

`page-frame` is the trunk. `phone-segments`, `history-folds` and `rail-at-a-glance` are independent
of one another once it lands; `add-surfaces` waits for the first two because it changes both the
phone chrome and the folded sections. If the owner drops `layout-prototype` (move it to `_done/`
with a `> Dropped:` line), `page-frame` starts from the design above and its own open questions
go to the PR preview instead.

## Out of scope (whole epic)

- Any data-layer or service change; anything on the patient link.
- The other detail pages (`recipes/[id]`, `account`, `team`) — decision #4.
- The roster (`/patients`) and its filters.
- A `@remi/ui` "page header" or "section nav" primitive: the compositions start admin-local and
  lift only when a second app needs them (CONVENTIONS § Keeping the codebase lean).
