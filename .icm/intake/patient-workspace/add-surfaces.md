# Stub: Add surfaces — forms behind triggers, inline on desktop, a bottom sheet on the phone

- feature-slug: add-surfaces
- sequence: 5 of 6
- depends-on: phone-segments, history-folds
- priority: P1
- size: M
- sources: breakdown.md § The design · R12, R14, R15, R23, R24, R28 · `layout-prototype` sign-off
  (the recommendation form)

## What this is

Today an add form sits open under every list: recommendations, essentials, recipes, meals,
observations. On a phone that is five forms' worth of scrolling between the blocks she reads. This
stub makes adding a **gesture with one shape** across the page:

**Per section — a trigger.** Each section that takes new rows gets an "Ajouter …" button in its
header. On `md` and up it opens the section's existing form **inline at the top of the section**
(the `NoteTimeline` pattern, generalised) and closes it on success. Below `md` the same trigger
opens the form in a **bottom sheet** (`Sheet side="bottom"` from `@remi/ui`) — the form
component is the same; only the surface differs (R14). Single-field adds — an essential is item +
why, two fields — may stay inline on both sizes if the prototype preferred it; multi-field adds
(recommendation, meal, note, observation) go behind the trigger.

**Page-level — one pinned action on the phone (R15, R23).** A bottom-pinned "Ajouter" button,
thumb-reachable, opens a sheet whose first step lists what can be added (recommendation, essential,
recipe, meal, observation, note — at most the groups' add targets, never more than fits without
scrolling), then shows that form. It is the one action at that level; everything else stays in
the sections. On desktop the same list is the banner's "Ajouter" menu (`DropdownMenu`), which
scrolls to the section and opens its inline form.

**The recommendation form.** Its comment says it is always open because encoding a protocol is
the most frequent act on the page, often several entries in a row. The prototype settles whether
that survives: open-by-default on desktop (the trigger reads "Fermer"), behind the trigger on the
phone, is the recommended compromise.

## Worth knowing

- The forms are already client components with `useActionState`; the sheet wraps them, it does
  not rewrite them. After a successful add the sheet closes and the new row is visible where it
  landed — the server action's `revalidatePath` already re-renders the section.
- Focus: opening moves focus to the first field; closing returns it to the trigger. Radix `Sheet`
  does this for the sheet; the inline expansion must do it by hand.
- Reduced motion on the sheet (R28); 44 px on the pinned action and the sheet's list (R24); the
  pinned bar sits above the safe area (`pb-[env(safe-area-inset-bottom)]`).
- The pinned bar must not cover the last section's rows: the page gets bottom padding equal to the
  bar's height below `md`.

## Open questions — flag these on pickup

- The recommendation form's default on desktop — carry the prototype's answer; if unanswered,
  open-by-default with a "Fermer" toggle, and say so.
- Essentials inline on both sizes, or behind the trigger like the rest? Consistency argues
  trigger; two fields argue inline (R14).
- The pinned action's list: does Morgane want "note de consultation" in it, or is that a
  desk-only act?

## Prompt

Run `/pipeline new .icm/intake/patient-workspace/add-surfaces.md` in the remi-ai repo and follow
the pipeline from there. Read the stub, its epic's `breakdown.md` and the `phone-segments` and
`history-folds` runs' notes first. Scope: every section's add form moves behind an "Ajouter"
trigger in its header — inline at the top of the section on `md` and up, a bottom sheet below —
plus one pinned bottom "Ajouter" action on the phone (and the banner's "Ajouter" menu on desktop)
that picks what to add and opens that form; existing form components reused, focus managed,
reduced motion and 44 px targets honoured. Layout only — no data, service or patient-link change.
Raise the stub's open questions rather than answering them.
