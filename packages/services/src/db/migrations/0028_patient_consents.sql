CREATE TABLE "patient_consents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_profile_id" uuid NOT NULL,
	"consent_key" text NOT NULL,
	"text_version" text NOT NULL,
	"text_locale" text,
	"text_hash" text,
	"decision" text NOT NULL,
	"channel" text,
	"decided_at" timestamp with time zone NOT NULL,
	"actor_kind" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "patient_consents_decision_check" CHECK ("patient_consents"."decision" in ('given', 'refused', 'withdrawn'))
);
--> statement-breakpoint
ALTER TABLE "patient_consents" ADD CONSTRAINT "patient_consents_patient_profile_id_patient_profiles_id_fk" FOREIGN KEY ("patient_profile_id") REFERENCES "public"."patient_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "patient_consents_patient_key_idx" ON "patient_consents" USING btree ("patient_profile_id","consent_key","decided_at");
--> statement-breakpoint
-- Hand-added: each profile with a `consent_date` gets one `care` row of version
-- `legacy` (consent-texts-and-records). The date becomes 00:00 Europe/Brussels
-- on that day. `consent_channel` moves to `channel` as it is, NULL included.
-- A profile with a channel and no date gets no row, and keeps its two columns
-- (Jamie, 2026-11-01). The two columns stay: nothing here deletes them.
-- Safe to run twice: a profile that already has a `legacy` row is skipped.
INSERT INTO "patient_consents" ("patient_profile_id", "consent_key", "text_version", "text_locale", "text_hash", "decision", "channel", "decided_at", "actor_kind")
SELECT p."id", 'care', 'legacy', NULL, NULL, 'given', p."consent_channel", (p."consent_date"::timestamp AT TIME ZONE 'Europe/Brussels'), 'operator'
FROM "patient_profiles" p
WHERE p."consent_date" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "patient_consents" c
    WHERE c."patient_profile_id" = p."id" AND c."text_version" = 'legacy'
  );
