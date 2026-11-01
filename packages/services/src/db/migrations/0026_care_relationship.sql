-- Every patient file belongs to one practitioner (D-27). The column arrives
-- nullable, the existing files go to Morgane, then the column turns not null.
ALTER TABLE "patient_profiles" ADD COLUMN "practitioner_id" uuid;--> statement-breakpoint
-- Morgane's operator is the oldest owner: the account OPERATOR_EMAIL created
-- first. The rule names no e-mail, so no address enters git. A database with
-- files and no owner fails the not-null step below, loudly, by design.
UPDATE "patient_profiles" SET "practitioner_id" = (
	SELECT "id" FROM "operators" WHERE "role" = 'owner' ORDER BY "created_at", "id" LIMIT 1
) WHERE "practitioner_id" IS NULL;--> statement-breakpoint
ALTER TABLE "patient_profiles" ALTER COLUMN "practitioner_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "patient_profiles" ADD CONSTRAINT "patient_profiles_practitioner_id_operators_id_fk" FOREIGN KEY ("practitioner_id") REFERENCES "public"."operators"("id") ON DELETE no action ON UPDATE no action;
