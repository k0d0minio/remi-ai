CREATE TABLE "patient_recipes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"template_id" uuid NOT NULL,
	"title" text NOT NULL,
	"content" jsonb NOT NULL,
	"planned_on" date NOT NULL,
	"meal" text NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "patient_recipes_meal_check" CHECK ("patient_recipes"."meal" in ('breakfast', 'lunch', 'snack', 'dinner'))
);
--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "content" jsonb;--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "verified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "verified_by_id" uuid;--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "verified_by_name" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "patient_recipes" ADD CONSTRAINT "patient_recipes_patient_id_patient_profiles_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patient_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_recipes" ADD CONSTRAINT "patient_recipes_template_id_recipes_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."recipes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "patient_recipes_patient_day_meal_idx" ON "patient_recipes" USING btree ("patient_id","planned_on","meal");