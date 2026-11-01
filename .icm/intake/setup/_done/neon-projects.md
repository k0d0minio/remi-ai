> Done: Jamie, 2026-11-01

# Setup: the Neon projects

- setup-slug: neon-projects
- needs: database neon
- where: the Neon console → the organisation

## Why

Production's data lives in `remi-ai`. Every other deployment reads `uat-remi-ai`, so
production's data never reaches a preview.

## Steps

1. In the Neon console, open the client's organisation.
2. Make the project `remi-ai` for production, in the region nearest to the Vercel functions.
3. Make the project `uat-remi-ai` for UAT, in the same region.
4. Put test data only in `uat-remi-ai`. Never copy production's rows into it.
5. Compare the project names with the column `Database` of `.icm/environments.md`.
   If a name is different, correct the column.

## Done when

- [ ] The project `remi-ai` exists.
- [ ] The project `uat-remi-ai` exists, with test data only.
- [ ] The column `Database` of `.icm/environments.md` names `remi-ai` and `uat-remi-ai`.
