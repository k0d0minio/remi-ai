CREATE TABLE "patient_recommendation_check_ins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recommendation_id" uuid NOT NULL,
	"checked_on" date NOT NULL,
	"direction" text NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"acknowledged_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "patient_goal_check_ins" ADD COLUMN "acknowledged_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "patient_recommendation_check_ins" ADD CONSTRAINT "patient_recommendation_check_ins_recommendation_id_patient_recommendations_id_fk" FOREIGN KEY ("recommendation_id") REFERENCES "public"."patient_recommendations"("id") ON DELETE cascade ON UPDATE no action;