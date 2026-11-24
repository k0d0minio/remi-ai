# Handoff rem-133

## Cause

`deletePatient` supprime le dossier par la cascade de la base, mais `patient_accounts.auth_subject` garde l'identifiant de l'utilisateur Neon Auth en texte, sans clé étrangère : aucune cascade n'atteint `neon_auth."user"`, et la couche d'authentification n'avait aucun appel de suppression.

## Correction

- `AuthProvider.deleteUser(subject)` : nouvel appel de la couche d'authentification. Un sujet inconnu est un succès. Un refus renvoie `upstream_failed`.
- L'adaptateur Neon Auth supprime la ligne `neon_auth."user"` par `DATABASE_URL`. Les cascades du schéma suppriment `account`, `session` et `member`. Le SDK n'a pas d'appel qui supprime un autre utilisateur sans session admin, et la console ne se connecte pas par Neon Auth. Le rôle propriétaire de la base est membre du rôle `neon_auth` (vérifié en lecture sur `uat-remi-ai`, le 2026-11-24).
- L'adaptateur construit le SDK au premier appel qui l'utilise. La console (`apps/admin`) l'enregistre donc sans variable `NEON_AUTH_*`, pour `deleteUser` seulement (`apps/admin/lib/auth/provider.ts`).
- `deletePatient` : sans adaptateur et avec un compte, refus avant toute suppression. Ordre : fichiers, utilisateur d'authentification, dossier. Un refus garde le dossier, et un nouvel essai termine la suppression.
- La tâche d'inactivité (`/api/cron/inactive-accounts`) enregistre l'adaptateur avant le balayage.
- `.icm/docs/RETENTION.md` nomme le schéma `neon_auth` et son chemin de suppression.

## Next action

L'opérateur teste sur la preview, puis coche **Ready to merge**. Ensuite : `release REM-133`.

## How to test

Sur la preview, inscrivez un patient de test avec une adresse e-mail de test, puis supprimez son dossier dans la console. Essayez ensuite de vous connecter avec cet e-mail et ce mot de passe : la connexion est refusée, et une nouvelle inscription avec la même adresse est acceptée.

## Blockers

- none

## Do not touch

- Les réglages Neon Auth des projets Neon.
