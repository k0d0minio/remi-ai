# Stub: AI Gateway adapter — the AI seam gets its vendor, structured output, and a generation log

- feature-slug: ai-gateway-adapter
- scope: ai-assist
- personas: operator
- initiative: a patient experience validated on real terrain, in time for the December open day / objective: the data question answered before the first real record exists
- depends-on: none
- sequence: 1 of 5
- priority: P1
- size: M
- complexity: medium
- sources: decision D-16 (2026-09-23 — supersedes D-3) · 11 Sept call [29:15]–[33:59] (Jamie: start
  with the Vercel AI Gateway; Morgane: « au début, le moins cher ») · `packages/services/src/ai/index.ts`
  (the `TextProvider` seam, `ModelRole`, `MODELS`) · `packages/services/AGENTS.md` § Seams ·
  `.icm/docs/ENV.md` (`AI_GATEWAY_API_KEY`, reserved since 2026-08-06) · `apps/docs/app/technical/decisions`
  (« Provider access goes through the Vercel AI Gateway », 2026-08-06) · braindump
  `developpement-produit/ai.md` ("suivi des coûts par génération")

## Problem

The AI seam in the services package exists and throws: no vendor is registered, so nothing above it can be tried. Every AI-carried feature Morgane wants to test (D-8) waits on one adapter, one structured-output call and one place that logs what each generation cost.

## Proposed change

The seam exists and throws. This stub registers a vendor behind it without letting the vendor leak
above it:

- **`src/ai/adapters/gateway.ts`** — `createGatewayProvider()` implementing `TextProvider` against
  the **Vercel AI Gateway** (decision D-16): one endpoint, one key, any model the gateway serves —
  the cheapest capable models first, and a Mistral or other EU-served model later by changing an id,
  not an adapter. `fetch`, like the Resend adapter, unless the gateway's structured-output helper
  earns a dependency — Define decides, the package prefers zero new dependencies.
- **`MODELS` re-pointed**: the three roles (`fast` / `balanced` / `deep`) map to gateway model ids
  chosen at pickup from the catalogue on the day; the ids live where they do today, never in env.
- **`generateJson(prompt, schema, options)`** on the seam: asks for JSON, parses, validates with
  zod, returns a `Result` — `schema-fail` is a typed failure the caller renders as "pas de
  réponse", never as raw text.
- **`AI_GATEWAY_API_KEY`** — already in all three lists and `.env.example`; the unused
  `ANTHROPIC_API_KEY` row is removed from all three in the same PR (a variable for a path not taken
  should not exist).
- **`ai_generations` table** behind the storage seam: capability, patient (nullable), prompt
  version, model, input / output tokens, latency ms, outcome, output ref, created_at. The provider
  does not write it; a `recordGeneration` helper beside the seam does, so every capability logs the
  same way — the cost line Arnaud asked for on every call.
- **Registration** lazily from `apps/admin/lib/ai.ts` and `apps/web/lib/ai.ts` `ensure*()` helpers
  — never `instrumentation.ts` (AGENTS.md's recorded mistake).
- **A fake provider** for tests (`src/ai/test-helpers.ts`): canned JSON per capability, so every
  later stub's prompt assembly and post-checks are tested without a network.
- **Pseudonymised context only**: the adapter takes what `copy-context`'s assembler produces; no
  name, no email, no date of birth reaches the gateway. Say so in the docs' `technical/decisions`
  with the residency terms of the gateway as they stand at pickup.

## Acceptance criteria (rough)

- [ ] A gateway adapter implements the text-provider seam against the Vercel AI Gateway; the residency terms and the pseudonymisation rule are recorded in `technical/decisions`
- [ ] `generateJson(prompt, schema)` returns a typed result: a response that fails the zod schema is a logged `schema-fail`, never rendered as text
- [ ] `AI_GATEWAY_API_KEY` is in all three lists and `.env.example`; `ANTHROPIC_API_KEY` is gone from all three
- [ ] Every generation writes one `ai_generations` row (capability, patient, prompt version, model, tokens, latency, outcome)
- [ ] A fake provider serves the tests; one smoke call through the real adapter is proven from a script, not CI

## Out of scope (this feature)

- Any capability — no prompt reaches a screen here (`meal-suggestions`, `recipe-generation`, `summary-draft` follow)
- Cost arithmetic on the log; a direct vendor SDK; EU-hosted inference (D-16: later, by owner decision); streaming

## Notes for Define

- **Decisions that bind** ([`README.md § Decisions of record`](../README.md)): D-16 (the gateway
  first, EU later, pseudonymised context only) · D-8 and D-14 (the first round, and why AI lands in
  slots that exist).

- No capability ships here — the proof is a test through the fake, one smoke call through the real
  adapter from a script (not CI: CI has no key), and the docs' `packages` page updated.
- Temperature and max tokens stay in `DEFAULTS`; a capability overrides per call.
- Cost: the log's token counts times the model's price is a query, not a feature — leave the
  arithmetic out until someone asks for the number.
- The gateway's monthly credit is the budget ceiling for the first round; a per-patient daily cap
  in `meal-suggestions` is what keeps a leaked link from spending it.

**Open for Define** — settled with the operator before the spec is approved, never assumed:

- Which models behind the three roles on the day — and whether `deep` is needed at all in the first
  round (three roles were designed for one vendor's tiers).
- Does the owner want the key on Vercel for previews, or production only? (Previews with a real
  key generate against real patient data in preview databases — say what the preview DB holds.)

## Prompt

Run `/pipeline new ai-gateway-adapter` in the remi-ai repo. Define reads this stub, its epic's `breakdown.md` and the decisions of record in `.icm/intake/README.md`, and asks the points under **Open for Define** rather than answering them. Scope is the Proposed change and nothing under Out of scope.
