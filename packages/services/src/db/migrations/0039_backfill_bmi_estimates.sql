-- Backfill the BMI estimate of every file with a plausible height and weight
-- (story 7, Jamie's answer to question 6 on 2026-11-10). From now on the
-- services write it at each save of the height or the weight. The formula,
-- the ranges and the rounding are those of `bmiIndicator()` in
-- `src/shared/calculations.ts`.
INSERT INTO "patient_calculations" ("patient_id", "kind", "estimated_value", "estimate_parameters", "estimated_at")
SELECT
  "id",
  'bmi',
  round(("weight_kg" / power("height_cm" / 100.0, 2))::numeric, 1)::double precision,
  jsonb_build_object('heightCm', "height_cm", 'weightKg', "weight_kg"),
  now()
FROM "patient_profiles"
WHERE "height_cm" BETWEEN 100 AND 250
  AND "weight_kg" BETWEEN 25 AND 300
ON CONFLICT ("patient_id", "kind") DO NOTHING;
