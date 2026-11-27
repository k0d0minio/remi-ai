# Constats — REM-154

## Décision de Jamie

- 2026-11-27, chat : pas de vérifications obligatoires dans le ruleset de `main`. Ses mots :
  « no i don't want stringent requirements on every repo. Plus the code ci job is very time
  intensive ». La lacune `gh.ruleset` de `setup.sh` reste ouverte. Le run continue malgré
  `RESULT: STOP`.

## Défauts du blueprint (pour le blueprint, pas pour ce dépôt)

- `setup/items.json` marque `gh.ruleset` avec `block: true`. Ce blocage contredit la décision
  de Jamie ci-dessus. `setup.sh --gate` arrête donc chaque run de ce dépôt.

## Défauts de BAXTER

- La fiche du projet `remi-ai` n'a pas `metadata.aliases.tool_accounts.vercel`.
  `baxter_env.py actions-setup remi-ai` refuse de tourner.
- `config/vercel_teams.json` n'a que le compte `kodominio`. Il n'a pas `remi21`
  (équipe `remi21`, id `team_4W5cPb8fsRXyJja4yjyXEyMn`).
- Le trousseau n'a aucune valeur pour `remi-ai` (preview, uat, production).

## Hors du ticket

- Trois commentaires de `.env.example` nomment encore `vercel-build.sh` et
  `.icm/local/database.md` (racine, `apps/admin`, `apps/web`). Le garde des secrets bloque
  leur modification par la session.
- Seul `admin` migre. `app` (web) se construit sans migration. Il peut servir avant la fin de
  la migration du build `admin` (constat de triage `web-build-does-not-call-vercel-build`).
- Le secret GitHub `NEON_API_KEY` ne sert plus depuis le retrait de
  `neon-preview-cleanup.yml`.
