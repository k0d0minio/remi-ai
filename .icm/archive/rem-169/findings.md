# Findings rem-169

The operator files these later. One entry for each finding.

Les écarts entre le code et la charte (`packages/ui/brand/charte-graphique.md`). Ce ticket n'en corrige aucun. Chaque écart devient un ticket si Jamie le décide.

## Couleurs de marque

- where: `packages/ui/src/tokens.css` (`--brand-600`, `--vital-500`, `--gradient-brand`), `packages/ui/src/lib/brand.ts` (`BRAND_COLORS`)
- what: Le bleu principal du code est `#045cc7`. La charte donne `#3362AE` (brand.primary). L'arrêt du milieu du dégradé est `#0a7ad8`. La charte donne `#2A82C5` (brand.secondary) et ne nomme aucun dégradé. Le turquoise du code est `#00a7a8`. La charte donne `#00A6A9` (brand.accent).
- proposed: new ticket

## Le turquoise comme couleur de succès

- where: `packages/ui/src/tokens.css` (`--success`)
- what: Le code utilise le turquoise comme fond de l'intention succès. La charte réserve le turquoise à un petit accent, jamais un texte ni un fond de bouton, et donne `#1F7A4D` pour le succès.
- proposed: new ticket

## Couleurs d'attention et d'erreur

- where: `packages/ui/src/tokens.css` (`--warning`, `--error`)
- what: Le code a un orange (`#ff8a5b`) et un rouge en oklch. La charte donne `#925F12` (feedback.warning) et `#B42318` (feedback.error).
- proposed: new ticket

## Texte, fonds, bordure et focus

- where: `packages/ui/src/tokens.css` (`--foreground`, `--muted-foreground`, `--background`, `--border`, `--ring`)
- what: Le code a une encre marine, un fond de page blanc et un anneau de focus `--brand-500`. La charte donne text.primary `#253348`, text.secondary `#566579`, surface.page `#F4F8FC`, surface.soft `#E4EDF8`, border.default `#D9E2EB` et focus.ring `#2A82C5`.
- proposed: new ticket

## Ombres

- where: `packages/ui/src/tokens.css` (`--shadow-xs` à `--shadow-xl`)
- what: Le code a cinq ombres. La charte en donne deux : shadow.card et shadow.float.
- proposed: new ticket

## Thème sombre

- where: `packages/ui/src/tokens.css` (`.dark`), `packages/ui/src/components/theme-toggle.tsx`
- what: Le code a un thème sombre. La charte n'en décrit aucun, et sa section 3 interdit d'inverser les couleurs du logo sur fond foncé sans variante validée.
- proposed: question for the ticket

## Police

- where: `apps/web/app/[locale]/layout.tsx`, `apps/admin/app/layout.tsx`, `apps/marketing/app/[locale]/layout.tsx`, `packages/ui/src/tokens.css` (`--font-family-sans`, `--font-family-display`)
- what: Les apps chargent Inter, et `web` et `admin` chargent aussi Instrument Serif pour les titres. La charte donne Plus Jakarta Sans, graisses 400 à 800, des titres en graisse 800, et demande d'éviter les polices décoratives.
- proposed: new ticket

## Échelle typographique

- where: `packages/ui/src/tokens.css` (`--text-4xl` à `--text-7xl`), le composant `Typography`
- what: Le code garde l'échelle de Tailwind et une échelle d'affichage. La charte donne six tailles, du titre d'écran (32 / 38 px, graisse 800, interlettrage −0,8 px) au microtexte (13 / 18 px).
- proposed: new ticket

## Arrondis

- where: `packages/ui/src/tokens.css` (`--radius: 0.625rem`), `packages/ui/src/server/card.tsx` (`rounded-xl`)
- what: Le rayon de base du code est 10 px, et la carte a 14 px. La charte donne 24 px pour la carte principale, 16 à 20 px pour les cartes secondaires et 16 px pour les champs.
- proposed: new ticket

## Boutons

- where: `packages/ui/src/components/button.tsx`
- what: Le bouton du code a `rounded-md` et des hauteurs de 32, 36, 40 et 48 px. La charte donne une pilule (rayon 999 px), 56 px pour le bouton principal et 44 px pour les secondaires.
- proposed: new ticket

## Tutoiement dans l'application patient

- where: `apps/web/lib/content/fr.ts` (par exemple les lignes 243, 465, 592 et 607), `apps/web/app/[locale]/inscription/[token]/`
- what: Les textes que le patient lit emploient « vous ». La charte demande que le patient soit tutoyé de manière uniforme. Les textes du praticien restent neutres. Il faut vérifier quelles pages de `inscription/` et de `(app)/` un patient voit.
- proposed: new ticket

## Le mot « régime »

- where: `apps/web/lib/content/fr.ts` (lignes 336, 591, 592 et 607)
- what: Des textes du patient emploient « régime ». La charte le met dans les mots à éviter.
- proposed: question for the ticket

## Logo et glyphe

- where: `packages/ui/src/lib/brand.ts` (`BRAND_GLYPH_PATH`), le composant `Wordmark`, `packages/ui/brand/logo/`
- what: Trois apps ont encore le « R » à empattements comme icône, et `Wordmark` écrit le nom en texte. La charte demande l'actif officiel du logo, sans le redessiner. Le stub `.icm/intake/triage/logo-mark-in-every-app.md` couvre ce point. Le logo de la charte (`logo/remi-logo-charte.png`, 725 × 229) et le logo du 2 novembre (`logo/remi-logo.png`) n'ont pas les mêmes couleurs : Morgane dit lequel est le master.
- proposed: question for the ticket

## Phrase de marque

- where: `packages/ui/src/lib/brand.ts` (`BRAND_TAGLINE`)
- what: Le code a la phrase du pied de page du 2 novembre. La charte donne la baseline « Entre recommandation et action ». Les deux peuvent exister ensemble. Morgane dit si la baseline remplace la phrase.
- proposed: question for the ticket

## Visuels

- where: `packages/ui/brand/visuals/`
- what: Le dossier a trois visuels avec photo. La charte dit que l'application n'utilise ni photo ni illustration (MVP). Aucune app ne sert ces fichiers aujourd'hui. Ils restent possibles pour la communication.
- proposed: question for the ticket

## Tableau de palette du dossier brand

- where: `packages/ui/brand/README.md`
- what: Le tableau « The palette the logo gives » a les valeurs du code, pas celles de la charte. Ce ticket ajoute un renvoi vers la charte. Le tableau change avec le ticket des couleurs.
- proposed: chore

## Route dans CLAUDE.md

- where: `CLAUDE.md`, tableau Routing
- what: La route vers la charte est dans `CONVENTIONS.md`, `packages/ui/AGENTS.md` et `apps/web/AGENTS.md`. `CLAUDE.md` n'a pas de ligne pour la charte : cette session ne modifie pas `CLAUDE.md` sans le mot de Jamie.
- proposed: chore

## Documents du client dans le dépôt

- where: `.icm/docs/README.md`, note du 2026-09-26 (D47)
- what: La note dit que les documents du client vivent dans icm-board et pas dans ce dépôt. La charte entre dans `packages/ui/brand/`, à côté des fichiers de marque du 2 novembre, sur le mot de Jamie du 2026-11-19. La note D47 ne nomme pas cette exception.
- proposed: knowledge
