# Handoff rem-175

## Next action

L'opérateur teste le changement et coche **Ready to merge**. Ensuite, il dit `release REM-175`.

## Decision

- Q1 : l'opérateur garde le thème sombre caché pour plus tard (réponse de Jamie, 2026-11-19).
- Le bloc `.dark` de `tokens.css`, `themeScript`, `ThemeToggle` et leurs exports restent dans `@remi/ui`.
- Les mises en page de `apps/web` et `apps/admin` n'injectent plus `themeScript`. Aucun écran ne montre le bouton de thème.
- `apps/docs` : Nextra force le thème clair et cache son bouton de thème.

## How to test

Mettez l'appareil en mode sombre. Ouvrez l'application, la console et la documentation : chaque page reste claire. Le menu du compte et l'en-tête de la console n'ont plus de bouton de thème.

## Blockers

- none

## Do not touch

- none
