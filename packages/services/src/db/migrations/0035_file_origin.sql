ALTER TABLE "patient_profiles" ADD COLUMN "created_by" text DEFAULT 'practitioner' NOT NULL;--> statement-breakpoint
-- Hand-added: a file that the patient opened from the sign-up link has one
-- `patient.signed_up` event in the audit trail. That file is the patient's.
-- Every other file is the practitioner's, the column default
-- (list-appearance-rule, story 5).
UPDATE "patient_profiles" SET "created_by" = 'patient'
WHERE "id"::text IN (
  SELECT "target_id" FROM "audit_events" WHERE "action" = 'patient.signed_up'
);
