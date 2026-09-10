# Stub: Consultation update — one screen after the consultation, one save, a few minutes

- feature-slug: consultation-update
- sequence: 5 of 6
- depends-on: at-a-glance-page
- priority: P1
- size: M
- sources: feedback § 4 (quick action "Nouvelle consultation" · "ce qu'il faut préparer pour la
  prochaine consultation") · § 9.2 · product rule ("quelques minutes") · § 2 row 3 (the interface
  follows comprendre → décider → agir → suivre) · V2 explication (raw notes, autosave, history) ·
  `apps/admin/components/patients/{note-timeline,goal-check-in-form,instruction-block,summary-block}.tsx`

## What this is

After a consultation Morgane updates five things: the note, each goal's check-in, the consigne of
the week, the living summary, and what to prepare next time. Today those are five cards in five
places with five saves. This stub is the "Nouvelle consultation" quick action from the at-a-glance
page: **one screen, in her workflow's order, one save**.

1. **Comprendre** — the note: date (today), title, body. Free text, autosaved as a draft while she
   types (the V2 explication's raw-notes zone; her notes are the source the AI round's
   `summary-draft` reads). Kept forever, never replaced by anything generated.
2. **Décider** — each active goal with its check-in fields inline (direction, measure, note); the
   instruction textarea with the current one prefilled (saving a changed text supersedes, as
   today); a "revise the summary" textarea with the current summary prefilled.
3. **Agir** — links, not forms: the recommendation, supplement and essentials grids open in edit
   mode from here (`bulk-entry`) and return to this screen.
4. **Suivre** — "à préparer pour la prochaine consultation": the field `at-a-glance-page` added,
   edited here.

One save writes the note, the check-ins that changed, the instruction if changed, the summary if
changed, the prep text — one transaction, one audit event listing what changed — and returns to the
at-a-glance page, which now reads as updated.

## Worth knowing

- Every write already has a service and an action; this stub composes them behind one action and
  one transaction. The individual cards keep working for the between-consultation edit.
- Draft autosave: local (`localStorage` keyed by patient) is enough for the beta and needs no
  table; say so. Losing a note to a closed tab is the failure this prevents.
- The summary's history: today it is one living row revised in place. If she wants "what it said
  at the last consultation", that is a history table — flag it, do not add it here.

## Open questions — flag these on pickup

- Does she write the note during the consultation (phone, live) or after (desk)? Both work; the
  autosave matters far more for the first.
- Should the screen also archive recommendations she marks "fait" in passing, or is that the
  grid's job?

## Prompt

Run `/pipeline new .icm/intake/practitioner-workflow/consultation-update.md` in the remi-ai repo
and follow the pipeline from there. Read the stub, its epic's `breakdown.md` (§ Decisions binds)
and the `at-a-glance-page` run's notes first. Scope: a "Nouvelle consultation" screen reached from
the at-a-glance page — note with local draft autosave, goal check-ins inline, instruction and
summary revision prefilled, next-consultation prep, links into the protocol grids — saved as one
transaction and one audit event, returning to the at-a-glance page. No AI, nothing on the patient
link. Raise the stub's open questions rather than answering them.
