# Handoff rem-187

## Next action

L'opérateur coche Ready to merge. Ensuite, Release fusionne.

## How to test

Ouvrez `.icm/docs/README.md` dans la demande de fusion : sous la note du 26 septembre, une note du 19 novembre nomme la charte, son emplacement et le document qui gagne en cas de désaccord.

## What changed, and why no user sees it

- `.icm/docs/README.md` a une note de plus. Elle dit que la charte est dans `packages/ui/brand/`, que la charte fait foi pour l'identité et que les user stories font foi pour le fonctionnel.
- Le tableau de préséance ne change pas.
- Le ticket ne change qu'un document.

## Blockers

- Les aperçus Vercel de `admin` et `app` échouent : « Resource provisioning failed ». Le projet Neon `uat-remi-ai` a 10 branches, sa limite. L'opérateur libère des branches Neon ou monte la limite. Ensuite, une session relance les aperçus.

## Do not touch

- none
