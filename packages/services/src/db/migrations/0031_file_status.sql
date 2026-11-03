ALTER TABLE "patient_profiles" ADD COLUMN "file_status" text DEFAULT 'to_complete' NOT NULL;--> statement-breakpoint
-- Hand-added: every file that exists before this migration is already in care,
-- so it starts as « Accompagnement actif » (file-status-enum, Morgane's question 2,
-- default accepted by Jamie on 2026-11-03). A file created after it starts as
-- `to_complete`, the column default. The retention `status` column is untouched.
UPDATE "patient_profiles" SET "file_status" = 'active';
