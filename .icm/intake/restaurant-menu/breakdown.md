# Breakdown: restaurant-menu — a menu photo, and the dishes that fit the protocol (bonus MVP)

- epic-slug: restaurant-menu
- source: story 29 « Je suis au restaurant (bonus MVP) », Morgane Paquet, 15 October 2026, https://drive.google.com/file/d/1M0JAdQYMkfKNl7jjH49mCp3f-Z3fAklC/view
- story: 29

## What I understood

At the restaurant, the patient photographs the menu. REMI lists the dishes it can read and marks the ones that fit the validated recommendations, each with a short justification. A dish with an evicted food, an allergen or an intolerance is never suggested. A dish whose composition is unknown is said to be unknown and never shown as safe. An unreadable menu asks for a new photo. Every answer reminds the patient to ask the waiter about evicted ingredients. Morgane marks the whole story « bonus MVP »: its absence does not block the release. Story 31 shows the entry only when this ships.

Nothing on `main` does this. It reuses the photo path of `meal-improvement/meal-capture`, the gateway adapter and the compatibility gate. Every stub is P2. Rests on D-16, D-18, D-29, D-30.

### Questions for Morgane

1. This waits until after 1 December? Default: yes.
2. Is the restaurant choice saved as a meal, for a later improvement suggestion? Default: no, nothing is saved but the generation log.

### Questions for Jamie

1. Reading and judging in one call or two? Default: two. The first reads the dishes, the second judges them, so a reading error is visible on its own.

## Build order

1. menu-photo-reading — the photo, the readable dishes, the new-photo request — depends-on: none
2. menu-suggestions — the judgement per dish through the gate, the justification, the waiter reminder — depends-on: menu-photo-reading

## Criteria → stubs

| # | Morgane's criterion (short, her French kept) | Stub |
|---|---|---|
| 1 | « les plats identifiés et les suggestions retenues » | menu-suggestions |
| 2 | « une justification courte » par suggestion | menu-suggestions |
| 3 | plat avec « éviction totale, une allergie ou une intolérance » jamais suggéré | menu-suggestions |
| 4 | « composition inconnue ou des allergènes non confirmés » → précisé, pas présenté comme sûr | menu-suggestions |
| 5 | « menu illisible » → « une nouvelle photo » | menu-photo-reading |
| 6 | « Les recommandations validées et les évictions sont respectées » | menu-suggestions |
| 7 | message : vérifier « auprès du serveur » | menu-suggestions |

## Out of scope

- Saving the dish as a meal. Ordering. Restaurant databases. A text-only menu input.
