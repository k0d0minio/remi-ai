# Spec: Nutrition rules — Morgane's own knowledge, authored and versioned, retrieved by tag

- slug: nutrition-rules
- apps: admin, packages
- touches: packages/services/src/db/schema.ts, packages/services/src/db/migrations, packages/services/src/db/models/nutrition-rule.ts, packages/services/src/db/models/index.ts, packages/services/src/db/services/nutrition-rules, packages/services/src/db/adapters/neon.ts, packages/services/src/server/index.ts, packages/services/src/shared/index.ts, packages/services/src/shared/audit.ts, packages/services/src/shared/nutrition.ts, packages/ui/src/server/markdown.tsx, packages/ui/src/server.ts, packages/ui/package.json, pnpm-workspace.yaml, apps/admin/app/(admin)/knowledge, apps/admin/components/knowledge, apps/admin/components/shell/nav-sections.ts, apps/admin/components/audit/vocabulary.ts, apps/admin/lib/knowledge/actions.ts
- complexity: complex
- demo: none

## Problem

The "pourquoi" REMI puts in front of a patient — « la sauce tomate apporte des composés
antioxydants intéressants », « ajouter une source de protéines peut rendre le repas plus
rassasiant » — is nutrition advice, and today it would be the model's, not Morgane's. Her covering
message asks for the opposite: « remplir la base de donnée de REMI avec les informations
importantes et que l'IA puisse aller les rechercher facilement »
([`correspondence/03`](../../../../docs/correspondence/03-feedback-on-first-version.md)). Brainstorm
§ 6 says the same thing as a process — « sources / contenus validés que l'équipe choisira
progressivement », « puis de les valider avant intégration ». There is nowhere in the estate for
her to write a nutrition rule down, and nothing a prompt could look one up in.

This is stub 2 of 2 in the `nutrition-knowledge` epic, which
[`breakdown.md`](../../../../intake/nutrition-knowledge/breakdown.md) cut from decision #7: CIQUAL
for composition, and **her own rules as text** for the reasoning. It ladders up to the current
initiative's objective **"The database and accounts under it — a real database behind the surfaces:
real accounts, real records, real recommendations"**
([`business/initiatives`](../../../../../apps/docs/app/business/initiatives/page.mdx)). Like the
recipe library, the corpus is useful with no AI at all: a rule book Morgane can point a patient at.

**No model call anywhere in this run.** The retrieval service returns rows; who pastes them into a
prompt is `ai-assist/meal-suggestions`, a later stub.

## Proposed change

One table behind the storage seam, a retrieval service beside it, a console section to author and
validate, a markdown primitive in the design system, and a draft seed of exactly what the sources
actually say.

### The table — `nutrition_rules`

- `title` — required, trimmed, ≤ 140 characters.
- `body` — required markdown, trimmed, ≤ 8000 characters. A paragraph to a page, as the stub scopes
  it. Stored raw; the markdown is what a prompt will paste.
- `tags` — free-form `text[]`, normalised exactly as `recipes` normalises them (trim, lowercase,
  dedupe), at most **8** tags of ≤ 32 characters each. **No taxonomy is defined and no enum is
  introduced.** Whatever Morgane types becomes the vocabulary, and the console's tag filter lists
  the tags that exist. This follows the `recipes` precedent deliberately: her tag vocabulary is an
  open question that is hers to answer by using it (see **Open questions**), and a free-form column
  lets the build proceed without anyone answering it for her. Eight rather than the library's six
  because retrieval here ranks on tag overlap, so a rule wants room to be findable.
- `kind` — closed enum, the stub's five: `principle`, `food-list`, `seasonality`, `safety`,
  `house-rule`. Declared once in `shared/nutrition.ts` as a `readonly` runtime list with the model
  type derived from it, the same shape as `recommendationCategories`.
- `status` — `draft` | `validated`. **Only `validated` is ever retrievable** — § 6's "valider avant
  intégration" made structural rather than procedural.
- `validatedAt: Date | null` and `validatedBy: Id | null` — the operator who validated, null while
  `draft`.
- `version: integer`, starting at 1.
- `supersededBy: Id | null` — set on the old row when a revision replaces it.
- `archivedAt: Date | null` — withdrawn with no replacement.

