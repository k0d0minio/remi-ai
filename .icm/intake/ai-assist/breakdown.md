# Epic: ai-assist — the model arrives, into slots the manual product already has

Cut 2026-09-10 from Morgane's feedback § 5 (the "ensuite, l'IA" paragraph), § 7 (recipe
generation), § 8 (meal suggestions) and her covering message: "pour certaines fonctions comme les
recettes 100 % personnalisées ou « Je vais manger → Suggestions », l'IA fait directement partie
de la valeur du produit, donc j'aimerais qu'on commence à les tester dès maintenant." Her principle
and ours agree: the base works without a model; the model then pre-fills, suggests and automates
into workflows that exist. Every stub here writes into a table and a screen that
`practitioner-workflow`, `patient-loop` or `nutrition-knowledge` built first.

Decisions of record (2026-09-10,
[`practitioner-workflow/breakdown.md § Decisions`](../practitioner-workflow/breakdown.md)) that
bind this epic: **#3** — Mistral, EU-hosted, behind the `TextProvider` seam; **#6** — meal
suggestions straight to the patient, generated recipes gated by an automated check, not a manual
one; **#7** — CIQUAL and her rules are the knowledge the prompts retrieve; **#8** — the first round
is meal suggestions, recipe generation and consultation notes → summary draft; free text →
structured rows is excluded from the first round and sits last, P2. Brainstorm § 7's "no
automation without human validation at the start" is honoured where a human reads the output
before it acts (summary draft, recipe check) and consciously set aside for meal suggestions by #6
— they are advice to a patient, visible to Morgane, correctable, and the thing she wants to test.

## The shape every stub shares

- **One adapter**, one registration line, nothing above the seam names the vendor.
- **Structured output.** Each capability defines a zod schema for what the model returns; the
  provider is asked for JSON against it; a response that fails the schema is a logged failure, not
  a rendered answer. The seam grows a `generateJson(prompt, schema)` beside `generateText`.
- **Prompts are code**: one file per capability under `packages/services/src/ai/prompts/`,
  versioned with the repo, with the patient context assembled by a function that is unit-tested
  against fixtures. Her data — profile, active recommendations, goals, instruction, allergies —
  is the prompt's first block; retrieved rules and foods the second; the request the third.
- **Safety inputs are hard constraints, not prompt hints.** Allergies, intolerances and diet are
  checked _after_ generation by code (the recipe check; the suggestion's "add X" against the
  exclusion list), never trusted to the model.
- **Every generation is logged**: `ai_generations` — capability, patient, prompt version, model,
  token counts, latency, outcome (ok / schema-fail / refused / error), the output's id. The
  braindump's "suivi des coûts par génération", and the record the next iteration learns from.
- **Every output is labelled** where a person sees it (« proposé par REMI ») and correctable by
  Morgane.

## Build order

1. `mistral-adapter` — the adapter, `generateJson`, the generation log, the env variable —
   depends-on: none
2. `meal-suggestions` — « Je vais manger → Suggestions » and the « J'ai mangé » feedback, instant,
   to the patient — depends-on: mistral-adapter (cross-epic: `patient-loop/meal-entry`;
   `nutrition-knowledge/nutrition-rules` soft)
3. `recipe-generation` — several recipes from profile + recommendations, checked, into the library
   and assigned — depends-on: mistral-adapter (cross-epic: `practitioner-workflow/recipe-in-place`,
   `patient-loop/patient-profile-edit`, `patient-loop/recipe-feedback-and-favourites`,
   `nutrition-knowledge/*`)
4. `summary-draft` — consultation notes → a proposed living-summary revision and anamnesis
   fields, for Morgane to edit — depends-on: mistral-adapter (cross-epic:
   `practitioner-workflow/consultation-update`)
5. `free-text-to-rows` — P2, excluded from the first round by decision #8 — depends-on:
   mistral-adapter (cross-epic: `practitioner-workflow/bulk-entry`)

## Parallelizable

2, 3 and 4 are independent once 1 lands and their cross-epic prerequisites have shipped; each
touches its own prompt file, schema and surface. 5 waits for an explicit owner decision to lift its
P2, not just for 1.

## Out of scope (whole epic)

- Photo recognition, multiple variants, "tient compte des repas précédents de la journée" — her
  § 8 "vision finale"; a second round once the first is measured.
- Autonomy beyond what #6 grants: nothing here archives, changes or sends a protocol on its own.
- Embeddings, agents, tool use — a single structured call per capability is the whole design
  until the log says otherwise.
- Any vendor other than the adapter's; a second adapter is a new stub with an owner decision.
