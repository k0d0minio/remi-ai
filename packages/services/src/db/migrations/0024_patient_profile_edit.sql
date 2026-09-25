ALTER TABLE "patient_profiles" ALTER COLUMN "food_budget" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "patient_profiles" ALTER COLUMN "food_budget" DROP NOT NULL;--> statement-breakpoint
-- Hand-added: `food_budget` was free text and becomes one of three levels.
-- A value that is only a level's word (any case, with or without accents)
-- takes that level; any other non-empty text is kept by appending it to
-- `preferences` as « Budget : <text> », then the budget is left unset —
-- nothing Morgane typed is lost (patient-profile-edit, D-28). An empty string
-- becomes NULL: not asked yet.
UPDATE "patient_profiles"
SET "preferences" = CASE
  WHEN btrim("preferences") = '' THEN 'Budget : ' || btrim("food_budget")
  ELSE "preferences" || E'\n' || 'Budget : ' || btrim("food_budget")
END
WHERE btrim("food_budget") <> ''
  AND translate(lower(btrim("food_budget")), 'éèêë', 'eeee')
    NOT IN ('eco', 'economique', 'standard', 'confort', 'confortable');--> statement-breakpoint
UPDATE "patient_profiles"
SET "food_budget" = CASE translate(lower(btrim("food_budget")), 'éèêë', 'eeee')
  WHEN 'eco' THEN 'economical'
  WHEN 'economique' THEN 'economical'
  WHEN 'standard' THEN 'standard'
  WHEN 'confort' THEN 'comfort'
  WHEN 'confortable' THEN 'comfort'
  ELSE NULL
END;--> statement-breakpoint
ALTER TABLE "patient_profiles" ADD COLUMN "cooking_time" text;--> statement-breakpoint
ALTER TABLE "patient_profiles" ADD COLUMN "patient_edited_at" jsonb DEFAULT '{}'::jsonb NOT NULL;