Three separate "not current" states, because they answer three different questions: `draft` is _not
yet trusted_, `supersededBy` is _replaced by a newer wording_, `archivedAt` is _withdrawn_. Nothing
is ever deleted — there is no hard delete in the service or on the page, the same rule the recipe
library holds.

The table is **not patient-scoped and carries no `practitioner_id`** — see **Out of scope**.

### Versioning — revise, never overwrite a validated rule

- A `draft` row is edited in place. Nothing has trusted it yet, so there is no history worth keeping.
- Editing a **validated** row writes a **new row**: same tags/kind by default, `version + 1`,
  `status: draft`, and the old row gets `supersededBy = <new id>`. The old row keeps its
  `validated` status and its validation stamp, so what was in force, and until when, stays readable.
- The new row must itself be validated before it is retrievable. Between the revision and the
  validation, **neither row is retrieved**: the old one is superseded, the new one is a draft. That
  gap is the point of the gate — a rule under revision is a rule not yet agreed.
- Validating is one-way: there is no un-validate button. Withdrawing a validated rule is `archive`;
  changing its wording is a revision. `restore` un-archives.

### The retrieval service

In `@remi/services`, beside the corpus, exported from the server entrypoint:

```ts
retrieveNutritionRules({ tags, kinds?, limit? }): Promise<NutritionRule[]>
```

- Considers only rows where `status = 'validated'` **and** `supersededBy is null` **and**
  `archivedAt is null`.
- Requires **at least one** tag in common with the query. A rule with no overlap is never returned —
  retrieval must not pad a prompt with unrelated nutrition.
- Ranks by overlap count descending, then `validatedAt` descending (the most recently agreed wording
  first), then `id` ascending. The last key makes the ordering **total**, so the same query returns
  the same block every time — a test can assert an exact array.
- Caps at `NUTRITION_RULE_RETRIEVAL_LIMIT`, an exported constant defaulting to **8**. `limit` may
  lower it and **never raise it**: the constant is a token budget, and the prompt stub that will
  paste the block imports the same constant rather than repeating the number.
- An empty `tags` array returns `[]` — not "everything".

**Tested in memory**, against `createMemoryDatabase()` from `db/test-helpers.ts`, the same harness
`services/recipes/index.test.ts` uses. No embeddings, no vector search, no network.

### The console section — « Connaissances »

`apps/admin`, route `/knowledge`, label « Connaissances » (routes English, copy French, per
`CONVENTIONS.md`). Added to the `Suivi` nav section beside « Recettes » — like the recipe library,
the corpus belongs to no one patient, which is why it sits there rather than under a patient.

- **List** — title, kind, status, tags, version. Filters: tag, kind, status. Search on title.
  Superseded and archived rows are hidden by default and reachable behind an explicit filter.
- **Detail** — the body **rendered as markdown**, the tags, the kind, the status, the version, who
  validated it and when, and a link to the row it superseded or that superseded it.
- **Create / edit** — title, a plain `<textarea>` for the markdown, a tags input, a kind select. No
  rich editor. New rules are `draft`.
- **Validate** — one action, `draft → validated`, recording the operator and the timestamp.
  **Any signed-in operator may author, edit, validate and archive** — no `ownerOnly`, matching how
  `/recipes` works today. The audit journal is the accountability record, not a role boundary.
- **Archive / restore** — as elsewhere in the console.

Every one of those writes an audit row. New actions in `shared/audit.ts`, each with its French label
in `apps/admin/components/audit/vocabulary.ts` (the closed map makes the pairing a type error if
missed): `nutrition_rule.created`, `.updated`, `.revised`, `.validated`, `.archived`, `.restored`.

### The markdown renderer — a `@remi/ui` primitive

There is no runtime markdown renderer in the estate. `apps/docs` is Nextra, which compiles MDX at
build time and cannot render a database row, so the stub's "the same renderer the docs app uses" is
not a thing that exists. Instead:

- A `Markdown` primitive at `packages/ui/src/server/markdown.tsx`, exported from
  `@remi/ui/server` — it is pure markup with no hook, event handler or browser API, which is exactly
  what that entrypoint is for.
