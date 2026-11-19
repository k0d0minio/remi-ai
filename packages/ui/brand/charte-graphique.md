# Charte de design UI / UX

![Logo REMI](logo/remi-logo-charte.png)

**REMI | Identité de marque, ton de voix et identité visuelle**

> Source : « REMI Charte graphique.docx », Morgane Paquet, reçue le 16 novembre 2026. Texte de Morgane, repris tel quel : il est cité, jamais réécrit. Selon sa section 1, les documents de construction font foi pour tout ce qui est fonctionnel.

Direction artistique : frais, doux et très lisible. L’équilibre entre innovation technologique et accompagnement humain, avec des formes arrondies et une seule action dominante par écran.

## Principes directeurs

- Une expérience simple, lisible et rassurante.
- Une cohérence visuelle entre patient et praticien, sans imposer les mêmes densités d’information.
- Une interface mobile-first côté patient ; une interface de travail efficace côté praticien.
- Des composants, états et conventions d’interaction réutilisables.

## 1. Périmètre de la charte

Cette charte définit l’identité de REMI : marque et positionnement, ton de voix, logo, couleurs, typographie, formes, iconographie, aspect des composants, supports de communication et accessibilité visuelle. Tout ce qui est fonctionnel (fonctionnalités, règles métier, parcours, écrans, navigation, libellés exacts) est décrit dans les fiches et les documents annexes du document de construction, qui font foi.

## 2. Marque, personnalité et ton de voix

- Positionnement : REMI aide à passer du « je sais » au « je fais ». La plateforme traduit les recommandations d’un praticien en actions simples entre deux consultations.
- Baseline : « Entre recommandation et action »
- Promesse : savoir quoi faire aujourd’hui, pourquoi c’est pertinent pour soi, et progresser à son rythme.
- Sérieuse sans être froide : espaces blancs, structure nette, contrastes soignés.
- Humaine sans infantiliser : textes courts, ton positif et direct.
- Technologique sans surcharge : la sophistication se trouve dans le service, pas dans les effets visuels.
- Douce et arrondie : boutons en pilule, cartes arrondies employées avec parcimonie, titres expressifs en graisse 800, avec une hiérarchie compacte sur smartphone.
- Nutrition accessible : pas de codes visuels de régime punitif. Le MVP n’utilise aucune photo ni illustration.

Ton de voix : le patient est tutoyé de manière uniforme ; le praticien est approché de façon neutre, concise et professionnelle. REMI suggère, le praticien recommande.

- Plutôt « Voici une piste simple », jamais « Vous avez mal mangé ».
- Plutôt « Tu peux essayer », jamais « Tu dois absolument ».
- Plutôt « adapter ton repas », jamais « corriger ta mauvaise alimentation ».
- Mots à privilégier : piste, idée, essayer, adapter, à ton rythme. Mots à éviter : interdit, régime, échec.
- REMI ne diagnostique pas : jamais les verbes diagnostiquer, prescrire, soigner ou guérir, et aucune promesse de résultat santé.

## 3. Identité et logo

Les codes officiels suivants ont été communiqués pour les quatre lettres du logo. Leur usage comme couleurs d’interface est une proposition de design cohérente avec la marque.

| **Lettre** | **Couleur** | **Usage d’interface privilégié**                                            |
| ---------- | ----------- | --------------------------------------------------------------------------- |
| R          | `#3362AE`   | Boutons principaux, onglet actif, icônes d’action                           |
| E          | `#3464AF`   | Éléments de marque secondaires                                              |
| M          | `#2A82C5`   | Pictogrammes informatifs (24 px minimum)                                    |
| I          | `#00A6A9`   | Petit accent turquoise (point, filet). Jamais de texte ni de fond de bouton |

- Utiliser l’actif officiel du logo : ne pas redessiner ni réagencer les lettres.
- Respecter ses proportions et une zone libre au moins égale à la hauteur de la lettre « I » autour du bloc logo (proposition de règle à valider sur le master).
- Sur fonds foncés, employer uniquement une variante du logo officiellement validée ; ne pas inverser les couleurs automatiquement.
- Sur smartphone, utiliser un logo compact (largeur indicative 96 à 120 px), avec des marges verticales réduites : l’action principale doit apparaître rapidement, sans défilement inutile. Préserver la zone de protection du logo.

## 4. Design tokens — proposition UI

