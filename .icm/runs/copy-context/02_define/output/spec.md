# Spec: Copier le contexte — the patient's context as a prompt, one gesture, no model

- slug: copy-context
- apps: admin, packages, docs
- touches: packages/services/src/ai/context.ts, packages/services/src/ai/index.ts, packages/services/src/server/index.ts, packages/services/src/shared/audit.ts, apps/admin/components/patients/copy-context-card.tsx, apps/admin/components/patients/quick-actions.tsx, apps/admin/app/(admin)/patients/[id]/page.tsx, apps/admin/lib/patients/actions.ts, apps/docs/app/technical/packages, .icm/docs/RETENTION.md
- complexity: standard

## Problem

Morgane already generates recipes with a model. Her feedback § 9.4 says so in passing — « ou
simplement les copier/coller et je les génère avec chatgpt » — and her covering message asks to
start testing generation « dès maintenant ». Today that means retyping a patient's profile, her
protocol and her constraints into a chat window by hand, once per recipe, from a console that
already holds all of it. The retyping is the reason she does it rarely, and it is the reason what
she pastes is whatever she remembered rather than the record.

This serves the current initiative's objective **« A usable patient version for the partner clinic
to test — testable by their team on 1 December 2026 »**: generation is the half of REMI she can
exercise before any vendor is wired, and exercising it now is what tells us whether the context we
assemble is the right context. Decision #13 (2026-09-11) cuts it as a bridge that calls no model
and throws nothing away: the assembler it needs **is** the context block every `ai-assist` prompt
will open with, so building it here means `meal-suggestions`, `recipe-generation` and
`summary-draft` inherit a function that is already fixture-tested. Decision #3 has since named
Mistral behind the existing `TextProvider` seam; nothing in this run touches that seam.

## Proposed change

A **« Copier le contexte »** card on the admin patient page's working view, and the pure assembler
behind it in `@remi/services`.

### The assembler — `packages/services/src/ai/context.ts`

One pure function, no I/O, no clock, no `Result`:

```ts
patientContextText(input: PatientContextInput, options?: PatientContextOptions): string
```

- `PatientContextInput` is a plain record assembled from what `page.tsx` already loads: the
  `PatientProfile`, the active `PatientGoal[]`, the active `PatientInstruction | null`, the active
  `PatientRecommendation[]`, the active `PatientSupplement[]`, the active `PantryEssential[]`, and
  the `PatientSummary | null`. Archived rows are never passed and never rendered.
- `PatientContextOptions` carries the preamble string and a set of block flags (below). Omitted
  options give the default set.
- Output is plain French text — headed blocks separated by blank lines, `- ` bullets inside a
  block, no markdown headings, no JSON. It is written to be pasted into a chat window.
- **Pseudonymous by construction.** The function's input type has no `fullName`, no `email` and no
  `shareToken` field, so there is no version of a caller that can leak them. `pseudonym`, `age`
  (derived by the caller with the existing `ageInYears`) and `sex` are the whole identity.
- An empty field or an empty list emits nothing — no « Allergies : — » lines, no empty headings. A
  block whose every field is empty is omitted entirely.

### The blocks

| Block                | Source                                                    | Default |
| -------------------- | --------------------------------------------------------- | ------- |
| `profil`             | pseudonym · age · sex · `objective` · `dietaryRegime` · `allergies` · `intolerances` · `constraints` · `preferences` · `likesCooking` · `foodBudget` · `medications` · `supplements` (the prose field — what the patient takes outside the protocol) | on |
| `objectifs`          | active `PatientGoal[]` — title, and `baseline` where set  | on      |
| `consigne`           | the active `PatientInstruction.body`                      | on      |
| `recommandations`    | active `PatientRecommendation[]`, grouped by category in the existing category order, each `title` with its `detail` | on |
| `complements`        | active `PatientSupplement[]` — « nom · dose · moment », `reason` where set | on |
| `essentiels`         | active `PantryEssential[]` — `item`, and `why` where set   | on      |
| `resume`             | `PatientSummary.body`, whole                               | **off** |

Seven blocks, six on by default: the default paste is the protocol, not the file. `resume` is the
one block off by default — it is the longest and the most clinical, and a recipe prompt rarely
needs it.

### The card

A client component (`copy-context-card.tsx`) rendered in the working view, with:

1. **The preamble** — an editable single-field textarea, seeded from a default constant exported by
   the assembler's module. It is editable in place and **not persisted**: every page load starts
   from the default. No table, no `localStorage`, nothing to migrate.
2. **A checkbox per block** — seven, labelled in French, seeded from the default set above. Toggling
   one re-renders the text. Toggle state is not persisted either.
3. **The assembled text** in a read-only `textarea`, always visible. This is the no-clipboard
   fallback, and it is not optional: `navigator.clipboard.writeText` needs both a user gesture and a
   secure context, and a denied clipboard in the console must still leave her something to select.
4. **The copy button** — the existing `CopyButton` from `@remi/ui`, labels « Copier le contexte » /
   « Copié ». It already swallows a denied clipboard on purpose, beside a selectable value; that
   contract is exactly this case.
