-- Written idempotently on purpose: `IF NOT EXISTS` rather than drizzle-kit's plain
-- CREATE. Two reasons, and the second is not hypothetical.
--
-- One: scripts/migrate.mjs explains that drizzle decides what to apply by comparing this
-- migration's journal timestamp against the newest `created_at` already in
-- drizzle.__drizzle_migrations, never by hash. A migration landing behind that mark is
-- recorded as applied and never runs. That happened to this one's first attempt —
-- generated at 12:05:30Z, while 0013_gray_charles_xavier merged to main and was applied at
-- 12:07:51Z — so all three tables were reported applied and were absent.
--
-- Two: the repair attempt then DID create them, on this branch's admin preview, against the
-- database production shares. So these tables already exist there, and a plain CREATE would
-- now fail with "relation already exists" on the next build. This version no-ops instead.
--
-- Why a preview could write to that database at all is a defect in its own right:
-- .icm/intake/triage/preview-deploys-migrate-production.md.

CREATE TABLE IF NOT EXISTS "ciqual_imports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"edition" text NOT NULL,
	"food_count" integer DEFAULT 0 NOT NULL,
	"nutrient_count" integer DEFAULT 0 NOT NULL,
	"source_checksums" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "food_nutrients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"food_code" text NOT NULL,
	"component_code" text NOT NULL,
	"component_name_fr" text NOT NULL,
	"unit" text DEFAULT '' NOT NULL,
	"value" double precision,
	"marker" text DEFAULT 'exact' NOT NULL,
	"raw_value" text DEFAULT '' NOT NULL,
	"confidence" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "food_nutrients_food_code_component_code_unique" UNIQUE("food_code","component_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "foods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name_fr" text NOT NULL,
	"name_en" text DEFAULT '' NOT NULL,
	"search_name" text NOT NULL,
	"group_code" text NOT NULL,
	"group_name_fr" text NOT NULL,
	"sub_group_code" text DEFAULT '' NOT NULL,
	"sub_group_name_fr" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "foods_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "food_nutrients_component_code_index" ON "food_nutrients" USING btree ("component_code");