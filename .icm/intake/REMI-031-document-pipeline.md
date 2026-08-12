# REMI-031 · Medical document pipeline: upload, parse, extract

|                |                                                                                                                                                                                     |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status         | ready                                                                                                                                                                               |
| **Type**       | feature                                                                                                                                                                             |
| **Priority**   | P1                                                                                                                                                                                  |
| **Size**       | A week+                                                                                                                                                                             |
| **Depends on** | REMI-020 (AI seam), REMI-022 (db), REMI-023 (auth); file storage decision (part of D-2 — Supabase buckets or equivalent EU storage)                                                 |
| **Blocked by** | D-v1-3 (does LlamaParse survive? — the v1 report says it likely carries over); an LLM extraction vendor per D-5/D-v1-3; REMI-026's DPA for whichever processors touch the documents |
| **Sources**    | v1-report §2 step 5, §5.2 step 1, §8.5, §8.7, §8.9; audit F-16                                                                                                                      |

## Problem statement

The document-intelligence stage is the bridge from a practitioner's FunMedDev PDF to structured,
validated medical data: store the PDF, parse to markdown (LlamaParse in v1), then three parallel
extractions — supplements ({name, dosage, frequency}; deterministic HTML-table parse first, LLM
fallback), genotypes (ApoE/DIO2/AMY1A with strict vocabulary validation), and structured
recommendations. v1's defects to fix by construction: uploading destroyed all prior document
history (§8.5); extraction state lived as index-arrays inside one JSONB blob with stale
read-modify-write races (§8.4, fixed by REMI-018's row-per-item model); processing state was
inferred from staleness heuristics instead of a real job table (§8.7); and callers weren't
authorized against the patient they acted on (§8.1).

## Required steps

1. File storage: private EU bucket, per-owner path constrained at the policy level (v1's INSERT
   policy didn't constrain the path — fix), 5 MB PDF cap, signed URLs for viewing.
2. Upload flow: new document **versions**, never destroying history; each upload creates a
   MedicalDocument row (REMI-018) and a GenerationRun/job row tracking parse+extraction state as
   a real state machine.
3. Parse: PDF → markdown via the chosen parser behind a seam (vendor-swappable, like everything
   else here).
4. Extractions through the AI seam (REMI-020): supplements (deterministic table-parse first, LLM
   JSON-mode fallback, verbatim-copy prompting, low temperature), genotypes (strict vocabulary +
   REMI-028's normalisers; explicit skip supported), recommendations (structured, seeded from
   markdown). 12,000-char input cap held from v1. Every LLM call produces an AiGeneration record.
5. Extracted items land as **rows with ids** and per-row validation state — pending operator
   validation (REMI-032's workbench).
6. Authorization: every operation verifies the caller's right to the subject person
   (CareRelationship / operator role) — v1 §8.1 must be impossible.
7. Failure handling: per-extraction retry, stuck-job detection via the job table (not clock
   heuristics), operator-visible error states.

## Acceptance criteria

- [ ] Uploading a second document preserves the first; history is queryable.
- [ ] Extraction state is per-row with ids; no index-array validation anywhere.
- [ ] A processing document shows real state from the job table, not inferred staleness.
- [ ] No path allows acting on a person the caller has no relationship to.
- [ ] Every extraction call is persisted as an AiGeneration record.

## Agent prompt

```text
Work in the remi-ai monorepo. Enter through the delivery pipeline per CLAUDE.md. Read
CONVENTIONS.md and packages/services/AGENTS.md, then .icm/docs/v1-report.md §5.2 step 1 (the proven
pipeline), §5.1's clinic_insights row (the shape to improve on), and §8 items 1, 4, 5, 7, 9
(the defects this port exists to fix). Confirm the storage and parser vendors are decided
(D-2 storage, D-v1-3 LlamaParse) before building; if not, stop and ask.

Build the document pipeline across packages/services and apps/web (upload) with state the admin
app can read:
1. Storage seam + adapter: private EU bucket, path {ownerId}/documents/{timestamp}_{name}
   enforced server-side, 5 MB / PDF-only validation, 1-hour signed URLs.
2. Models/flow: each upload creates a new MedicalDocument version (never delete prior rows) plus
   a job row (a real state machine: uploaded -> parsing -> extracting(supplements|genotypes|
   recommendations) -> awaiting-validation -> failed(stage, error)), advanced only by the
   pipeline itself.
3. Parse behind a seam: PDF -> markdown via the decided parser (LlamaParse contract per v1),
   markdown stored alongside the document version.
4. Three extractions through the AI seam (REMI-020), each writing an AiGeneration record:
   supplements — deterministic parse of LlamaParse HTML tables (Code/Description/Posologie/
   Quantité/Timing) first, LLM JSON fallback with verbatim-copy prompt, temperature 0.1;
   genotypes — strict vocabulary via the REMI-028 normalisers, with an explicit "skipped" state;
   recommendations — structured extraction seeded from the markdown. Cap LLM input at 12,000
   chars. Extracted items become rows with their own ids and validation status columns.
5. Authorization on every server action: operator role or an active CareRelationship to the
   subject — no operation may accept a bare personId without the check (v1's IDOR is the
   anti-pattern).
6. Retry/stuck handling from the job table (resumable stages, operator-visible failures) — no
   wall-clock staleness inference, no empty-row locks.
Tests: the deterministic table parser (fixture HTML), normaliser integration, state-machine
transitions, and authorization denials. Run tests only; push and open PRs through the pipeline
gates.
```
