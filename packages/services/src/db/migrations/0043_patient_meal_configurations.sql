CREATE TABLE "patient_meal_configurations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patient_id" uuid NOT NULL,
	"breakfast_enabled" boolean,
	"breakfast_orientation" text,
	"lunch_enabled" boolean,
	"lunch_orientation" text,
	"snack_enabled" boolean,
	"snack_orientation" text,
	"dinner_enabled" boolean,
	"dinner_orientation" text,
	"fasting" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "patient_meal_configurations_breakfast_orientation_check" CHECK ("patient_meal_configurations"."breakfast_orientation" is null or "patient_meal_configurations"."breakfast_orientation" in ('protein_fat', 'complete_balanced', 'light_plant', 'carb_leaning', 'free')),
	CONSTRAINT "patient_meal_configurations_lunch_orientation_check" CHECK ("patient_meal_configurations"."lunch_orientation" is null or "patient_meal_configurations"."lunch_orientation" in ('protein_fat', 'complete_balanced', 'light_plant', 'carb_leaning', 'free')),
	CONSTRAINT "patient_meal_configurations_snack_orientation_check" CHECK ("patient_meal_configurations"."snack_orientation" is null or "patient_meal_configurations"."snack_orientation" in ('protein_fat', 'complete_balanced', 'light_plant', 'carb_leaning', 'free')),
	CONSTRAINT "patient_meal_configurations_dinner_orientation_check" CHECK ("patient_meal_configurations"."dinner_orientation" is null or "patient_meal_configurations"."dinner_orientation" in ('protein_fat', 'complete_balanced', 'light_plant', 'carb_leaning', 'free')),
	CONSTRAINT "patient_meal_configurations_fasting_check" CHECK ("patient_meal_configurations"."fasting" is null or "patient_meal_configurations"."fasting" in ('none', 'skip_breakfast', 'skip_dinner'))
);
--> statement-breakpoint
ALTER TABLE "patient_meal_configurations" ADD CONSTRAINT "patient_meal_configurations_patient_id_patient_profiles_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patient_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "patient_meal_configurations_patient_idx" ON "patient_meal_configurations" USING btree ("patient_id");