CREATE TABLE "patient_meal_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"eaten_on" date NOT NULL,
	"slot" text,
	"description" text NOT NULL,
	"patient_comment" text DEFAULT '' NOT NULL,
	"feedback" text DEFAULT '' NOT NULL,
	"feedback_written_at" timestamp with time zone,
	"learning" text DEFAULT '' NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patient_observations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"body" text NOT NULL,
	"observed_on" date NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "patient_meal_entries" ADD CONSTRAINT "patient_meal_entries_patient_id_patient_profiles_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patient_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_observations" ADD CONSTRAINT "patient_observations_patient_id_patient_profiles_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patient_profiles"("id") ON DELETE cascade ON UPDATE no action;