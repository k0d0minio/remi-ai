# REMI-021 · Smart supplement journal and micro-action tracking

|                |                                                                            |
| -------------- | -------------------------------------------------------------------------- |
| Status         | ready once REMI-013 and REMI-018 land                                      |
| **Type**       | feature                                                                    |
| **Priority**   | P1 — the adherence signal the terrain phase's validation gate reads        |
| **Size**       | A week                                                                     |
| **Depends on** | REMI-014, REMI-018                                                         |
| **Blocked by** | —                                                                          |
| **Sources**    | Status report Phase C bullet 4 · `.icm/docs/braindump/roadmap/features.md` |

## Problem statement

Two things that look like features and are really the adherence data layer — what tells Morgane,
and the 1 Dec validation gate, whether REMI actually helps patients apply their recommendations.

The **supplement journal** existed in v1 and is one of the few things worth carrying forward in
spirit: daily tracking, reminders, observance. The braindump asks for it to get smarter — adapted
reminders, better observance, and standardisation across practitioners, since a patient may follow
protocols from more than one.

**Micro-action tracking** is the adherence signal itself. Every micro-action completed, skipped or
marked difficult is what the terrain phase's validation gate reads — _que REMI les aide à mieux
appliquer leurs recommandations_ — and what the parked practitioner views (REMI-023 and kin, in
`_done/` as parked) would later be rebuilt on. Without it there is no evidence, only impressions.

## Required steps

1. Supplement journal: what to take, when, taken/missed, with reminders that adapt rather than
   nagging at a fixed hour.
2. Standardise the supplement model across practitioners so two protocols do not produce two
   incompatible representations.
3. Micro-action tracking: done, skipped, or difficult — and _why it was difficult_, which is the
   part the practitioner actually needs.
4. Make the difficulty signal cheap to give. A patient who has to write a paragraph will write
   nothing.
5. Surface it all in the patient's own view of progress — the patient is the phase-1 reader;
   Morgane reads it through the admin.

## Open questions — flag these on pickup

- **Do reminders need push notifications?** Same open question as REMI-020, and it should be
  answered once for both.
- **Is there a supplement reference database?** Free text invites drift; a catalogue means sourcing
  and maintaining one. v1 used free-form entries and it showed.
- **What counts as adherence?** The practitioner view will show an adherence figure; how it is
  computed is a product decision with clinical weight, not an implementation detail.
- **Can a patient follow two practitioners?** The braindump's standardisation goal implies yes;
  REMI-014's access model has to agree.

## Acceptance criteria

- [ ] A patient can record supplements and receive reminders that adapt to their behaviour.
- [ ] Supplements are represented the same way regardless of which practitioner prescribed them.
- [ ] Micro-actions can be marked done, skipped or difficult in one tap, with an optional reason.
- [ ] The adherence signal is queryable (Morgane via the admin now; the parked practitioner views
      later), and how it is computed is written down.

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md and CONVENTIONS.md, then .icm/docs/braindump/
roadmap/features.md ("Journal de compléments intelligent", "Système de micro-actions") and
developpement-produit/fonctionnalites.md.

Task: build the supplement journal and micro-action tracking.
1. Supplement tracking with adaptive reminders and a model that is the same across practitioners.
2. Micro-action tracking: done / skipped / difficult, plus an optional cheap-to-give reason. One
   tap must be enough; anything heavier gets no data.
3. Make the adherence signal queryable — the terrain validation reads it now, and the parked
   practitioner views will later — and write
   down how adherence is computed.
4. Show progress to the patient — they are the phase-1 reader; Morgane reads via the admin.
Read .icm/docs/history/v1-report.md section 6.4 for the allergen/intolerance model, which is still
live doctrine. Do not run build/lint/typecheck/format locally. Push a branch, open a PR, git mv
this ticket into .icm/intake/_done/, and raise the "what counts as adherence" question explicitly —
it has clinical weight and is not the agent's to settle.
```
