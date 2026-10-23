# Breakdown: knowledge-base-requests — « Demander l'ajout » of a term REMI does not know

- epic-slug: knowledge-base-requests
- source: story 15 « Demande d'ajout d'un élément inconnu à la base », Morgane Paquet, 15 October 2026, https://drive.google.com/file/d/1lUiHuk-_s4dblIezlWr9lSlDGIEAhh7P/view
- story: 15

## What I understood

When a directive term is unknown, or recognised with no reliable food associations, the practitioner clicks « Demander l'ajout ». REMI records the request: the term, the reason (unknown term, or associations to verify), the practitioner, the date, the source file and an optional comment. A pending request for the same term and reason is not duplicated. The REMI admin sees a list, opens a request, and validates the term with its documented associations, completes a known term, or refuses. The practitioner sees the status « En attente », « Validé » or « Refusé » in the interface. No notification in the MVP. Until validation, the directive stays unvalidated and touches no recipe. The other validated directives keep working.

Nothing on main holds this. The admin list is a page in `apps/admin` for the admin role (D-27). A validated request writes into the term base of food-directives (`food_terms`, `food_term_associations`). This epic rests on D-27, D-30 and D-32.

### Questions for Morgane

1. Who is « l'équipe REMI » that reviews a request today? Default: you, as admin.
2. After you validate a term, does the practitioner's directive become active by itself, or does the practitioner validate the protocol again? Default: the practitioner validates again (story 20). Nothing changes a protocol without the practitioner.
3. When you refuse a request, does the practitioner see a reason? Default: yes, one optional line.

### Questions for Jamie

1. Does the request record also fire from a patient's questionnaire « Autre » allergy text? Default: no. The questionnaire's « Autre » is free text, not a directive.

## Build order

1. request-record — the request table, the button's service, the dedupe rule, the status on the practitioner's field — depends-on: none
2. admin-review — the admin list and detail, validate with associations, complete, refuse — depends-on: request-record

## Criteria → stubs

| # | Morgane's criterion (short, her French kept) | Stub |
|---|---|---|
| 1 | « Le bouton “Demander l'ajout” apparaît pour les éléments inconnus et pour les éléments reconnus dont les associations… ne sont pas suffisamment fiables » | request-record (the service), cross-epic food-directives/directive-resolution (the button) |
| 2 | « Une demande déjà en attente pour un même élément et un même motif n'est pas dupliquée ; son statut “En attente” est affiché » | request-record |
| 3 | « Chaque demande est reliée au terme concerné, à son motif, au praticien et au dossier source ; le commentaire est facultatif » | request-record |
| 4 | « L'administrateur REMI dispose d'une liste des demandes et peut consulter leur détail et leur statut » | admin-review |
| 5 | « L'administrateur peut valider le terme et ses associations alimentaires, compléter les associations d'un terme existant ou refuser la demande » | admin-review |
| 6 | « Le praticien peut consulter le résultat dans l'interface (“En attente”, “Validé”, “Refusé”) ; aucun système de notification supplémentaire » | request-record |
| 7 | « Un élément inconnu ou dont les associations sont incertaines n'est jamais traité comme validé et n'influence pas les suggestions de recettes » | rule: README (D-30), food-directives/directive-application |
| 8 | « L'élément devient exploitable uniquement après validation des données et associations alimentaires nécessaires dans la base REMI » | admin-review |

## Out of scope

- Any notification by e-mail or in-app.
- The term base's shape (food-directives/term-base).
- A public or multi-tenant knowledge base. One base serves every practitioner.