- Built on the remark/hast pipeline — `unified`, `remark-parse`, `remark-gfm`, `remark-rehype` and
  `hast-util-to-jsx-runtime` — added to the pnpm `catalog:` and to `packages/ui/package.json` (apps
  never pin their own — `CONVENTIONS.md` → leanness).

  > **Revised during Build, 2026-09-17.** This said `react-markdown`, and that cannot work here.
  > That package's module imports `useEffect`/`useState` at the top level to build its
  > `MarkdownHooks` export, and the `react-server` build of React exports neither — so the module
  > cannot link inside a server component's graph at all. Importing it is enough; calling it is not
  > required. It failed exactly one Vercel preview, `admin`, the only app that renders markdown, and
  > bundling does not rescue it because the unused import survives tree-shaking. The four packages
  > `react-markdown` itself wraps are used directly instead. Nothing about the component's
  > placement, its API, or its behaviour changes — only what is underneath it.

- **Raw HTML stays off**, and structurally rather than by a flag: without `allowDangerousHtml`,
  `remark-rehype` discards raw HTML nodes on the way to hast, so an `<img onerror>` typed into the
  form never reaches the renderer. A rule body is prose, and the corpus is destined for a prompt
  and, later, a patient's screen.
- Styling comes from the existing tokens and Tailwind typography utilities in the component; no new
  token is introduced.

It is built in `packages/ui` rather than in `apps/admin` because `apps/web` renders the same bodies
the moment a patient-facing rule quote lands — and copying a component between apps is a review
blocker here.

### The seed — only what the sources actually say

Draft rows, inserted by the same migration that creates the table (migrations run once, so the seed
is idempotent by construction and needs no new script or environment variable). **Every seeded row
is `draft`. Nothing is seeded as `validated`** — validating is Morgane's act, and the point of the
corpus is that the nutrition is hers.

**A finding that changes the seed's size: `.icm/docs/braindump/` contains no nutrition rules.** Its
seven folders are business, marketing, roadmap, vision and journal material; a grep for oméga-3,
polyphénols, fibres, magnésium and anti-inflammatoire across it returns nothing. The stub's "the
rules she has already written in the braindump" is not there to seed. The real sources are
`remi-v2-structure-brainstorm.docx` §§ G–I and `correspondence/03`.

And those name the _categories_ without giving their contents: § H asks REMI to complete a selection
with « sources d'oméga-3, fibres, polyphénols, diversité végétale » but lists no foods. So the seed
splits in two, and each row's body ends with the line it came from:

- **Rows with real content**, quoted from the source: seasonality and frozen produce (§ H, § I), a
  globally anti-inflammatory orientation where coherent with the accompaniment (§ I), variety and
  plant diversity (§ H, § I), and the medication-safety rule — « les médicaments actuels servent
  uniquement à sécuriser les propositions … REMI ne gère pas la médication » (§ G, `kind: safety`).
- **Skeleton rows** for the four food lists § H names and does not fill — oméga-3, fibres,
  polyphénols, diversité végétale — each a `food-list` draft carrying the § H line that asks for it
  and an explicit « à compléter » marker.

**Nothing is invented.** No food list is written for her, no nutrient claim is composed. A skeleton
row that says "she has not written this yet" is worth having; a plausible-looking one we wrote is
the exact failure this corpus exists to prevent.

## Acceptance criteria

- [ ] A `nutrition_rules` table exists behind the storage seam with `title`, markdown `body`,
      free-form normalised `tags`, the five-value `kind` enum, `draft`/`validated` `status`,
      `version`, `supersededBy`, `archivedAt`, `validatedAt` and `validatedBy`; the migration is
      generated by `drizzle-kit` and committed.
- [ ] Creating, editing, validating, revising, archiving and restoring a rule all go through
      `@remi/services`; no route handler or server action reaches the database directly, and there
      is no hard delete anywhere in the service or on the page.
- [ ] Editing a **validated** rule creates a new `draft` row at `version + 1` and sets
      `supersededBy` on the old one; the old row keeps its `validated` status and its validation
      stamp. Editing a `draft` row edits it in place.
- [ ] `retrieveNutritionRules({ tags })` returns only rules that are `validated`, not superseded and
      not archived, that share at least one tag with the query — ordered by overlap count desc, then
      `validatedAt` desc, then `id` asc — capped at `NUTRITION_RULE_RETRIEVAL_LIMIT` (8), which
      `limit` can lower but not raise. An empty `tags` array returns `[]`.
