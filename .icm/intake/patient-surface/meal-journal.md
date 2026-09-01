# Stub: Meal journal — the WhatsApp loop, transcribed and answered in one place

- feature-slug: meal-journal
- sequence: 3 of 4
- depends-on: none
- priority: P1
- size: M
- sources: v2 brainstorm § 5 (the weekly loop) + MEAL_FEEDBACK / PROGRESS (§ 8) · scope answers
  2026-09-01 (patient-record/breakdown.md § Decisions, #1, #6)

## What this is

§ 5 is the loop the whole product bends toward: real meals in, short feedback out, and the
learnings feeding next week's recipes. Today it lives entirely in WhatsApp threads, which means it
evaporates. Manual-first, per decisions #1 and #6: **Morgane transcribes** — the patient link
stays view-only and the journal is **text-only** until a blob-storage vendor exists.

Per patient, a meal entry: date, an optional slot (petit-déj / déjeuner / dîner / collation — a
vocabulary, pending Morgane's confirmation), what was eaten (her transcription of the photo or
message), the patient's own comment if there was one. On each entry, **her feedback** — § 5 step
3's shape is the guidance: what is already good plus one or two priority improvements, short. And
per entry an optional **learning** — § 5 step 4's "mémorisation utile": aliments souvent choisis,
recettes appréciées, difficultés récurrentes. The learnings are this epic's half of PROGRESS (goal
check-ins in `patient-record` are the other half); a per-patient view that lists just the
learnings is what makes them worth typing.

Admin: a journal card on the patient page — reverse-chronological entries, feedback inline,
quick-add tuned for phone (she will often log straight from the WhatsApp thread). The patient link
renders entries *with feedback* in `patient-link-segments`, so a patient re-reads their corrections
in one place instead of scrolling a chat — § J's logic extended to the loop.

**No photo column, no upload path in this stub.** When the owner picks a blob vendor (a new files
seam — flag it, never choose it in passing), photos become an additive migration.

## Worth knowing

- Entry + feedback as one row or two tables: the spec decides; note only that feedback comes
  *after* the meal in time and the AI round will want to draft it — same draft-room caveat as the
  living summary.
- Tables behind the seam, migrations generated, writes audited via `lib/audit.ts`.

## Open questions — flag these on pickup

- Slot vocabulary: Morgane's words for it, and whether she wants a slot at all.
- Should the patient see *all* entries on the link, or only entries where she wrote feedback?
  (An unanswered meal on the patient's own page may read as neglect — her call.)
- Are learnings per-entry (attached where noticed) or a free-standing per-patient observations
  log she edits directly? Ask how she actually thinks while reviewing a week.

## Prompt

Run `/pipeline new .icm/intake/patient-surface/meal-journal.md` in the remi-ai repo and follow
the pipeline from there. Read the stub and its epic's `breakdown.md` first — and the decisions of
record in `.icm/intake/patient-record/breakdown.md`; #1 (view-only link) and #6 (text-only, no
blob vendor) bind this stub. Scope: per-patient meal entries (date, optional slot, description,
patient comment) with Morgane's feedback and optional learning per entry — tables, migrations,
service behind the seam, a phone-first journal card on the admin patient page, and a per-patient
learnings view. No photos, no patient-side input, nothing on the patient link in this stub. Raise
the stub's open questions rather than answering them.
