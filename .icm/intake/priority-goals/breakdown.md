# Breakdown: priority-goals — the practitioner orders the patient's goals, REMI reads only the validated ones

- epic-slug: priority-goals
- source: story 16 « Objectifs prioritaires du patient », Morgane Paquet, 15 October 2026, https://drive.google.com/file/d/1RZvtSFHJwS1GU3BKNERnGccK_lObaoSr/view
- story: 16

## What I understood

A section « Objectifs » in the file. A goal is one free text. Several goals may coexist.
The practitioner adds, edits, orders and deactivates them. The order is kept. REMI uses
only the validated goals to rank its recipes and suggestions. A deactivated goal is no
longer used and stays in the history. Goals never override an eviction or a
contra-indication (D-30, which also names the first goal the « objectif principal » and the
others « secondaires »).

On `main`, `patient_goals` exists with `title`, `baseline`, `position` and `archived_at`,
and the service caps active goals at two or three. This epic keeps the table and the
`position` order. It drops the cap. It treats `archived_at` as « désactivé ». It stops
asking for `baseline`, which story 16 does not name. The patient's weekly 0–5 score and
`patient_goal_check_ins` are ruled out by story 30 and leave the product. The « validated »
state of a goal is the protocol validation of story 19 and 20 (cross-epic:
`protocol-versions`). The patient reads the goals in « Mes recommandations » (cross-epic:
`patient-recommendations`).

### Questions for Morgane

1. Keep the « point de départ » (baseline) field on a goal? Default: no. A goal is one free text.
2. Is the first goal in your order the « objectif principal » of story 30? Default: yes.
3. A maximum number of goals? Default: none.

### Questions for Jamie

1. Drop `patient_goal_check_ins` and the score now, or in a chore after the open day? Default: after the open day, a triage chore.

## Build order

1. goals-section — the « Objectifs » section: add, edit, order, deactivate, no cap, no baseline — depends-on: none
2. goals-for-generation — the read side: validated and active goals in order, the first as principal — depends-on: goals-section

## Criteria → stubs

| # | Morgane's criterion (short, her French kept) | Stub |
|---|---|---|
| 1 | « Un objectif est un texte libre » | goals-section |
| 2 | « Plusieurs objectifs sont possibles pour un même patient » | goals-section |
| 3 | « Les objectifs peuvent être ordonnés par priorité ; l'ordre de priorité est conservé » | goals-section |
| 4 | « Seuls les objectifs validés sont utilisés par REMI pour les suggestions » | goals-for-generation |
| 5 | « Un objectif désactivé n'est plus utilisé mais reste dans l'historique » | goals-section |
| 6 | « Les objectifs ne contredisent jamais les évictions ni les contre-indications, qui priment » | rule: README (D-30) |

## Out of scope

- A patient-written goal. The practitioner defines them.
- Check-ins, scores, progression views (story 30 rules them out).
- The patient's read view of the goals (`patient-recommendations`).
