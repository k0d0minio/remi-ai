# Findings rem-15

L'opérateur les classe plus tard. Une entrée par constat.

## Retirer husky et lint-staged

- where: `.husky/pre-commit`, `package.json` (script `prepare`, paquets `husky` et `lint-staged`, clé `lint-staged`), `pnpm-lock.yaml`
- what: Le blueprint 1.0.0-rc14 a écrit l'action `.icm/setup/remove-husky.md`. Le retrait change le fichier de verrouillage. Ce run est une seule tâche (la mise à jour du blueprint), donc le retrait n'est pas dans ce run.
- proposed: chore

## Lien vers une section absente du routeur

- where: `.icm/local/database.md`, ligne 79
- what: Le texte renvoie à « `.icm/_system/ROUTER.md` § The setup stub ». Le routeur n'a pas cette section (ni en rc13, ni en rc14). Le bon renvoi est `.icm/setup/README.md`.
- proposed: knowledge
