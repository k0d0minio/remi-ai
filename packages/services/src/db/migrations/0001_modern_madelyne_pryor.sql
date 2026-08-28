CREATE TABLE "audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid,
	"actor_email" text DEFAULT '' NOT NULL,
	"actor_name" text DEFAULT '' NOT NULL,
	"action" text NOT NULL,
	"target_type" text DEFAULT '' NOT NULL,
	"target_id" text,
	"target_label" text DEFAULT '' NOT NULL,
	"detail" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "operator_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"role" text DEFAULT 'operator' NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"accepted_at" timestamp with time zone,
	"invited_by_email" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "operator_invitations_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "patient_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"occurred_at" date NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"author_name" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "operators" ADD COLUMN "role" text DEFAULT 'operator' NOT NULL;--> statement-breakpoint
-- Hand-added to the generated migration: the column defaults to the lesser
-- role so an invite can never mint an owner, but the accounts that predate
-- this column are the deployment's existing operators and must keep the full
-- access they had. No-op on a fresh database, which has no rows to promote.
UPDATE "operators" SET "role" = 'owner';--> statement-breakpoint
ALTER TABLE "patient_profiles" ADD COLUMN "birth_date" date;--> statement-breakpoint
ALTER TABLE "patient_profiles" ADD COLUMN "sex" text DEFAULT 'unspecified' NOT NULL;--> statement-breakpoint
ALTER TABLE "patient_profiles" ADD COLUMN "height_cm" integer;--> statement-breakpoint
ALTER TABLE "patient_profiles" ADD COLUMN "weight_kg" double precision;--> statement-breakpoint
ALTER TABLE "patient_profiles" ADD COLUMN "medications" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "patient_profiles" ADD COLUMN "supplements" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "patient_profiles" ADD COLUMN "referral" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "patient_profiles" ADD COLUMN "last_edited_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
-- Hand-added: the column's now() default would claim every existing profile
-- was edited at migration time. The last row write is the honest answer for
-- rows that predate the split between the two timestamps.
UPDATE "patient_profiles" SET "last_edited_at" = "updated_at";--> statement-breakpoint
ALTER TABLE "patient_profiles" ADD COLUMN "link_last_opened_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "patient_recommendations" ADD COLUMN "position" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "patient_recommendations" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "patient_notes" ADD CONSTRAINT "patient_notes_patient_id_patient_profiles_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patient_profiles"("id") ON DELETE cascade ON UPDATE no action;