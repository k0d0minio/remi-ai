CREATE TABLE "patient_food_directives" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"term" text NOT NULL,
	"limit_level" text,
	"starts_on" date,
	"ends_on" date,
	"durable" boolean DEFAULT false NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"disabled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "patient_food_directives_kind_check" CHECK ("patient_food_directives"."kind" in ('favour', 'limit', 'exclude')),
	CONSTRAINT "patient_food_directives_limit_level_check" CHECK ("patient_food_directives"."limit_level" is null or ("patient_food_directives"."kind" = 'limit' and "patient_food_directives"."limit_level" in ('reduce', 'rare'))),
	CONSTRAINT "patient_food_directives_eviction_period_check" CHECK (("patient_food_directives"."kind" = 'exclude' and "patient_food_directives"."durable" <> ("patient_food_directives"."ends_on" is not null)) or ("patient_food_directives"."kind" <> 'exclude' and not "patient_food_directives"."durable" and "patient_food_directives"."starts_on" is null and "patient_food_directives"."ends_on" is null)),
	CONSTRAINT "patient_food_directives_period_order_check" CHECK ("patient_food_directives"."starts_on" is null or "patient_food_directives"."ends_on" is null or "patient_food_directives"."ends_on" >= "patient_food_directives"."starts_on")
);
--> statement-breakpoint
ALTER TABLE "patient_food_directives" ADD CONSTRAINT "patient_food_directives_patient_id_patient_profiles_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patient_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "patient_food_directives_patient_idx" ON "patient_food_directives" USING btree ("patient_id");