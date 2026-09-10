# Stub: Patient groups — assign a recipe or a protocol block to several patients at once

- feature-slug: patient-groups
- sequence: 5 of 6
- depends-on: none
- priority: P2
- size: S
- sources: feedback § 2 row 5 ("attribuer directement à un patient ou à un groupe") · decision #5
  (groups parked; `practitioner-workflow/reuse-and-duplicate` covers reuse one patient at a time)

## What this is

Her "ou à un groupe", taken literally, once she has enough patients for it to save time:

- A **named group** of patients in the console (a table `patient_groups` + a join), created from
  the roster with checkboxes.
- **Assign to a group**: the assign-recipes surface and the protocol grids' "copy to…" gain a
  group target — one gesture writes one assignment or row set per member, one audit event with
  the count.
- No patient-facing notion of a group; a patient never sees who else is in it.

## Worth knowing

- Groups are a convenience over per-patient rows, never a source of truth: removing a patient from
  a group changes nothing already written.

## Open questions — flag these on pickup

- Whether she wants this before or after `reuse-and-duplicate` proves itself — a group is only
  worth it above a handful of patients.

## Prompt

Run `/pipeline new .icm/intake/beyond-december/patient-groups.md` in the remi-ai repo and follow
the pipeline from there — only after the owner has moved this stub onto the live path. Read the
stub and its epic's `breakdown.md` first. Scope: named patient groups in the console, and a group
target on recipe assignment and protocol copy that writes per-member rows in one audited gesture.
Raise the stub's open question rather than answering it.
