# Handoff rem-154

## Next action

L'opérateur teste, puis coche **Ready to merge** sur la pull request 251.

## Ce qui a changé, et pourquoi aucun utilisateur ne le voit

- Le blueprint passe de 1.0.0-rc25 à 1.0.0-rc37, avec `database: postgres`.
- Le job `code` de `ci` applique chaque migration depuis zéro sur un Postgres 18 vide, puis
  lance `db:verify`. Une migration cassée rend la CI rouge avant toute preview.
- Le build Vercel de `admin` migre avec `.icm/_system/scripts/db.sh build`. Son `vercel.json`
  construit les paquets avec turbo, puis lance `vercel-build` (migration, puis `next build`).
  La migration tourne hors de turbo : un cache turbo ne la saute plus.
- `db:verify` utilise `pg`. Il atteint Neon et le Postgres de la CI. L'app garde son pilote Neon.
- `neon-preview-cleanup.yml`, `.icm/local/database.md` et `.icm/local/vercel-build.sh` sont
  retirés. Les previews lisent une seule base de preview : la branche `preview` de `uat-remi-ai`.

Aucun écran ne change. Seuls la CI, le build et la documentation changent.

## How to test

Ouvrez le journal de build de la preview `admin` de cette branche. Il dit « db.sh: the migration
of the preview database, before the build », puis « schema verified ». La preview s'ouvre.

## Blockers

- none. Le 2026-11-27, la base de preview fixe existe, avec ses secrets GitHub et ses
  variables Vercel. Le Redeploy de la preview `admin` (`dpl_HN4ddvZEHBXhs3phfesRGVWvfnqy`) est
  READY : son journal finit par « RESULT: OK built » de `db.sh build`.

## Do not touch

- `.icm/_system/` et `.github/workflows/{ci,promote,icm,db-reset}.yml` : ils appartiennent au
  blueprint.
