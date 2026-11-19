# Handoff rem-182

## Next action

L'opérateur teste le changement et coche **Ready to merge**. Ensuite, il dit `release REM-182`.

## Decision

- Q1 : Morgane n'a pas de fichier vectoriel. Le PNG de la charte (`packages/ui/brand/logo/remi-logo-charte.png`) est la référence (Jamie, 2026-11-19, « No, use the PNG »).
- Le PNG de la charte a des couleurs plates et des bords nets. `remi-logo.png` du 2 novembre avait un dégradé et des bords irréguliers. Les fichiers servis sont découpés du PNG de la charte.
- En mode sombre (`apps/web`, `apps/admin`, `apps/docs`), le logo est sur une plaque blanche. La charte interdit le logo sur fond foncé et les couleurs inversées.

## How to test

Ouvrez la page de connexion de la console et l'accueil de l'app : le logo REMI en couleurs remplace le « REMI » en serif. L'onglet du navigateur montre un R bleu sur un carré blanc, dans les quatre apps. Sur un téléphone, le logo a environ 100 px de large.

## Blockers

- Vercel `admin` et `app` : « Resource provisioning failed ». Le projet Neon `uat-remi-ai` a sa limite de 10 branches. La session attend la fusion d'une autre demande de la charte, puis pousse un commit du dossier du run.

## Do not touch

- none
