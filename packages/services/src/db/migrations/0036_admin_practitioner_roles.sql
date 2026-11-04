-- D-27: the roles `admin` and `practitioner` replace `owner` and `operator`.
UPDATE "operators" SET "role" = 'admin' WHERE "role" = 'owner';--> statement-breakpoint
UPDATE "operators" SET "role" = 'practitioner' WHERE "role" = 'operator';--> statement-breakpoint
UPDATE "operator_invitations" SET "role" = 'admin' WHERE "role" = 'owner';--> statement-breakpoint
UPDATE "operator_invitations" SET "role" = 'practitioner' WHERE "role" = 'operator';--> statement-breakpoint
ALTER TABLE "operator_invitations" ALTER COLUMN "role" SET DEFAULT 'practitioner';--> statement-breakpoint
ALTER TABLE "operators" ALTER COLUMN "role" SET DEFAULT 'practitioner';
