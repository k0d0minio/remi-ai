# Stub: Priority goals and the standing instruction — the practitioner's steering

- feature-slug: goals-and-instruction
- sequence: 4 of 6
- depends-on: none
- priority: P1
- size: M
- sources: v2 brainstorm § D (PRIORITY_GOALS) + § E (PRACTITIONER_INSTRUCTION) · scope answers
  2026-09-01 (breakdown.md § Decisions, #2)

## What this is

Two blocks in one stub because they are the same gesture — Morgane steering the accompaniment —
and § D is the one place the brainstorm gives exact rules:

**Priority goals (§ D).** Per patient: a goal in her words ("Améliorer l'énergie"), a priority
order, **2–3 active maximum**, an optional simple starting point ("énergie 3/10"), and an
evolution trail. The evolution is the manual seed of the PROGRESS block: at a follow-up she
records a check-in per goal — mieux / stable / moins bien, or the simple measure, plus an optional
note — and the trail of check-ins is the goal's history. Goals archive rather than delete (same
philosophy as recommendations: "why did we stop" is answered by a row). The free-text `objective`
on the profile stays: it is the narrative; goals are the working structure.

**Standing instruction (§ E).** A short free-text consigne per patient — "Priorité énergie et
anti-inflammatoire, peu de changements la première semaine". Today it is inert storage plus a
visible reminder-to-self on the patient page; in the AI round it becomes the generation prompt's
practitioner line. Storing it now is deliberate (decision #2: all blocks, manual-first) — and it
lets Morgane discover what she actually writes in it before any AI reads it. Keep superseded
instructions legible (archive on replace), since "what was I steering by in October" is history
worth keeping.

Admin: one card on the patient page — goals with priority and latest check-in at a glance, the
instruction beneath. Patient link: § J includes the objectives in patient output, but that render
is the `patient-surface` epic's; nothing patient-facing changes here.

## Worth knowing

- Enforce "2–3 active" the way the operator rules enforce the last owner: the service refuses a
  fourth active goal, the UI never offers it.
- Check-in vocabulary (mieux / stable / moins bien) is domain vocabulary → constants in
  `packages/services/src/shared/`, labels in admin `vocabulary.ts`.
- All writes audit via `lib/audit.ts`.

## Open questions — flag these on pickup

- Check-in scale: is mieux / stable / moins bien enough, or does Morgane want the optional numeric
  measure (3/10) as a first-class field rather than folded into the note?
- Hard cap at 3 active goals, or warn-but-allow? § D says "2–3 maximum" — confirm she wants the
  refusal.
- Instruction: does she want one standing consigne (replace + archive), or a dated log of several
  concurrent ones? § E calls it "ponctuelle", which leans standing-and-replaced.

## Prompt

Run `/pipeline new .icm/intake/patient-record/goals-and-instruction.md` in the remi-ai repo and
follow the pipeline from there. Read the stub and its epic's `breakdown.md` first. Scope: per-
patient priority goals (2–3 active, ordered, optional baseline, archive-not-delete) with per-goal
dated check-ins, plus a standing free-text practitioner instruction that archives on replace —
tables + migrations, services behind the seam, one card on the admin patient page, nothing on the
patient link. Raise the stub's open questions rather than answering them.
