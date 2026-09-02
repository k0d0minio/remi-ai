ALTER TABLE "patient_profiles" ADD COLUMN "dietary_regime" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "patient_profiles" ADD COLUMN "allergies" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "patient_profiles" ADD COLUMN "intolerances" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "patient_profiles" ADD COLUMN "likes_cooking" text;--> statement-breakpoint
ALTER TABLE "patient_profiles" ADD COLUMN "food_budget" text DEFAULT '' NOT NULL;