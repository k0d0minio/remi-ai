# Stub: Copy context — one button exports the patient's context as a prompt, so generation is tested today

- feature-slug: copy-context
- sequence: 2 of 7
- depends-on: none
- priority: P1
- size: S
- sources: feedback § 9.4 ("ou simplement les copier/coller et je les génère avec chatgpt") · her
  covering message ("j'aimerais qu'on commence à les tester dès maintenant") · direction letter § 2
  ("je pourrai te transmettre le profil du patient, mon protocole, ses contraintes … nous testerons
  ensemble la génération de recettes") · decision #13 (2026-09-11) ·
  `apps/admin/components/patients/quick-actions.tsx` · `apps/admin/app/(admin)/patients/[id]/page.tsx`

## What this is

Morgane already generates recipes by pasting a patient's profile and her protocol into ChatGPT and
checking the result before it goes to the patient. Today she retypes that context by hand. This
stub gives her the paste in one gesture, and builds the half of `ai-assist` that needs no vendor:

- **« Copier le contexte »** on the working view (a fifth quick action, or beside « Proposer une
  recette »): assembles the patient's context as plain French text and copies it to the
  clipboard, with the text shown in a read-only textarea as the no-clipboard fallback. She pastes
  it into whatever model she uses, reads the answer, and encodes the recipe she keeps through the
  assign form (`recipe-in-place` once it lands).
- **The text** is the block every prompt in `ai-assist` will open with: pseudonym only, never the
  name; diet, allergies, intolerances, likes / dislikes, likes cooking, budget, time available
  where present; the active goals; the current instruction; active recommendations by category;
  active supplements (name · dose · moment); essentials; the patient's recipe answers so far when
  `recipe-feedback-and-favourites` exists. A one-line preamble in her words ("tu es un chef de
  cuisine qui respecte les recommandations d'une nutrithérapeute …") that she can edit in place
  before copying.
- **The assembler lives in `packages/services`** (`src/ai/context.ts` or wherever `ai-assist`'s
  breakdown places it): one pure function from the loaded patient record to text, unit-tested
  against fixtures. `meal-suggestions`, `recipe-generation` and `summary-draft` reuse it, so nothing
  here is thrown away when the model arrives — the button is the first consumer of the context
  block, the adapter the second.

No model call, no new table, nothing on the patient link. An audit event records that the context
was exported (which patient, when) — health data leaving the console is worth a line in the trail.

## Worth knowing

- What she pastes into a third-party model is her practice today, outside REMI; the export makes
  it pseudonymous, which is an improvement, not a new exposure. Say so in the PR and in
  `RETENTION.md`'s audit-trail paragraph.
- `navigator.clipboard.writeText` needs a user gesture and a secure context; the textarea fallback
  is not optional.
- Everything the text needs is already loaded by `page.tsx` — no new query.

## Open questions — flag these on pickup

- Which blocks she wants in the paste by default: the summary's head too, or only the protocol?
- The preamble's wording and register — hers, and whether there are two (one for recipes, one for
  a meal she wants improved).

## Prompt

Run `/pipeline new .icm/intake/practitioner-workflow/copy-context.md` in the remi-ai repo and
follow the pipeline from there. Read the stub and its epic's `breakdown.md` (§ Decisions binds)
first. Scope: a « Copier le contexte » action on the admin patient page that assembles the
patient's pseudonymous profile, goals, instruction, recommendations, supplements and essentials into
plain French text behind an editable preamble, copies it to the clipboard with a textarea fallback,
and audits the export; the assembler is a pure, fixture-tested function in `packages/services`
that `ai-assist` will reuse. No model call, no table, nothing on the patient link. Raise the stub's
open questions rather than answering them.
