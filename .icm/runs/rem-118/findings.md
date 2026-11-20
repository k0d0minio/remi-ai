# Findings rem-118

The operator files these later. One entry for each finding.

## `database.md` dit que `db:migrate` tient un verrou, et il n'en tient pas

- where: `.icm/local/database.md` § The migration rule, et `packages/services/scripts/migrate.mjs`
- what: La règle dit que `db:migrate` tient un verrou consultatif Postgres pendant toute l'exécution. `migrate.mjs` lance `drizzle-kit migrate` sans verrou. Deux builds qui migrent la même base en même temps ne sont pas mis en file.
- proposed: chore

## Le stub de REM-118 nomme des fichiers qui ont changé depuis

- where: `.icm/intake/triage/_done/db-migrate-connection-retry.md`
- what: Le stub dit que la requête de vérification est dans `migrate.mjs` et que `DATABASE_URL_UNPOOLED` est absente de `turbo.json`. La requête est maintenant dans `scripts/verify.mjs`, et `turbo.json` nomme `DATABASE_URL_UNPOOLED`. Ce run a changé `verify.mjs`. Il n'a changé ni `turbo.json` ni `drizzle.config.ts`.
- proposed: knowledge

## Dans un worktree, aucun hook de pre-commit ne s'exécute

- where: `.husky/pre-commit`, `core.hooksPath=.husky/_`
- what: Le dossier `.husky/_` n'est pas dans le dépôt. Un nouveau worktree n'a donc pas de dossier de hooks, et `lint-staged` ne s'exécute pas. Le contrôle de format de la CI est alors le seul contrôle. Ce run a été fait dans un worktree.
- proposed: chore
