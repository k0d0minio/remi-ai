# Stub: History folds — archived rows inside their section, list rows instead of nested cards

- feature-slug: history-folds
- sequence: 4 of 6
- depends-on: page-frame
- priority: P1
- size: M
- sources: breakdown.md § The design · R8, R9, R12, R13, R16, R27 · `layout-prototype` sign-off
  (archived defaults)

## What this is

Four of the page's fourteen cards exist only to hold what was archived — recommendations,
essentials, recipes, meals — and appear conditionally, so the page's shape changes from patient to
patient. This stub folds each one into its parent section as an **accordion at the end of the
section**, headed with its count ("Archivées · 3"), closed by default unless the prototype decided
otherwise for recipes (R16, R27). Observations already do this inside _À retenir_; that is the
model, made uniform. Four cards disappear; nothing is deleted from the record.

Second, density (R13, R20): sections whose rows are homogeneous — recommendation entries,
essentials, recipe assignments, meal entries, observations, notes — render as **list rows**
divided by a hairline, not as bordered mini-cards nested in a card. Row chrome shrinks: the
read view is a row; the pencil, archive and move controls sit in a trailing group that keeps
44 px targets on touch (R24); the inline edit form still opens in place, as today. Compact
density stays out of the forms themselves (R20).

Third, the **sensitive zone** stops being a red card at the foot of the page: it becomes a fold
in the rail (or wherever the prototype put it), closed, with the delete flow untouched inside.

## Worth knowing

- `Accordion` from `@remi/ui` (Radix) — arrow keys and `aria-expanded` come with it; check the
  animation honours `prefers-reduced-motion` (R28) and add the media query in the primitive if it
  does not — the demo or admin is its consumer.
- The archived lists reuse the same list components as the active ones (`RecommendationGroups`,
  `PantryList`, `RecipeAssignments`, `MealJournal`) — the fold wraps them, it does not fork them.
- On the phone, an accordion is the right shape for structure (R9); on desktop it is only right
  because archived rows are rarely needed (R8) — which is why "visible by default" is a per-section
  question, not a global switch.
- Row density is a `packages/ui` question only if a list-row primitive is needed by two apps; the
  admin rows are admin-local today. Grep before adding a helper.

## Open questions — flag these on pickup

- Recipes' history open by default? ("l'historique des adaptations, pas une corbeille" — the
  existing copy argues yes.) Carry the prototype's answer; if unanswered, closed with count, and
  say so.
- Should the count on a closed fold also say _when_ the last row was archived ("Archivées · 3 ·
  dernière en août")? Cheap, but only worth it if Morgane reads it.

## Prompt

Run `/pipeline new .icm/intake/patient-workspace/history-folds.md` in the remi-ai repo and follow
the pipeline from there. Read the stub, its epic's `breakdown.md` and the `page-frame` run's
notes first. Scope: the four conditional "archivées" cards become closed accordion folds with
counts at the end of their parent sections; homogeneous rows render as hairline-divided list rows
with a trailing 44 px control group instead of nested bordered cards; the sensitive zone becomes a
closed fold; reduced motion honoured. Layout only — no data, service or patient-link change.
Raise the stub's open questions rather than answering them.
