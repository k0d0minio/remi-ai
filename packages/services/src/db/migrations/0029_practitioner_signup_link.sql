-- Each practitioner gets one permanent sign-up link (story 1). The column default
-- is volatile, so Postgres computes it once per existing row: each operator gets
-- its own token in this one statement. The default stays, so an insert by a
-- deployment that predates the column still gets a token.
ALTER TABLE "operators" ADD COLUMN "signup_link_token" text DEFAULT translate(encode(decode(substr(replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''), 1, 48), 'hex'), 'base64'), '+/', '-_') NOT NULL;--> statement-breakpoint
ALTER TABLE "operators" ADD CONSTRAINT "operators_signup_link_token_unique" UNIQUE("signup_link_token");