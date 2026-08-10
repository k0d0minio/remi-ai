# REMI-020 · Redesign the AI seam for structured, audited generation

| | |
| --- | --- |
| **Type** | feature (interface design) |
| **Priority** | P1 — before any AI feature |
| **Size** | A few days, design-heavy |
| **Depends on** | REMI-018 (the AiGeneration entity is the persisted output shape) |
| **Blocked by** | Informed by (not blocked on) D-v1-1 — the Python API decision changes the adapter, not the seam |
| **Sources** | audit F-12, F-13 (model ids); v1-report §5.2 (the generation contract and Guardian schema) |

## Problem statement

The AI interface is `generateText(prompt) → string`. The product's own decision log requires
every AI output to be validated against the practitioner's therapeutic frame before rendering,
and persisted with its context as an audit trail — a bare string-in/string-out interface supports
neither. No structured output, no context object, no usage metadata, no streaming. The first AI
feature would either bypass the seam (breaking the architecture) or ship without the audit trail
(breaking the safety promise). v1 supplies the evidence for exactly which call shapes are needed:
whole-week generation from a rich patient context, single-meal regeneration with exclusions,
pair-of-weeks re-validation, structured extraction from documents, and the seven-dimension
Guardian validation result.

## Required steps

1. Redesign `TextProvider` into a provider interface supporting: structured (schema-validated)
   output, a typed generation-context input, usage metadata, and optionally streaming.
2. Make persistence part of the seam's contract: every generation call produces an AiGeneration
   record (REMI-018's entity) — input context, output, model, validation result — so the audit
   trail cannot be skipped by a forgetful caller.
3. Carry v1's Guardian result schema (`is_valid`, seven named dimensions, errors, warnings,
   summary) as the validation-result type, whether validation runs in-house or via the Python API.
4. Model the call shapes v1 proves are needed (v1 §5.2) as seam-level operations or as one
   generic structured call — design decision, write it down.
5. Fix F-13's residue in the same pass: verify/parameterise the hardcoded Anthropic model ids;
   align the registration guard with the db seam's strictness (if REMI-010 hasn't already).
6. No adapter yet — interface + types + registry + tests only.

## Acceptance criteria

- [ ] The seam can express: structured plan generation, meal regeneration with exclusions,
      document extraction, and validation — checked against v1 §5.2's contract.
- [ ] A generation cannot complete through the seam without an AiGeneration record existing.
- [ ] The Guardian seven-dimension result type exists and is the seam's validation vocabulary.
- [ ] Model ids are configuration, not hardcoded undated strings.

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md, CONVENTIONS.md, packages/services/AGENTS.md, then
docs/audit-report.md findings F-12 and F-13, then docs/v1-report.md §5.2 in full (the generation
pipeline and the Guardian validation schema), and
apps/docs/app/technical/decisions/page.mdx (the therapeutic-frame and audit-trail requirements).
Current seam: packages/services/src/ai/index.ts.

Task: redesign the AI seam so the product's safety rules are expressible through it.
1. Replace TextProvider's generateText(prompt)→string with a provider interface offering a
   structured generation call: typed GenerationContext in (subject reference — pseudonymised id,
   not personal data by default, per decision D-5's leaning; task kind; task-specific payload;
   constraints such as the therapeutic frame), zod-schema-validated output, and usage metadata.
2. Define the persisted-generation contract: the seam itself writes an AiGeneration record (see
   REMI-018's model) for every call — context, raw output, parsed output, model id, usage,
   validation result — via an injected persistence hook so it works before/after the db adapter.
3. Add the ValidationResult type from v1's Guardian schema: {is_valid, validation_results:
   {immune_safety, supplement_validation, metabolic_integrity, hormonal_stability,
   medical_compliance, biochemical_consistency, enjoyment_sustainability}, errors[], warnings[],
   summary} with per-check detail.
4. Move the hardcoded model ids (ai/index.ts:15-19) into configuration with dated ids, and make
   the registry reject silent re-registration like the db seam does.
5. Write Vitest tests with a fake provider proving: schema-mismatch outputs are rejected, every
   call yields a generation record, and registration guards hold.
No vendor adapter in this PR. Run tests only; push a feature branch, open a PR mapping each v1
§5.2 call shape to how the new interface expresses it.
```
