-- Idempotent by hand, which is the repair `scripts/migrate.mjs` prescribes in its own header.
--
-- This column already exists in the shared database: an earlier preview deploy of this branch
-- applied it under the migration's first number (0013_recipe_variants), before `link-writes`
-- merged and took 0013 on main. Regenerating renamed this one to 0014 with a fresh `when`, so
-- drizzle — which decides by high-water mark, never by hash — sees it as unapplied and runs it
-- again. Plain `ADD COLUMN` then fails with 42701 and takes the whole admin build with it.
--
-- Guarded, it no-ops where the column landed early and still applies in full to any database
-- that has never seen it.
ALTER TABLE "recipes" ADD COLUMN IF NOT EXISTS "variant_of_id" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "recipes" ADD CONSTRAINT "recipes_variant_of_id_recipes_id_fk" FOREIGN KEY ("variant_of_id") REFERENCES "public"."recipes"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