| **Token**        | **Valeur**                                                     | **Rôle**                                                     |
| ---------------- | -------------------------------------------------------------- | ------------------------------------------------------------ |
| brand.primary    | `#3362AE`                                                      | Action prioritaire                                           |
| brand.secondary  | `#2A82C5`                                                      | Accent secondaire                                            |
| brand.accent     | `#00A6A9`                                                      | Accent distinctif                                            |
| text.primary     | `#253348`                                                      | Titres et corps                                              |
| text.secondary   | `#566579`                                                      | Descriptions et aides                                        |
| surface.page     | `#F4F8FC`                                                      | Fond général                                                 |
| surface.card     | `#FFFFFF`                                                      | Cartes et formulaires                                        |
| surface.soft     | `#E4EDF8`                                                      | Pastilles d’icône, zones d’information, état actif           |
| border.default   | `#D9E2EB`                                                      | Contours et séparateurs                                      |
| shadow.card      | 0 1px 3px rgba(37,51,72,0.04), 0 4px 12px rgba(37,51,72,0.025) | Cartes à mettre en relief seulement si nécessaire            |
| shadow.float     | 0 6px 20px rgba(37,51,72,0.10)                                 | Barre de navigation flottante, fenêtres (élévation discrète) |
| feedback.error   | `#B42318`                                                      | Erreur                                                       |
| feedback.success | `#1F7A4D`                                                      | Succès                                                       |
| feedback.warning | `#925F12`                                                      | Attention                                                    |
| focus.ring       | `#2A82C5`                                                      | Contour focus visible                                        |

Ne jamais utiliser une couleur comme unique vecteur d’information. Tester les contrastes des couples réels texte / fond et ajuster les nuances pour atteindre WCAG AA. Contrastes mesurés : texte blanc sur brand.primary 6,0:1 (conforme). brand.accent (3,0:1) et brand.secondary (4,1:1) ne servent ni de fond de bouton avec texte blanc ni de texte courant : réservés aux pictogrammes, filets et éléments d’au moins 24 px. Les couleurs success, warning et error sont toujours accompagnées d’une icône et d’un libellé.

## 5. Typographie

Police : Plus Jakarta Sans (graisses 400 à 800), repli system-ui / sans-serif. Titres en graisse 800 avec un interlettrage légèrement serré (−0,8 px sur le titre d’écran). Éviter les polices décoratives.

| **Usage**                | **Taille / interligne** | **Graisse** |
| ------------------------ | ----------------------- | ----------- |
| Titre d’écran            | 32 / 38 px              | 800         |
| Titre de section         | 18 / 24 px              | 800         |
| Titre de carte           | 16 / 22 px              | 600–700     |
| Corps principal          | 16 / 24 px              | 400         |
| Aide et méta             | 14 / 20 px              | 500–600     |
| Microtexte non essentiel | 13 / 18 px              | 600         |

- Limiter chaque écran à une hiérarchie H1 > H2 > H3 cohérente. Sur l’accueil mobile, privilégier une salutation moins volumineuse (24 à 28 px) et un sous-texte facultatif d’une ligne maximum ; éviter qu’ils repoussent l’action principale sous la ligne de flottaison.
- Aligner les longs textes à gauche ; préférer des lignes courtes et des listes aux blocs denses.
- Prévoir le zoom, le retour à la ligne et les libellés longs sans hauteur fixe.

## 6. Grille, dimensions et responsive

| **Élément**          | **Convention proposée**                                                                                                                              |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Échelle d’espacement | 4, 8, 12, 16, 24, 32, 48 px                                                                                                                          |
| Marge mobile         | 20 px                                                                                                                                                |
| Conteneur de lecture | Largeur max 720–800 px selon l’écran                                                                                                                 |
| Cartes               | Carte principale : rayon 24 px, padding 16 px. Cartes secondaires : rayon 16–20 px, padding 12–16 px ; éviter d’empiler plusieurs cartes décoratives |
| Champs               | Rayon 16 px dans une carte ; hauteur 48 px ou plus                                                                                                   |
| Boutons              | Pilule (rayon 999 px) ; 56 px pour le bouton principal, 44 px pour les secondaires                                                                   |
| Cibles tactiles      | Viser au moins 44 × 44 px                                                                                                                            |
| Mobile               | Mise en page en une colonne                                                                                                                          |
| Tablette             | Colonnes multiples si lisibilité préservée                                                                                                           |
| Desktop praticien    | Contenu centré ou en grille, navigation stable                                                                                                       |

Sur les petits écrans : pas de défilement horizontal, pas de tableaux larges non adaptés ; transformer les grilles en cartes empilées lorsque nécessaire. Réduire les espaces verticaux du haut de page et prioriser le contenu utile dès le premier écran.

