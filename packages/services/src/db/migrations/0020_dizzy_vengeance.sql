ALTER TABLE "patient_recipe_assignments" ADD COLUMN "patient_response" text;--> statement-breakpoint
ALTER TABLE "patient_recipe_assignments" ADD COLUMN "responded_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "patient_recipe_assignments" ADD COLUMN "written_by" text DEFAULT 'practitioner' NOT NULL;