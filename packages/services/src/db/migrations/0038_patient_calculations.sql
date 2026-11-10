CREATE TABLE "patient_calculations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"estimated_value" double precision,
	"estimate_parameters" jsonb,
	"estimated_at" timestamp with time zone,
	"validated_value" double precision,
	"validation_parameters" jsonb,
	"validated_at" timestamp with time zone,
	"validated_by" uuid,
	"needs_revalidation" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "patient_calculations_kind_check" CHECK ("patient_calculations"."kind" in ('bmi', 'protein', 'energy'))
);
--> statement-breakpoint
ALTER TABLE "patient_profiles" ADD COLUMN "special_situation" text;--> statement-breakpoint
ALTER TABLE "patient_profiles" ADD COLUMN "special_situation_note" text;--> statement-breakpoint
ALTER TABLE "patient_calculations" ADD CONSTRAINT "patient_calculations_patient_id_patient_profiles_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patient_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "patient_calculations_patient_kind_idx" ON "patient_calculations" USING btree ("patient_id","kind");