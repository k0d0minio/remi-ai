# Stub: Meal photos — a photo on a meal entry, once a blob vendor exists

- feature-slug: meal-photos
- scope: beyond-december
- personas: patient
- initiative: a patient experience validated on real terrain, in time for the December open day / objective: the patient loop working end to end for one real patient
- depends-on: none
- sequence: 4 of 6
- priority: P2
- size: M
- blocked: no blob-storage vendor chosen — an owner decision (Vercel Blob, Neon's storage, S3 …),
  never made in passing
- sources: feedback § 8 "Vision finale" ("reconnaître automatiquement un repas depuis une photo")
  · brainstorm § 5 (photo / repas réel) · decision D-12 (text-only stands) ·
  `_done/patient-surface/_done/meal-journal.md` ("photos become an additive migration")

## Problem

The loop Morgane ran on WhatsApp was photos; the journal is text by decision, and no blob-storage vendor has been chosen. Her « vision finale » reads a meal from a photo.

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
  `meal-suggestions`, not a new capability. Whether Mistral's vision models suffice is checked at
  pickup.

## Acceptance criteria (rough)

- [ ] A files seam in the services package (interface, registration, one adapter), the fourth seam
- [ ] A photo on « J'ai mangé » from the phone camera, stored privately, served through a signed URL, deleted with the entry and with the patient; RETENTION updated
- [ ] The photo becomes an input to the existing meal-suggestion call through a vision-capable model — not a new capability
- [ ] Upload size caps and EXIF stripping live in the seam, not the page

## Out of scope (this feature)

- Choosing the vendor — an owner decision never made in passing; the same store serving `autonomous-patient-pdf-import` is an open point

## Notes for Define

- **Decisions that bind** ([`README.md § Decisions of record`](../README.md)): D-12 (text-only stands until a vendor is chosen).

- Health data in images: residency and retention terms of the vendor are part of the decision,
  not an afterthought.
- Upload size caps and image stripping (EXIF location) in the seam, not the page.

**Open for Define** — settled with the operator before the spec is approved, never assumed:

- The vendor — and whether the same store serves `autonomous-patient-pdf-import`.

## Prompt

Run `/pipeline new meal-photos` in the remi-ai repo — **only after the owner has chosen a blob-storage vendor and removed the `blocked` line**. Define reads this stub, its epic's `breakdown.md` and the decisions of record in `.icm/intake/README.md`, and asks the points under **Open for Define** rather than answering them. Scope is the Proposed change and nothing under Out of scope.
