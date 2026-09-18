-- « Je vais manger » / « J'ai mangé » — the intent a meal was written with (§ 8).
--
-- DEFAULT 'eaten' is what backfills the existing journal, and it is the honest
-- value rather than a convenience: every row here predates the patient's own
-- entry control, so each one is a meal Morgane transcribed after it happened.
-- A planned row is flipped to 'eaten' in place when the meal does.
--
-- Idempotent, so a re-apply against a database that already carries the column
-- is a no-op rather than a failed migration.
ALTER TABLE "patient_meal_entries" ADD COLUMN IF NOT EXISTS "intent" text DEFAULT 'eaten' NOT NULL;