## 7. Iconographie et visuels

- Icônes : style ligne, épaisseur cohérente (ex. Lucide), taille 20–24 px ; accompagner les destinations importantes d’un libellé.
- Aucune photo ni illustration dans l’application (MVP) : les cartes sont textuelles, avec un pictogramme neutre si besoin.
- Éviter les silhouettes médicales, les balances, les flammes / trophées et les représentations culpabilisantes.
- Animatique : transitions discrètes 150–250 ms ; respecter les préférences de mouvement réduit.

## 8. Aspect des composants

| **Composant**             | **Aspect visuel**                                                                                                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Button primary            | Pilule, fond bleu principal, texte blanc, 56 px de haut ; libellé court et explicite (« Améliorer mon repas » pour l’action principale de l’accueil) ; un seul bouton dominant |
| Button secondary          | Pilule, fond blanc, bordure légère, 44 px de haut ; poids visuel moindre                                                                                                       |
| Link / text button        | Soulignement ou convention claire ; zone tactile suffisante                                                                                                                    |
| Text input                | Libellé toujours rattaché au champ : la question du titre au-dessus peut faire office de libellé, jamais le placeholder seul                                                   |
| Textarea                  | Hauteur confortable et extension verticale ; compteur seulement si utile                                                                                                       |
| Select / radio / checkbox | Choix lisibles ; zones de clic généreuses ; groupe titré                                                                                                                       |
| Card                      | Fond blanc, rayon 16–24 px ; ombre très légère seulement si la séparation visuelle l’exige ; sinon fond ou trait discret                                                       |
| Status label              | Texte bref + éventuelle icône ; jamais couleur seule                                                                                                                           |
| Bottom navigation         | Barre flottante en pilule blanche (shadow.float allégée), marge de 20 px ; onglet actif en pilule bleue ; icône et libellé visibles                                            |

### 8.1. Allègement visuel de l’accueil mobile

- Priorité au premier écran : afficher rapidement la question principale et son champ, sans bloc introductif disproportionné.
- Logo et salutation compacts : réduire leur taille et leurs marges sans sacrifier la lisibilité ni la zone de protection de la marque.
- Appel à l’action de l’accueil : utiliser le libellé « Améliorer mon repas » dans le bouton principal, court et immédiatement compréhensible.
- Profondeur visuelle maîtrisée : privilégier les espaces blancs, les contrastes et une seule carte dominante ; réserver les ombres à la séparation réellement nécessaire.
- Éviter la densité artificielle : aucune accumulation de cartes et d’icônes sans rôle clair ; la navigation reste visible et stable.

## 9. Supports de communication

Règles communes à tous les supports (e-mails, présentations, réseaux sociaux, site). Les contenus et messages sont définis ailleurs.

- Logo : toujours en couleur sur fond blanc ou très clair ; toute version sur fond foncé doit être validée avant usage.
- Couleurs : fonds clairs sur environ 80 % de la surface, bleu principal pour l’élément clé (titre, bouton), turquoise en petit accent.
- Typographie : Plus Jakarta Sans, un seul titre fort par support en graisse 800.
- Formes : coins arrondis, boutons d’appel à l’action en pilule bleue, cartes avec ombre très discrète ou sans ombre selon le contexte.
- Une idée et un seul appel à l’action par support ; ton tutoyé pour les patients, neutre et professionnel pour les praticiens.
- Visuels : l’application n’utilise ni photo ni illustration (MVP). Pour la communication, les photos culinaires naturelles (lumière douce, assiettes réalistes) restent possibles ; éviter silhouettes médicales, balances, flammes et trophées.
- Aucune promesse de guérison, de prévention ou de diagnostic dans les supports.

## 10. Accessibilité visuelle et confort d’usage

- Objectif : WCAG 2.2 AA, notamment contraste 4,5:1 pour texte courant et 3:1 pour grandes typographies, sous les exceptions prévues par la norme.
- Focus clavier toujours perceptible ; ordre de tabulation logique et cohérent avec l’ordre visuel.
- Les icônes interactives ont un nom accessible ; les champs ont un label permanent.
- Les messages d’erreur relient visuellement et sémantiquement le problème au champ.
- Les éléments tactiles gardent une taille confortable et ne sont pas trop proches.
- Ne pas dépendre de l’animation, de la couleur ou du survol pour une action essentielle.
- Respecter le zoom à 200 % et les tailles de police augmentées sans perte de contenu.
