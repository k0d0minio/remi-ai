ALTER TABLE "recipes" ADD COLUMN "variant_of_id" uuid;--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_variant_of_id_recipes_id_fk" FOREIGN KEY ("variant_of_id") REFERENCES "public"."recipes"("id") ON DELETE restrict ON UPDATE no action;
