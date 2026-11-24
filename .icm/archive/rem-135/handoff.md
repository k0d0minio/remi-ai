# Handoff rem-135

## Cause

Sur une preview Vercel, `appOrigin` (`packages/services/src/shared/links.ts`) ne connaît pas la
preview : sans `NEXT_PUBLIC_*_URL` pour la cible `preview`, il prend sa table, qui donne les adresses
de production.

## Correction

- `resolveOrigin` lit l'environnement Vercel (`VERCEL_TARGET_ENV`) et la branche git
  (`VERCEL_GIT_COMMIT_REF`). Sur une preview, il donne l'alias de branche du projet cible :
  `https://<projet>-git-<branche>-remi21.vercel.app`. Il ignore alors les `NEXT_PUBLIC_*_URL`.
- Une preview sans branche prend les origines UAT. `docs` n'a pas d'UAT et garde son adresse.
- `uat` et Production ne changent pas : la variable `NEXT_PUBLIC_*_URL`, puis la table.
- Chaque `next.config` copie les deux valeurs dans `NEXT_PUBLIC_VERCEL_TARGET_ENV` et
  `NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF`. Un composant client construit donc le même lien que le
  serveur. Les quatre noms sont dans `globalEnv` de `turbo.json` (clé du cache).
- Écart avec le ticket : le ticket propose de remplacer le nom du projet dans
  `NEXT_PUBLIC_VERCEL_BRANCH_URL`. Cela ne marche pas : Vercel coupe un libellé de plus de 63
  caractères et ajoute un hash propre à chaque projet. `vercelBranchAlias` refait la règle de
  Vercel : les 6 premiers caractères hex de sha256(`git-<branche><projet>`). La règle est vérifiée
  sur les 222 alias des pull requests du dépôt.
- Neon Auth : la branche `preview/<branche>` de `uat-remi-ai` liste déjà les alias `app-git-…` et
  `admin-git-…` de la branche dans ses origines de confiance (lu le 2026-11-24). Jamie n'a rien à
  faire dans la console Neon.

## Vérifié sur les previews (2026-11-24)

- La navigation de la preview `documentation` lie
  `https://app-git-contact-rem-135-les-liens-entre-applicati-f22013-remi21.vercel.app/fr` et
  `https://marketing-git-contact-rem-135-les-liens-entre-app-b3010e-remi21.vercel.app/fr`.
- Le `metadataBase` de la preview `marketing` est son propre alias de branche.
- Non vérifié : la page Patients de la preview admin demande une connexion d'opérateur.

## Next action

L'opérateur teste la preview, puis coche **Ready to merge**.

## How to test

Sur la preview admin de cette pull request, ouvrez Patients : « Mon lien d'inscription » commence
par `https://app-git-contact-rem-135-les-liens-entre-applicati-f22013-remi21.vercel.app/fr/inscription/`.
Ouvrez ce lien et inscrivez un patient de test. Le journal de la preview admin montre ses
événements.

## Blockers

- none

## Do not touch

- none
