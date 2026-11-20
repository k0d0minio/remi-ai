CREATE TABLE "food_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"food_code" text NOT NULL,
	"cookable" boolean DEFAULT false NOT NULL,
	"contains_tags" text[] DEFAULT '{}' NOT NULL,
	"may_contain_tags" text[] DEFAULT '{}' NOT NULL,
	"role" text,
	"status" text NOT NULL,
	"source" text NOT NULL,
	"proposed_model" text DEFAULT '' NOT NULL,
	"lexicon_id" text,
	"confirmed_at" timestamp with time zone,
	"confirmed_by_id" uuid,
	"confirmed_by_name" text DEFAULT '' NOT NULL,
	"density_g_per_ml" double precision,
	"units" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"units_status" text,
	"units_confirmed_at" timestamp with time zone,
	"units_confirmed_by_id" uuid,
	"units_confirmed_by_name" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "food_records_status_check" CHECK ("food_records"."status" in ('proposed', 'confirmed')),
	CONSTRAINT "food_records_units_status_check" CHECK ("food_records"."units_status" is null or "food_records"."units_status" in ('proposed', 'confirmed')),
	CONSTRAINT "food_records_source_check" CHECK ("food_records"."source" in ('remi', 'person')),
	CONSTRAINT "food_records_role_check" CHECK ("food_records"."role" is null or "food_records"."role" in ('protein', 'starch', 'vegetable', 'fat', 'acid', 'aromatic', 'herb_spice', 'liquid')),
	CONSTRAINT "food_records_confirmed_check" CHECK (("food_records"."status" = 'confirmed') = ("food_records"."confirmed_at" is not null)),
	CONSTRAINT "food_records_units_confirmed_check" CHECK (("food_records"."units_status" is not distinct from 'confirmed') = ("food_records"."units_confirmed_at" is not null)),
	CONSTRAINT "food_records_density_check" CHECK ("food_records"."density_g_per_ml" is null or "food_records"."density_g_per_ml" > 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX "food_records_food_code_idx" ON "food_records" USING btree ("food_code");--> statement-breakpoint
CREATE INDEX "food_records_status_idx" ON "food_records" USING btree ("status");