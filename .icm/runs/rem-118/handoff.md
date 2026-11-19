# Handoff rem-118

## Next action

L'opérateur coche Ready to merge. Ensuite, Release fusionne.

## How to test

Ouvrez le journal de build de la préversion `admin` de la demande de fusion. La ligne `[db:migrate] ... applying the checked-in migrations` est présente, puis `[db:verify] schema verified`, et le build est vert. Une ligne `attempt 1 of 4: the connection to the database failed` apparaît seulement si Neon coupe la connexion.

## What changed, and why no user sees it

- `db:migrate` et `db:verify` font 4 tentatives au plus après un échec de connexion à Neon. Les attentes sont de 2 s, 4 s et 8 s. Chaque tentative en échec écrit une ligne dans le journal de build.
- Seul un échec de connexion donne une nouvelle tentative. La décision lit le texte de l'erreur, pas le code de sortie. Une migration qui échoue à s'appliquer arrête le build à la première tentative, comme avant.
- La règle et la liste des textes d'erreur sont dans `packages/services/scripts/connection-retry.mjs`.
- `.icm/docs/ENV.md` dit que les autres noms de l'intégration Neon (`PGHOST`, `POSTGRES_URL`, ...) sont absents de `turbo.json` volontairement. `turbo.json` ne change pas.
- `drizzle.config.ts` ne change pas : la nouvelle tentative est autour de la commande `drizzle-kit migrate`.
- Le stub `triage/db-migrate-connection-retry.md` est dans `triage/_done/`.
- Ces fichiers sont des scripts de build et des documents. Aucune page et aucune donnée ne changent.

## Not verified

- La nouvelle tentative elle-même n'est pas prouvée : il faut une branche Neon lente ou une connexion coupée. Un build normal prouve seulement le chemin sans échec.
- Aucun test : le dépôt n'a pas de place de test pour les scripts de `packages/services/scripts/`.

## Blockers

- none

## Do not touch

- none
