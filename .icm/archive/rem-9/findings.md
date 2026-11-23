# Findings rem-9

## F1. La version des CGV acceptée n'est pas enregistrée

Le ticket demande la traçabilité de la date et de la version des documents. Jamie a choisi de garder l'enregistrement actuel (2026-11-23, Q2). Seule la politique de confidentialité (`care`) a une ligne. Ticket de suivi proposé (voie `new`) :

> Inscription patient – Enregistrer la version des CGV acceptée. À l'inscription, enregistrer la version et l'empreinte des CGV acceptées, comme pour la politique de confidentialité.

## F2. Les CGV du pilote sont un brouillon

Le texte copié porte le bandeau « à faire valider par un juriste avant l'ouverture des ventes ». Après la validation, le nouveau texte est la version 2 de `texts/cgv/`, et le site public change aussi (`apps/marketing/lib/content/legal.ts`). Les deux copies doivent rester identiques.
