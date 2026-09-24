CREATE TABLE "patient_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"tag" text DEFAULT 'document' NOT NULL,
	"title" text NOT NULL,
	"url" text,
	"blob_key" text,
	"mime" text,
	"size" integer,
	"goal_id" uuid,
	"recipe_assignment_id" uuid,
	"added_by_email" text DEFAULT '' NOT NULL,
	"added_on" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "patient_documents_shape" CHECK (("patient_documents"."kind" = 'file' and "patient_documents"."blob_key" is not null and "patient_documents"."url" is null) or ("patient_documents"."kind" = 'link' and "patient_documents"."url" is not null and "patient_documents"."blob_key" is null)),
	CONSTRAINT "patient_documents_one_parent" CHECK ("patient_documents"."goal_id" is null or "patient_documents"."recipe_assignment_id" is null)
);
--> statement-breakpoint
ALTER TABLE "patient_documents" ADD CONSTRAINT "patient_documents_patient_id_patient_profiles_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patient_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_documents" ADD CONSTRAINT "patient_documents_goal_id_patient_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."patient_goals"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_documents" ADD CONSTRAINT "patient_documents_recipe_assignment_id_patient_recipe_assignments_id_fk" FOREIGN KEY ("recipe_assignment_id") REFERENCES "public"."patient_recipe_assignments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "patient_documents_patient" ON "patient_documents" USING btree ("patient_id");