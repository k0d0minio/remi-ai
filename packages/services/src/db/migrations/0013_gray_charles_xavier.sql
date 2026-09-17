CREATE TABLE "patient_link_writes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_events" ADD COLUMN "actor_kind" text DEFAULT 'operator' NOT NULL;--> statement-breakpoint
ALTER TABLE "patient_goal_check_ins" ADD COLUMN "written_by" text DEFAULT 'practitioner' NOT NULL;--> statement-breakpoint
ALTER TABLE "patient_meal_entries" ADD COLUMN "written_by" text DEFAULT 'practitioner' NOT NULL;--> statement-breakpoint
ALTER TABLE "patient_profiles" ADD COLUMN "link_last_wrote_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "patient_link_writes" ADD CONSTRAINT "patient_link_writes_patient_id_patient_profiles_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patient_profiles"("id") ON DELETE cascade ON UPDATE no action;