- [ ] In-memory tests over `createMemoryDatabase()` cover: a draft is never retrieved; a superseded
      rule is never retrieved; an archived rule is never retrieved; a zero-overlap rule is never
      retrieved; the exact returned order for a fixture where overlap, `validatedAt` and `id` each
      decide a tie; the cap holding; `limit` lowering but not raising it; and tag normalisation
      (« Saison » and « saison » are one tag). `packages/services/src/db/` stays above its 75% line
      floor.
- [ ] `/knowledge` in the console lists rules with tag, kind and status filters and a title search;
      superseded and archived rows are hidden unless explicitly filtered for.
- [ ] A rule's detail page renders its markdown body through the new `Markdown` primitive from
      `@remi/ui/server`, and shows kind, status, tags, version, and who validated it and when, with
      a link to the row it superseded or that superseded it.
- [ ] Any signed-in operator can create, edit, validate, archive and restore a rule; each of those
      writes an audit row, and every new action name in `shared/audit.ts` has a French label in
      `apps/admin/components/audit/vocabulary.ts`.
- [ ] « Connaissances » appears in the console's `Suivi` nav section beside « Recettes », with no
      `ownerOnly` flag.
- [ ] The markdown renderer's packages are added to the pnpm `catalog:` and consumed only by
      `packages/ui`; raw HTML is not enabled; no app pins its own copy.
- [ ] The migration seeds the draft rows described above — every one `status: draft`, each body
      ending with the source line it came from, the four unfilled food lists marked « à compléter »,
      and no nutrient claim or food list written by us.
- [ ] No model, provider or AI call is added anywhere in the diff.

## Out of scope

- **Any model call.** The prompt block that pastes these rules is `ai-assist/meal-suggestions`; it
  imports `retrieveNutritionRules` and `NUTRITION_RULE_RETRIEVAL_LIMIT` and is not written here.
- **Embeddings and vector search** — the whole epic excludes them (`breakdown.md` → Out of scope).
  Retrieval is by tag.
- **A `practitioner_id` column.** The corpus is house-wide this run. Whether rules become
  per-practitioner is Morgane's product question, raised below and deliberately not answered by us;
  adding a nullable column later is an additive migration with no rewrite of the retrieval service,
  so nothing here forecloses it.
- **A closed tag taxonomy.** Tags are free-form. Promoting the tags she actually uses to an enum is
  a later, additive change once there is evidence of what they are.
- **Patient-facing rendering.** No `apps/web` surface reads the corpus this run. The `Markdown`
  primitive lands in `@remi/ui` so that when one does, there is one renderer and not two.
- **Rich-text editing.** A plain textarea over markdown; no WYSIWYG.
- **Linking rules to recommendations, recipes or CIQUAL foods.** Retrieval takes tags the caller
  supplies; joining the corpus to other tables is a later stub.
- **Import or bulk upload** of an external rule set.

## Open questions

Both are the stub's, raised rather than answered — neither blocks a criterion above, because the
build takes the shape that survives either answer.

- **Her tag vocabulary.** The recommendation categories are `nutrition`, `habit`, `supplement`,
  `activity`, `monitoring`; the stub floats protéines, oméga-3, fibres, magnésium, sucres raffinés,
  anti-inflammatoire, saison, petit-déjeuner. We are not choosing for her: the column is free-form
  and the console reports the tags that exist, so the vocabulary is whatever she types. Worth asking
  her before the corpus grows enough that renaming a tag is a chore.
- **House-wide or per-practitioner?** If multi-practitioner REMI ever happens, does a rule belong to
  the practice or to a practitioner? Answered as "house-wide, no column" for this run only — listed
  under Out of scope so it does not block, and flagged here because the answer is hers.
- Non-blocking: the seed is smaller than the stub anticipated, because the braindump holds no
  nutrition content and § H names four food lists it never fills. The four skeleton rows make that
  gap visible in the console rather than hiding it.

Context budget: within the Define Inputs table, plus three targeted reads outside it — the `recipes`
service and its test (the free-form-tag and in-memory-test precedent this spec follows), the console
nav and audit vocabulary (to name real paths), and `remi-v2-structure-brainstorm.docx` §§ G–I with a
grep over `.icm/docs/braindump/` (to establish what the seed can honestly contain).
