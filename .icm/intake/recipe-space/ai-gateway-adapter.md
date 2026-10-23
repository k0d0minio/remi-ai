# Stub: The model answers through one adapter, with structured output and a log of every call

- feature-slug: ai-gateway-adapter
- epic: recipe-space
- story: 24
- sequence: 1 of 5
- depends-on: none
- complexity: high
- priority: P0

## Problem

The ai seam declares `TextProvider` and three model roles. No adapter is registered. Nothing can generate a recipe, a suggestion or read a menu. Every story that needs the model waits on this.

## Proposed change

One adapter behind the seam that targets the Vercel AI Gateway (D-16). The seam gains `generateJson(prompt, schema, options)` beside `generateText`. A response that fails the zod schema is a logged failure, never a rendered answer. The seam accepts an `images` option for stories 28 and 29. Every call writes one row to `ai_generations`. The adapter registers once at process start in `apps/web` and `apps/admin`.

## Acceptance criteria

- [ ] One adapter file registers the gateway behind the seam. Nothing above the seam names the vendor.
- [ ] `generateJson` returns a value that satisfies the schema, or a typed failure `schema-fail`, `refused` or `error`.
- [ ] A new table `ai_generations` records capability, patient id (nullable), prompt version, model, input tokens, output tokens, latency in ms, outcome and the output id.
- [ ] The three roles `fast`, `balanced` and `deep` map to gateway model ids in `packages/services/src/ai/index.ts`. The `balanced` model accepts images.
- [ ] `AI_GATEWAY_API_KEY` is required on the `web` and `admin` projects. `.icm/docs/ENV.md` says so. `ANTHROPIC_API_KEY` leaves the catalogue.
- [ ] With the variable unset, the seam stays unregistered and every caller receives `error`, never an empty answer.
- [ ] The prompt text never contains a name, an e-mail or an account id. The context block stays pseudonymous.

## Out of scope

- Any prompt for a product capability. They come with their stubs.
- Streaming, tool use, embeddings, a second adapter.

## Notes

D-16, D-25. Files: `packages/services/src/ai/index.ts`, a new `packages/services/src/ai/adapters/gateway.ts`, `packages/services/src/db/schema.ts` and one migration, `.icm/docs/ENV.md`, the two apps' registration files and `.env.example`. The migration goes first in this epic. Cross-epic: `meal-improvement/meal-capture` and `restaurant-menu/menu-photo-reading` depend on this stub.
