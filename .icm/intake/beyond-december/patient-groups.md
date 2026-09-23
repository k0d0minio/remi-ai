# Stub: Patient groups — assign a recipe or a protocol block to several patients at once

- feature-slug: patient-groups
- scope: beyond-december
- personas: practitioner
- initiative: a patient experience validated on real terrain, in time for the December open day / objective: a usable patient version for the partner clinic to test on 1 December
- depends-on: none
- sequence: 5 of 8
- priority: P2
- size: S
- sources: feedback § 2 row 5 ("attribuer directement à un patient ou à un groupe") · decision D-5
  (groups parked; `practitioner-workflow/reuse-and-duplicate` covers reuse one patient at a time)

## Problem

Her « ou à un groupe »: assigning a recipe or a protocol block to several patients at once. Worth it above a handful of patients; `reuse-and-duplicate` covers reuse one patient at a time.

## Proposed change

Her "ou à un groupe", taken literally, once she has enough patients for it to save time:

- A **named group** of patients in the console (a table `patient_groups` + a join), created from
  the roster with checkboxes.
- **Assign to a group**: the assign-recipes surface and the protocol grids' "copy to…" gain a
  group target — one gesture writes one assignment or row set per member, one audit event with
  the count.
- No patient-facing notion of a group; a patient never sees who else is in it.

## Acceptance criteria (rough)

- [ ] Named patient groups in the console, created from the roster with checkboxes (a `patient_groups` table plus a join)
- [ ] The assign-recipes surface and the protocol grids' copy target take a group: one gesture writes one row set per member, one audit event with the count
- [ ] No patient-facing notion of a group

## Out of scope (this feature)

- Groups as a source of truth — removing a patient from a group changes nothing already written

## Notes for Define

- **Decisions that bind** ([`README.md § Decisions of record`](../README.md)): D-5 (groups parked; reuse one patient at a time first).

- Groups are a convenience over per-patient rows, never a source of truth: removing a patient from
  a group changes nothing already written.

**Open for Define** — settled with the operator before the spec is approved, never assumed:

- Whether she wants this before or after `reuse-and-duplicate` proves itself — a group is only
  worth it above a handful of patients.

## Prompt

Run `/pipeline new patient-groups` in the remi-ai repo — **only after the owner has moved this stub onto the live path**. Define reads this stub, its epic's `breakdown.md` and the decisions of record in `.icm/intake/README.md`, and asks the points under **Open for Define** rather than answering them. Scope is the Proposed change and nothing under Out of scope.
