# Stub: Mistral adapter — the AI seam gets its vendor, structured output, and a generation log

- feature-slug: mistral-adapter
- sequence: 1 of 5
- depends-on: none
- priority: P1
- size: M
- sources: decision #3 (2026-09-10) · `packages/services/src/ai/index.ts` (the `TextProvider`
  seam, `ModelRole`, `MODELS`) · `packages/services/AGENTS.md` § Seams · `.icm/docs/ENV.md` ·
  correspondence/02 (Morgane named Mistral and Euria among the tools) · braindump
  `developpement-produit/ai.md` ("suivi des coûts par génération")

## What this is

The seam exists and throws. This stub registers a vendor behind it without letting the vendor
leak above it:

- **`src/ai/adapters/mistral.ts`** — `createMistralProvider()` implementing `TextProvider`
  against Mistral's chat completions API, EU-hosted (the point of decision #3: patient health data
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

## Worth knowing

- No capability ships here — the proof is a test through the fake, one smoke call through the
  real adapter from a script (not CI: CI has no key), and the docs' `packages` page updated.
- Temperature and max tokens stay in `DEFAULTS`; a capability overrides per call.
- Cost: the log's token counts times the model's price is a query, not a feature — leave the
  arithmetic out until someone asks for the number.

## Open questions — flag these on pickup

- Which Mistral models for the three roles, from the catalogue on the day — and whether `deep` is
  needed at all in the first round (three roles were designed for Anthropic's tiers).
- Does the owner want the key on Vercel for previews, or production only? (Previews with a real
  key generate against real patient data in preview databases — say what the preview DB holds.)

## Prompt

Run `/pipeline new .icm/intake/ai-assist/mistral-adapter.md` in the remi-ai repo and follow the
pipeline from there. Read the stub, its epic's `breakdown.md` (§ The shape every stub shares) and
`packages/services/AGENTS.md` § Seams first. Scope: a Mistral adapter behind the `TextProvider`
seam (EU-hosted, residency recorded), `generateJson` with zod validation returning a `Result`,
the `MODELS` roles re-pointed, `MISTRAL_API_KEY` under the three-list rule with the two unused AI
variables removed, an `ai_generations` log table and `recordGeneration` helper, lazy registration
in admin and web, and a fake provider for tests. No capability yet. Raise the stub's open
questions rather than answering them.
