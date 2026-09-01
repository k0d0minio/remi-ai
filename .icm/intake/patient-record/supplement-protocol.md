# Stub: Supplement protocol — structured rows, and the category overlap settled

- feature-slug: supplement-protocol
- sequence: 6 of 6
- depends-on: none
- priority: P1
- size: M
- sources: v2 brainstorm § G (SUPPLEMENTS) · scope answers 2026-09-01 (breakdown.md § Decisions)

## What this is

§ G gives supplements a minimal but _structured_ display: name, dose if needed, moment of intake
if needed, reason. Today they live in two prose places at once — the `supplements` free-text field
on the profile (what the patient already takes) and, sometimes, recommendations under the existing
`supplement` category (what Morgane prescribes). Neither can render § G's four columns, and the
future safety check ("current medications exist only to secure proposals") needs prescribed
supplements as rows, not sentences.

This stub makes the **prescribed protocol** first-class: per patient, rows with name, dose,
timing, reason — all short text, only name required — ordered, archivable-not-deletable (a stopped
supplement is history, exactly like an archived recommendation). Admin gets a card on the patient
page: the active protocol as a compact table, add/edit/archive inline, archived rows behind a
fold. The patient link will render the active rows in the `patient-surface` epic (§ J: "compléments
validés").

Two boundaries hold the scope down:

- **What the patient already takes stays where it is** — the profile's `supplements` free-text
  field keeps that job and gets relabelled to say so ("compléments déjà pris, hors protocole").
  No migration, no merge.
- **The `supplement` recommendation category is settled, not silently duplicated.** Two homes for
  the same prescription is how the link shows a protocol twice. Recommended resolution: the
  category is retired from the _add_ form (existing rows untouched, still rendered) and the new
  protocol card takes over — but that changes what Morgane's encoding habit, so it is hers to
  confirm, not the build's to assume.

## Worth knowing

- Existing `supplement`-category rows: leave them rendering; offer no automated migration. If
  Morgane wants them moved, she re-encodes the handful by hand — same afternoon-not-script rule
  as `profile-fields`.
- Vocabulary/labels per the usual homes; writes audit via `lib/audit.ts`.

## Open questions — flag these on pickup

- The overlap resolution above: retire the `supplement` category from the add form, or keep both
  homes with a documented split (category = one-off advice, protocol = standing regimen)?
  Morgane's call — flag before building the form change.
- Does she want a start date per row (visible "depuis octobre"), or is created-at enough?

## Prompt

Run `/pipeline new .icm/intake/patient-record/supplement-protocol.md` in the remi-ai repo and
follow the pipeline from there. Read the stub and its epic's `breakdown.md` first. Scope: a
per-patient prescribed-supplement table (name, dose, timing, reason; ordered; archive-not-delete)
with migration and service behind the seam, a protocol card on the admin patient page, the
profile's free-text field relabelled to "already taking", and the `supplement` recommendation
category overlap resolved per Morgane's answer to the stub's first open question — raise it, don't
assume it. Nothing renders on the patient link in this stub.
