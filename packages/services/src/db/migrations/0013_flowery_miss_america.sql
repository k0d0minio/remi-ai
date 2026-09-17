CREATE TABLE "ciqual_imports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"edition" text NOT NULL,
	"food_count" integer DEFAULT 0 NOT NULL,
	"nutrient_count" integer DEFAULT 0 NOT NULL,
	"source_checksums" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "food_nutrients" (
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
CREATE TABLE "foods" (
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
CREATE INDEX "food_nutrients_component_code_index" ON "food_nutrients" USING btree ("component_code");