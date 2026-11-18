# Handoff rem-15

## Next action

L'opérateur coche Ready to merge. Ensuite, Release fusionne.

## How to test

Ouvrez la demande de fusion. Les fichiers changés sont dans `.icm/_system/`, dans `.github/workflows/` et dans `.icm/setup/`. Aucun fichier d'une app ne change, et chaque contrôle est vert.

## What changed, and why no user sees it

- `.icm/_system/` a le blueprint BAXTER 1.0.0-rc14. `update-repo.sh` a fait le changement.
- Les nouvelles voies `hotfix`, `handover` et `knowledge` existent. Le skill `pipeline` les nomme.
- `ci.yml` ne lance aucun job sur une demande de fusion en brouillon. La version de Node vient de `.nvmrc`. Le dépôt n'a pas de `.nvmrc`, donc la CI garde Node 22, comme `engines` de `package.json`.
- Les réponses ont `linear_writes: false` et `release_config: false`. Ces valeurs ne changent rien.
- La nouvelle action `.icm/setup/remove-husky.md` est ouverte. Le retrait de husky est une autre tâche (`findings.md`).
- Ces fichiers sont des outils de travail. Aucune page et aucune donnée ne changent.

## Blockers

- none

## Do not touch

- none
