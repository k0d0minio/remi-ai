CREATE TABLE "patient_allergens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"key" text NOT NULL,
	"sub_key" text,
	"other_text" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "patient_allergens_patient_id_kind_key_sub_key_unique" UNIQUE NULLS NOT DISTINCT("patient_id","kind","key","sub_key"),
	CONSTRAINT "patient_allergens_kind" CHECK ("patient_allergens"."kind" in ('allergy', 'intolerance'))
);
--> statement-breakpoint
ALTER TABLE "patient_profiles" ADD COLUMN "sex_for_calculation" text;--> statement-breakpoint
ALTER TABLE "patient_profiles" ADD COLUMN "activity_level" text;--> statement-breakpoint
ALTER TABLE "patient_profiles" ADD COLUMN "desired_weight_kg" double precision;--> statement-breakpoint
ALTER TABLE "patient_profiles" ADD COLUMN "consultation_reason" text;--> statement-breakpoint
ALTER TABLE "patient_profiles" ADD COLUMN "consultation_date" date;--> statement-breakpoint
ALTER TABLE "patient_profiles" ADD COLUMN "diet" text;--> statement-breakpoint
ALTER TABLE "patient_profiles" ADD COLUMN "diet_note" text;--> statement-breakpoint
ALTER TABLE "patient_profiles" ADD COLUMN "pathologies" text;--> statement-breakpoint
ALTER TABLE "patient_profiles" ADD COLUMN "celiac_disease" boolean;--> statement-breakpoint
ALTER TABLE "patient_profiles" ADD COLUMN "genetic_test" text;--> statement-breakpoint
ALTER TABLE "patient_profiles" ADD COLUMN "apoe" text;--> statement-breakpoint
ALTER TABLE "patient_profiles" ADD COLUMN "dio2" text;--> statement-breakpoint
ALTER TABLE "patient_profiles" ADD COLUMN "amy1a" text;--> statement-breakpoint
ALTER TABLE "patient_profiles" ADD COLUMN "practitioner_question_answer" text;--> statement-breakpoint
ALTER TABLE "patient_profiles" ADD COLUMN "no_known_allergies" boolean;--> statement-breakpoint
ALTER TABLE "patient_profiles" ADD COLUMN "no_known_intolerances" boolean;--> statement-breakpoint
ALTER TABLE "patient_allergens" ADD CONSTRAINT "patient_allergens_patient_id_patient_profiles_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patient_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
-- Hand-added: the free-text allergies and intolerances move into
-- `patient_allergens` without loss (questionnaire-fields, Morgane's question 1).
-- Each non-empty text becomes one « Autre » row of its kind, with the trimmed
-- text as `other_text`. The text columns stay on the profile until every
-- reader moves. The « none known » flags stay null: a free text is not a
-- declared absence. `NOT EXISTS` keeps a second run from adding a row.
INSERT INTO "patient_allergens" ("patient_id", "kind", "key", "sub_key", "other_text")
SELECT "id", 'allergy', 'other', NULL, btrim("allergies")
FROM "patient_profiles"
WHERE btrim("allergies") <> ''
  AND NOT EXISTS (
    SELECT 1 FROM "patient_allergens" a
    WHERE a."patient_id" = "patient_profiles"."id"
      AND a."kind" = 'allergy' AND a."key" = 'other' AND a."sub_key" IS NULL
  );--> statement-breakpoint
INSERT INTO "patient_allergens" ("patient_id", "kind", "key", "sub_key", "other_text")
SELECT "id", 'intolerance', 'other', NULL, btrim("intolerances")
FROM "patient_profiles"
WHERE btrim("intolerances") <> ''
  AND NOT EXISTS (
    SELECT 1 FROM "patient_allergens" a
    WHERE a."patient_id" = "patient_profiles"."id"
      AND a."kind" = 'intolerance' AND a."key" = 'other' AND a."sub_key" IS NULL
  );
