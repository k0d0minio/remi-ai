ALTER TABLE "patient_profiles" ALTER COLUMN "food_budget" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "patient_profiles" ALTER COLUMN "food_budget" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "patient_profiles" ADD COLUMN "cooking_time" text;--> statement-breakpoint
ALTER TABLE "patient_profiles" ADD COLUMN "preferences_updated_by_patient_at" timestamp with time zone;--> statement-breakpoint
--- food_budget was free text until this migration and is a closed set after it.
--- Every existing value is prose Morgane typed ("serré, courses au marché"), so
--- there is nothing to map onto the three levels and guessing would put words in
--- her patients' mouths. The column is blanked and she re-picks the handful she
--- holds — at ten to fifteen patients that is minutes, and it is the only option
--- that cannot be silently wrong.
UPDATE "patient_profiles" SET "food_budget" = NULL;
