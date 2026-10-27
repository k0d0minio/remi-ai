# Breakdown: patient-recommendations — the patient finds every validated recommendation in one place

- epic-slug: patient-recommendations
- source: story 23 « Espace Recommandations », Morgane Paquet, 15 October 2026, https://drive.google.com/file/d/1gfCyW1BSj7t6EbyMp3M2qasFAlGBwE9W/view
- story: 23

## What I understood

A read-only space « Mes recommandations », reachable only when the accompaniment is active, shows the practitioner's validated recommendations in five categories, in her order: 1 compléments alimentaires, plantes et huiles essentielles (nom, posologie, fréquence, moment, durée), 2 conseils d'hygiène de vie, 3 recommandations alimentaires (à favoriser, à limiter, évictions totales with their duration), 4 objectifs prioritaires, 5 autres recommandations spécifiques. The patient edits nothing. Every validation by the practitioner refreshes the space. Unvalidated changes never show. On `main` the token link has a « Recommandations » and a « Compléments » page that read the live tables. This epic replaces both with one page that reads the validated version only (`protocol-versions`). Story 31 places the entry under « Profil ». Rests on D-26, D-30.

### Questions for Morgane

1. Category 5 « Autres recommandations spécifiques du praticien »: where do you write these? Default: one free-text block in the protocol, per patient.
2. Should an eviction whose period has ended still show, marked as ended? Default: no. Only active evictions show.
3. Should the page show the date of the last validation? Default: yes, « Mis à jour le <date> ».
4. September's « Mes essentiels » (foods to keep at home) and « Mes documents » (your PDFs) are not in the stories. Do they go? Default: yes, they go.

### Questions for Jamie

1. Read the five categories from the version snapshot, or join the live tables filtered by the version? Default: the snapshot only.

## Build order

1. recommendations-page — the page, the gate, categories 1, 2, 4 and 5, « Mis à jour le » — depends-on: none
2. evictions-and-food-directives-view — category 3 with evictions and their period, prominent — depends-on: recommendations-page

## Criteria → stubs

| #   | Morgane's criterion (short, her French kept)                                                                         | Stub                               |
| --- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| 1   | « L'espace est accessible uniquement lorsque l'accompagnement est actif »                                            | recommendations-page               |
| 2   | « Seules les recommandations validées par le praticien sont affichées »                                              | recommendations-page               |
| 3   | « Les recommandations sont présentées par catégories clairement identifiables »                                      | recommendations-page               |
| 4   | « Les évictions totales et leur durée éventuelle sont clairement visibles »                                          | evictions-and-food-directives-view |
| 5   | « Les compléments, plantes et huiles essentielles affichent les informations de prise renseignées par le praticien » | recommendations-page               |
| 6   | « Une information non renseignée n'est jamais inventée »                                                             | rule: README (D-30)                |
| 7   | « Le patient ne peut ni ajouter, ni modifier, ni supprimer les recommandations »                                     | recommendations-page               |
| 8   | « Toute mise à jour validée par le praticien apparaît automatiquement dans cet espace »                              | recommendations-page               |
| 9   | « Les modifications non validées ne sont jamais affichées au patient »                                               | recommendations-page               |

## Out of scope

- The validated version and its API: `protocol-versions/working-copy-and-validate`.
- The Profil tab that holds the entry: `patient-home-navigation/profile-tab`.
- The practitioner's input screens for each category: `supplement-interventions`, `lifestyle-advice`, `food-directives`, `priority-goals`.
