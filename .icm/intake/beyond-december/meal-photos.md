# Stub: Meal photos — a photo on a meal entry, through the files seam

- feature-slug: meal-photos
- scope: beyond-december
- personas: patient
- initiative: a patient experience validated on real terrain, in time for the December open day / objective: the patient loop working end to end for one real patient
- depends-on: none
- sequence: 4 of 8
- priority: P2
- size: M
- sources: feedback § 8 "Vision finale" ("reconnaître automatiquement un repas depuis une photo")
  · brainstorm § 5 (photo / repas réel) · decision D-12 (text-only stands) ·
  `_done/patient-surface/_done/meal-journal.md` ("photos become an additive migration")

## Problem

The loop Morgane ran on WhatsApp was photos; the journal is text by decision (D-12). The vendor question is answered — Vercel Blob behind a files seam (D-18, built by `patient-loop/patient-documents-and-links`) — so this stub is no longer blocked, only parked. Her « vision finale » reads a meal from a photo.

## Proposed change

The loop Morgane ran on WhatsApp was photos; the journal is text by decision, and the meal-entry
control is text. When the owner picks a vendor:

- A **files seam** in `packages/services` (interface, `registerFileStore()`, one adapter) — the
  fourth seam, same shape as the other three.
- A **photo on a meal entry**: the patient attaches one from the phone camera on « J'ai mangé »;
  stored privately, served through a signed URL, deleted with the entry and with the patient
  (RETENTION updated).
- **Recognition** (her vision): the photo goes to a vision-capable model to produce the
  description text the suggestion call already takes — the photo becomes an input to
  `meal-suggestions`, not a new capability. Whether a vision model behind the gateway suffices is checked at
  pickup.

## Acceptance criteria (rough)

- [ ] A files seam in the services package (interface, registration, one adapter), the fourth seam
- [ ] A photo on « J'ai mangé » from the phone camera, stored privately, served through a signed URL, deleted with the entry and with the patient; RETENTION updated
- [ ] The photo becomes an input to the existing meal-suggestion call through a vision-capable model — not a new capability
- [ ] Upload size caps and EXIF stripping live in the seam, not the page

## Out of scope (this feature)

- The files seam itself — `patient-loop/patient-documents-and-links` builds it (D-18); this stub adds a photo to a meal entry through it

## Notes for Define

- **Decisions that bind** ([`README.md § Decisions of record`](../README.md)): D-12 (the journal stays text-only; photos are additive) · D-18 (Vercel Blob behind the files seam, EU region).

- Health data in images: residency and retention terms of the vendor are part of the decision,
  not an afterthought.
- Upload size caps and image stripping (EXIF location) in the seam, not the page.

**Open for Define** — settled with the operator before the spec is approved, never assumed:

- Whether a vision-capable model is reachable through the gateway (D-16) at an acceptable price on the day.

## Prompt

Run `/pipeline new meal-photos` in the remi-ai repo — **only after the owner has lifted this stub's P2 and `patient-loop/patient-documents-and-links` has shipped the files seam**. Define reads this stub, its epic's `breakdown.md` and the decisions of record in `.icm/intake/README.md`, and asks the points under **Open for Define** rather than answering them. Scope is the Proposed change and nothing under Out of scope.
