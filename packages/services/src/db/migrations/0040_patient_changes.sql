CREATE TABLE "patient_changes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"field_key" text NOT NULL,
	"old_value" jsonb,
	"new_value" jsonb,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"acknowledged_at" timestamp with time zone,
	"acknowledged_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "patient_changes_field_key_check" CHECK ("patient_changes"."field_key" in ('heightCm', 'weightKg', 'desiredWeightKg', 'activityLevel', 'diet', 'dietNote', 'medications', 'supplements', 'geneticTest', 'apoe', 'dio2', 'amy1a', 'allergies', 'intolerances'))
);
--> statement-breakpoint
ALTER TABLE "patient_changes" ADD CONSTRAINT "patient_changes_patient_id_patient_profiles_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patient_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "patient_changes_open_patient_field_idx" ON "patient_changes" USING btree ("patient_id","field_key") WHERE "patient_changes"."acknowledged_at" is null;--> statement-breakpoint
CREATE INDEX "patient_changes_patient_changed_at_idx" ON "patient_changes" USING btree ("patient_id","changed_at");