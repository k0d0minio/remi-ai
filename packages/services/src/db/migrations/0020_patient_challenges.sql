CREATE TABLE "patient_challenges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"text" text NOT NULL,
	"why" text DEFAULT '' NOT NULL,
	"started_on" date NOT NULL,
	"closed_on" date,
	"outcome" text,
	"acquired_at" timestamp with time zone,
	"ready_for_next_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "patient_challenges" ADD CONSTRAINT "patient_challenges_patient_id_patient_profiles_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patient_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "patient_challenges_one_open" ON "patient_challenges" USING btree ("patient_id") WHERE "patient_challenges"."closed_on" is null;