# Breakdown: patient-home-navigation — the patient opens REMI and improves a meal in one action

- epic-slug: patient-home-navigation
- source: story 31 « Accueil et navigation de l'espace patient », Morgane Paquet, 15 October 2026, https://drive.google.com/file/d/1wjiQzdXEq-7L2pKzNQ963qEbODo6iIeK/view
- story: 31

## What I understood

After activation and sign-in the patient lands on « Accueil »: a discreet logo, « Bonjour [Prénom] », access to the profile, and before anything else the block « Qu'as-tu prévu de manger ? » with a text field (story 33 removed the photo on 2026-10-27) and the one main button « Obtenir une suggestion d'amélioration », which opens story 28's flow and nothing else. A fixed bottom bar on the phone has three entries, « Accueil », « Recettes », « Profil », with the active one marked. « Recettes » shows the day's proposals, then « Mes favoris ». « Liste de courses » is an action from a recipe, not a tab. « Profil » opens on « Recommandations » (story 23), then « Mes informations personnelles », then the account settings. « Je suis au restaurant » appears only when story 29 ships. Mobile first: one dominant button per screen, explicit labels, enough contrast, no carousel, no hidden essential action. On `main` the token link `apps/web/app/[locale]/p/[token]` has ten pages, among them repas, progression, messages, placard-frigo and documents, which story 30 and the stories' silence rule out. This epic builds the signed-in shell in `apps/web/app/[locale]/(app)/` and retires the token route (D-26). Rests on D-26, D-29, D-30. The Recettes tab's content is `recipe-space`.

### Questions for Morgane

1. The patients who use a token link today: do they receive an invitation to create an account, or do you recreate them? Default: an invitation e-mail to the address on file, and the token link stops when the account is activated.
2. Which profile fields may the patient edit after activation? Default: weight, activity level, diet, allergies, intolerances, medications, supplements, goal weight and phone. Not name, birth date or e-mail. The e-mail changes from the account settings.
3. September's « Mes essentiels », « Mes documents », the challenges, « Ma progression » and the feedback box are not in the stories. They go? Default: yes, they go.
4. The greeting uses the first name from sign-up. Fine? Default: yes.

### Questions for Jamie

1. Keep `patient_link_writes` and the token columns for the audit trail, or drop them with the route? Default: keep the tables, remove the route, say so in `RETENTION.md`.
2. Build the shell on the existing `(app)` route group in `apps/web`? Default: yes.

## Build order

1. app-shell-and-nav — the signed-in layout, the greeting, the bottom bar, mobile-first rules — depends-on: none
2. home-meal-block — « Qu'as-tu prévu de manger ? », the text field, the one button, the restaurant entry — depends-on: app-shell-and-nav
3. profile-tab — Recommandations first, « Mes informations personnelles », the account settings — depends-on: app-shell-and-nav
4. retire-token-link — the token route goes, with a message and an invitation path — depends-on: profile-tab

## Criteria → stubs

| #   | Morgane's criterion (short, her French kept)                                                                                                                                                                    | Stub                                                                                           |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| 1   | « À chaque connexion d'un patient actif, la page d'accueil est affichée par défaut, avec son prénom »                                                                                                           | app-shell-and-nav                                                                              |
| 2   | « Le champ repas accepte une description ; l'ajout de photo (removed by story 33) et le bouton principal conduisent à la fiche 28 … la limite de deux propositions restent gérés dans ce parcours »                                   | home-meal-block                                                                                |
| 3   | « Les trois destinations principales sont accessibles depuis toutes les pages principales ; l'onglet actif est identifiable … “Recommandations” est accessible depuis “Profil” sans onglet principal distinct » | app-shell-and-nav, profile-tab                                                                 |
| 4   | « Les propositions de recettes sont consultables par jour et par moment de repas prévu ; favoris et liste de courses sont accessibles sans onglets supplémentaires »                                            | recipe-space/patient-recipes-today, recipe-card/favourites, shopping-list/shopping-list-screen |
| 5   | « “Je suis au restaurant” n'apparaît que si le bonus est disponible ; son absence ne bloque pas la navigation MVP »                                                                                             | home-meal-block                                                                                |
| 6   | « Les recommandations consultables depuis “Profil” sont uniquement celles validées … Les informations du profil modifiables sont clairement identifiées »                                                       | profile-tab                                                                                    |
| 7   | « Les fonctionnalités de l'espace patient sont bloquées tant que l'accompagnement n'a pas été activé par le praticien »                                                                                         | patient-access/waiting-screen                                                                  |
| 8   | « L'interface est utilisable sur petit écran, au clavier et avec des libellés lisibles ; le bouton principal reste clairement identifiable »                                                                    | app-shell-and-nav                                                                              |

## Out of scope

- The suggestion flow behind the button: `meal-improvement`.
- The Recettes tab's content, favourites and the shopping list: `recipe-space`, `recipe-card`, `shopping-list`.
- The restaurant feature: `restaurant-menu` (P2).
- The practitioner's view of the day's recipes, which story 31 asks for as its own story: `practitioner-daily-recipes` (story 32).
