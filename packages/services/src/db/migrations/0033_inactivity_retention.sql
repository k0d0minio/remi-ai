ALTER TABLE "patient_accounts" ADD COLUMN "last_seen_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "patient_accounts" ADD COLUMN "inactivity_notice_sent_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "patient_profiles" ADD COLUMN "retention_hold_at" timestamp with time zone;