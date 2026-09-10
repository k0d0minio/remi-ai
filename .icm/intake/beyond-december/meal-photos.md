# Stub: Meal photos — a photo on a meal entry, once a blob vendor exists

- feature-slug: meal-photos
- sequence: 4 of 6
- depends-on: none
- priority: P2
- size: M
- blocked: no blob-storage vendor chosen — an owner decision (Vercel Blob, Neon's storage, S3 …),
  never made in passing
- sources: feedback § 8 "Vision finale" ("reconnaître automatiquement un repas depuis une photo")
  · brainstorm § 5 (photo / repas réel) · decision #12 (text-only stands) ·
  `_done/patient-surface/_done/meal-journal.md` ("photos become an additive migration")

## What this is

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

## Worth knowing

- Health data in images: residency and retention terms of the vendor are part of the decision,
  not an afterthought.
- Upload size caps and image stripping (EXIF location) in the seam, not the page.

## Open questions — flag these on pickup

- The vendor — and whether the same store serves `autonomous-patient-pdf-import`.

## Prompt

Run `/pipeline new .icm/intake/beyond-december/meal-photos.md` in the remi-ai repo and follow the
pipeline from there — only after the owner has chosen a blob-storage vendor and removed the
`blocked` line. Read the stub and its epic's `breakdown.md` first. Scope: a files seam with one
adapter, a private photo on meal entries with signed delivery and cascade deletion, and the photo
as an input to the existing meal-suggestion call via a vision model. Raise the stub's open
question rather than answering it.
