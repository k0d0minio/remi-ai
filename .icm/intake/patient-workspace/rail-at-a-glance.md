# Stub: The rail at a glance — the patient's problem list, from data the page already loads

- feature-slug: rail-at-a-glance
- sequence: 6 of 6
- depends-on: page-frame
- priority: P1
- size: S
- sources: breakdown.md § The design · R2, R21, R22, R30 · `layout-prototype` sign-off (what she
  wants at a glance)

## What this is

`page-frame` gives the desktop a rail and fills it with what already existed (the link, the profile,
the sensitive zone). This stub makes the rail worth the width: an **at-a-glance strip** at its
top — the EHR's problem list (R30), the inverted pyramid's first paragraph (R21) — so a consultation
opens on the facts before the sections:

- last consultation date, with a link to the note;
- meals awaiting feedback, as a count that is a link to the journal (the count already loads —
  `countMealEntriesAwaitingFeedback`);
- active goals with their latest check-in, and the standing instruction — once
  `goals-and-instruction` ships; the strip has a documented slot for them, rendering nothing
  until then;
- the link's last-opened date (already on the patient) and, if never opened, that fact, as a
  badge only where it changes what she does (R22).

On `md` the same strip is the "En bref" fold under the banner (open by default — it is short); on
the phone it is the first thing in the first segment.

The strip is derived entirely from data the page already fetches (decision #1); an item that
needs a new query is out of this stub. Nothing on the patient link.

## Worth knowing

- The strip is a server component: it takes the already-loaded lists and counts as props and
  renders a definition list; no island needed.
- Container queries let the strip be a two-column grid in the `md` fold and a single column in
  the rail (R18).
- Badges use the intent vocabulary (`warning` for "meals awaiting feedback", `neutral` for the
  rest) — never a colour class.

## Open questions — flag these on pickup

- Which items, in what order — the prototype collected Morgane's answer; carry it. If it was
  dropped: the four above in that order, and say so.
- "Never opened" as a warning badge, or as plain text? It matters only if she acts on it.

## Prompt

Run `/pipeline new .icm/intake/patient-workspace/rail-at-a-glance.md` in the remi-ai repo and
follow the pipeline from there. Read the stub, its epic's `breakdown.md` and the `page-frame` run's
notes first. Scope: a server-rendered at-a-glance strip at the top of the desktop rail (the
"En bref" fold on `md`, first in the first segment on the phone) showing last consultation, meals
awaiting feedback, link last opened, and a documented slot for goals and the standing instruction
— all from data the page already loads; badges with the intent vocabulary. No new queries, no
data or service change, nothing on the patient link. Raise the stub's open questions rather than
answering them.