5. **A one-line note** that what leaves the console is pseudonymous and that the export is recorded.

The card is assembled **server-side**: `page.tsx` builds the `PatientContextInput` from data it
already has in hand and passes it to the card, which re-assembles the text in the browser as the
toggles and the preamble change. No new query is added to the page.

### The fifth quick action

`quick-actions.tsx` gains a fifth entry, « Copier le contexte », landing on the card's section id
through the existing `scrollTo` / segment mechanism. The action row's shape and behaviour are
unchanged — one more `Action` in `ACTIONS`.

### The audit event

`context.exported` is added to `auditActions` in `packages/services/src/shared/audit.ts`, and a
`copyContextAction` in `apps/admin/lib/patients/actions.ts` records it through the existing
`audit(operator, …)` helper: `targetType: "patient"`, `targetId`, `targetLabel: pseudonym`, and a
`detail` naming which blocks were included. The card fires it on a successful copy, through the
same click that writes the clipboard. Recording is best-effort by the trail's own contract — a
failed write logs and never blocks the copy.

### Docs and retention

- `apps/docs/app/technical/packages` gains the assembler under `@remi/services` — it is a new
  public export on the `/ai` entrypoint.
- `.icm/docs/RETENTION.md`'s audit-trail paragraph gains the export: what Morgane pastes into a
  third-party model is her practice **today**, outside REMI and with a hand-typed real name; this
  export makes it pseudonymous and leaves a line in the trail, which is an improvement on the
  status quo rather than a new exposure. The PR says the same.

## Acceptance criteria

- [ ] `patientContextText()` exists in `packages/services/src/ai/context.ts`, is exported from
      `@remi/services/ai` and re-exported through `@remi/services/server`, and is pure — no I/O, no
      `Date.now()`, no database call.
- [ ] Its input type carries `pseudonym` but has no `fullName`, `email` or `shareToken` field, so no
      caller can put a real identity into the text.
- [ ] A colocated `context.test.ts` covers, against fixtures: the full record; a record with every
      optional field empty (no empty headings, no orphan separators); each block toggled off; the
      `resume` block toggled on; a custom preamble; and that archived rows passed in are the
      caller's concern, i.e. the function renders exactly the rows it is given.
- [ ] The default block set is the six protocol blocks; `resume` is off by default.
- [ ] The patient page renders a « Copier le contexte » card in the working view showing the
      preamble field, the seven block checkboxes, the assembled text in a read-only textarea, and
      the copy button.
- [ ] Editing the preamble or toggling a block updates the text in place; neither survives a page
      reload.
- [ ] The text is always readable and selectable in the textarea, whether or not the clipboard write
      succeeds.
- [ ] `quick-actions.tsx` shows a fifth action, « Copier le contexte », that lands on the card.
- [ ] `context.exported` is in `auditActions`, and a successful copy records one audit event naming
      the patient and the included blocks.
- [ ] No new table, no schema change, no migration, and no change to the patient link
      (`apps/web` `/p/[token]`) or to any patient-facing surface.
- [ ] No model is called and no `TextProvider` is registered, read or referenced by this change.
- [ ] `apps/docs/app/technical/packages` and `.icm/docs/RETENTION.md` are updated in this PR
      (Release responsibility, same PR).

## Out of scope

- **Any model call.** The Mistral adapter is `ai-assist/mistral-adapter` (decision #3); the
  `TextProvider` seam is untouched here.
- **Anything coming back.** Nothing is parsed from a model's answer into a field — that is
  `free-text-to-rows`, explicitly P2 by decisions #8 and #14.
- **A second preamble.** One editable preamble ships. A « améliorer un repas » variant is a
  judgement about her register, not about this code; when she wants it, it is a second constant and
  one control.
- **Persisting the preamble or the toggles.** Deliberately forgotten on reload — no table (the stub
  forbids one) and no `localStorage` (invisible to the trail, dies with a browser profile).
- **The patient's recipe answers.** The stub lists them « when `recipe-feedback-and-favourites`
  exists »; it does not. The assembler gains a block then, not now.
- **« Temps disponible ».** The stub names it among the profile fields; `PatientProfile` has no such
  field, and this run does not add one. `likesCooking` and `foodBudget` are the two affinity fields
  that exist and both are in the `profil` block. A time-available field is a profile change and
  belongs to a stub that owns the profile.
- **CIQUAL or Morgane's nutrition rules in the text** — `nutrition-knowledge`, and a knowledge
  block in a prompt is `ai-assist`'s to add.
- **A recipe library or assignment change** — `recipe-in-place`.
- **Anything on the patient link or in `apps/web`.**

## Open questions

- **The preamble's exact wording is Morgane's, and she has not given it.** The build seeds the
  stub's own line — « tu es un chef de cuisine qui respecte les recommandations d'une
  nutrithérapeute … » — as a constant beside the assembler, and the field is editable precisely so
  a wrong default costs her one edit rather than a release. Non-blocking: every criterion above
  holds whatever the string says, and replacing it later is a one-line change. Confirm the wording
  with her at the next exchange; whether she wants a second, meal-improvement register is parked
  under Out of scope.
