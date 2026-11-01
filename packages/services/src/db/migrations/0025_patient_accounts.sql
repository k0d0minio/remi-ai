CREATE TABLE "patient_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_profile_id" uuid NOT NULL,
	"email" text NOT NULL,
	"auth_subject" text NOT NULL,
	"activated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "patient_accounts_patient_profile_id_unique" UNIQUE("patient_profile_id"),
	CONSTRAINT "patient_accounts_email_unique" UNIQUE("email"),
	CONSTRAINT "patient_accounts_auth_subject_unique" UNIQUE("auth_subject")
);
--> statement-breakpoint
ALTER TABLE "patient_accounts" ADD CONSTRAINT "patient_accounts_patient_profile_id_patient_profiles_id_fk" FOREIGN KEY ("patient_profile_id") REFERENCES "public"."patient_profiles"("id") ON DELETE cascade ON UPDATE no action;