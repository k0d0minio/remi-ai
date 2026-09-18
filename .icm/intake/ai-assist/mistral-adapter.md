# Stub: Mistral adapter — the AI seam gets its vendor, structured output, and a generation log

- feature-slug: mistral-adapter
- scope: ai-assist
- personas: operator
- initiative: a patient experience validated on real terrain, in time for the December open day / objective: the data question answered before the first real record exists
- depends-on: none
- sequence: 1 of 5
- priority: P1
- size: M
- sources: decision D-3 (2026-09-10) · `packages/services/src/ai/index.ts` (the `TextProvider`
  seam, `ModelRole`, `MODELS`) · `packages/services/AGENTS.md` § Seams · `.icm/docs/ENV.md` ·
  correspondence/02 (Morgane named Mistral and Euria among the tools) · braindump
  `developpement-produit/ai.md` ("suivi des coûts par génération")

## Problem

The AI seam in the services package exists and throws: no vendor is registered, so nothing above it can be tried. Every AI-carried feature Morgane wants to test now (D-8) waits on one adapter, one structured-output call and one place that logs what each generation cost.

## Proposed change

The seam exists and throws. This stub registers a vendor behind it without letting the vendor
leak above it:

- **`src/ai/adapters/mistral.ts`** — `createMistralProvider()` implementing `TextProvider`
  against Mistral's chat completions API, EU-hosted (the point of decision D-3: patient health data
  in prompts stays in the EU — verify the endpoint's residency terms at pickup and record them in
  the docs' `technical/decisions`). `fetch`, like the Resend adapter, unless streaming or the
  SDK's structured-output helper earns the dependency — Define decides, the package prefers zero
  new dependencies.
- **`MODELS` re-pointed**: the three roles (`fast` / `balanced` / `deep`) map to Mistral model ids
  chosen at pickup from the current catalogue; the ids live where they do today, never in env.
- **`generateJson(prompt, schema, options)`** on the seam: asks for JSON, parses, validates with
  zod, returns a `Result` — `schema-fail` is a typed failure the caller renders as "pas de
  réponse", never as raw text.
- **`MISTRAL_API_KEY`** — the three-list rule: `env.ts`, `turbo.json`, `ENV.md`, plus
  `.env.example`; the unused `ANTHROPIC_API_KEY` and `AI_GATEWAY_API_KEY` rows are removed from all
  three in the same PR (a variable not in all three does not exist — and a variable for a vendor
  not chosen should not exist either).
- **`ai_generations` table** behind the storage seam: capability, patient (nullable), prompt
  version, model, input / output tokens, latency ms, outcome, output ref, created_at. The
  provider does not write it; a `recordGeneration` helper beside the seam does, so every
  capability logs the same way.
- **Registration** lazily from `apps/admin/lib/ai.ts` and `apps/web/lib/ai.ts` `ensure*()` helpers
  — never `instrumentation.ts` (AGENTS.md's recorded mistake).
- **A fake provider** for tests (`src/ai/test-helpers.ts`): canned JSON per capability, so every
  later stub's prompt assembly and post-checks are tested without a network.

## Acceptance criteria (rough)

- [ ] A Mistral adapter implements the text-provider seam against an EU-hosted endpoint, and the residency terms are recorded in `technical/decisions`
- [ ] `generateJson(prompt, schema)` returns a typed result: a response that fails the zod schema is a logged `schema-fail`, never rendered as text
- [ ] `MISTRAL_API_KEY` is in all three lists (env schema, `turbo.json`, `ENV.md`) and the two unused AI variables are gone from all three
- [ ] Every generation writes one `ai_generations` row (capability, patient, prompt version, model, tokens, latency, outcome)
- [ ] A fake provider serves the tests; one smoke call through the real adapter is proven from a script, not CI

## Out of scope (this feature)

- Any capability — no prompt reaches a screen here (`meal-suggestions`, `recipe-generation`, `summary-draft` follow)
- Cost arithmetic on the log; a second vendor; streaming unless the SDK earns the dependency

## Notes for Define

- **Decisions that bind** ([`README.md § Decisions of record`](../README.md)): D-3 (Mistral, EU-hosted, behind the seam) · D-8 and D-14 (the first round, and why AI lands in slots that exist).

- No capability ships here — the proof is a test through the fake, one smoke call through the
  real adapter from a script (not CI: CI has no key), and the docs' `packages` page updated.
- Temperature and max tokens stay in `DEFAULTS`; a capability overrides per call.
- Cost: the log's token counts times the model's price is a query, not a feature — leave the
  arithmetic out until someone asks for the number.

**Open for Define** — settled with the operator before the spec is approved, never assumed:

- Which Mistral models for the three roles, from the catalogue on the day — and whether `deep` is
  needed at all in the first round (three roles were designed for Anthropic's tiers).
- Does the owner want the key on Vercel for previews, or production only? (Previews with a real
  key generate against real patient data in preview databases — say what the preview DB holds.)

## Prompt

Run `/pipeline new mistral-adapter` in the remi-ai repo. Define reads this stub, its epic's `breakdown.md` and the decisions of record in `.icm/intake/README.md`, and asks the points under **Open for Define** rather than answering them. Scope is the Proposed change and nothing under Out of scope.
