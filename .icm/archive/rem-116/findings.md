# Findings rem-116

## Question ouverte pour Morgane (hors de ce ticket)

Ce ticket ajoute seulement le badge « prévu » / « mangé » dans le journal de la console
(périmètre BAXTER, 2026-11-24). La commande de bascule n'est pas construite.

Question : Morgane veut-elle une commande dans la console pour passer elle-même un repas de
« prévu » à « mangé » ? Sans cette commande, un repas que le patient ne marque pas « Je l'ai
mangé » reste « prévu ».

Si oui : un nouveau ticket (lane `new`). Le service refuse déjà une bascule dans l'autre sens
(`packages/services/src/db/services/meal-entries`).

Brouillon de commentaire Linear pour REM-116 (cette session n'écrit pas dans Linear) :

> Le journal de la console affiche maintenant un badge « prévu » ou « mangé » sur chaque repas.
> À tester sur UAT : fiche patient, section Journal. Question ouverte : veux-tu pouvoir passer
> toi-même un repas de « prévu » à « mangé » dans la console ? Si oui, on crée un ticket.
