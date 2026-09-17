-- Written idempotently on purpose: `IF NOT EXISTS` rather than drizzle-kit's plain
-- CREATE. Two reasons, and the second is not hypothetical.
--
-- One: scripts/migrate.mjs explains that drizzle decides what to apply by comparing this
-- migration's journal timestamp against the newest `created_at` already in
-- drizzle.__drizzle_migrations, never by hash. A migration landing behind that mark is
-- recorded as applied and never runs. This one has been renumbered twice for exactly that
-- reason — 0013 lost the race to link-writes (#98), 0014 to recipes (#95) — and each time
-- it was regenerated rather than renumbered by hand, so its timestamp is genuinely newest.
-- See .icm/intake/triage/parallel-migrations-journal-ordering.md.
--
-- Two: these three tables already exist in the database production shares. A preview deploy
-- on this branch created them before any of this merged, which is a defect of its own
-- (.icm/intake/triage/preview-deploys-migrate-production.md). A plain CREATE would now fail
-- there with "relation already exists". This version no-ops instead.

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