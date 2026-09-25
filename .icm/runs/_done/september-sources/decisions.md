# Decisions: september-sources

The `D-n` ids this run rests on, mirrored from the scope's Decisions table
(`_shared/scope-template.md` → `D-n` ids are permanent), plus any the run itself had to make.
`validate-decisions.sh <slug>` traces the scope's ids into `spec.md` and `notes.md`; this file
is the run's own ledger, so a session need not open the scope to know what was settled and a
decision made mid-run has one home.

## From the scope

- D-16 — **AI vendor: the Vercel AI Gateway first, EU residency later.** One adapter behind the text-provider seam targets the gateway; model ids stay behind the three roles; the cheapest capable models first. EU-hosted inference is revisited when patient volume justifies its price. Prompts carry pseudonymised context only.
- D-17 — **Precedence: the 11 September call and her 14 September answer rank first.** The feedback on the first version moves to row 2 and wins only where the call is silent. The four August calls are a lower row, cited as context.
- D-18 — **Files: a files seam with Vercel Blob as its one adapter, EU region.** The fourth seam in `packages/services`, same shape as storage, email and AI. Private files served through signed URLs, deleted with the patient (RETENTION updated in the same PR).
- D-19 — **The patient link gets what she asked for on 14 September, before any model:** `challenges` (a patient-facing challenge with a lifecycle, « Challenge acquis » / « Prêt(e) pour le prochain », and the console signals), `patient-documents-and-links` (files and links per patient, the recipe PDFs, « voir le profil comme lui le voit »), `general-feedback` (one free-text box, weekly framing, listed in the console). All P1 in `patient-loop`.
- D-20 — **Recipes: the library stays (D-5); whether generation starts from a seed base is Define's question.** The proposal Define puts to her: ~20 anti-inflammatory recipes she supplies as a transformation canvas; the alternative is CIQUAL-only generation. Either way a culinary-coherence check (edible, no absurd pairings, detail level per cooking appetite) joins the post-generation control.
- D-21 — **Recorded, not built:** the practitioner knowledge-sharing forum; speech-to-text for consultations; a supplement reference table (her nutrition rules cover it); the 20 Aug catalogue's shopping list, cross-patient follow-up board, period synthesis and pre-consultation questionnaires; the governance asks (co-founder and confidentiality agreement, GDPR file, scalability report, `remi-ai.be` DNS, review of the old code and data).
- D-22 — **Parked P2 in `beyond-december`:** `patient-record-export` (her 20 Aug § 30 trust principle — a practitioner's records are never « enfermés » in REMI) and `send-link-email` (a templated « envoyer le lien » mail through Resend, the 28 Aug promise).
- D-23 — **Two existing stubs carry what the August calls settled:** `genotype-layer` notes the Belgian rule that a doctor must order the test (28 Aug); `patient-profile-edit` carries the 18+ rule and « age, not date of birth » as an open point, because `birth_date` is stored today (28 Aug).
- D-24 — **Where the documents live:** « REMI V2 Features » filed in `collaboration/` with a precedence row below the old version's product logic and above the braindump, annotated as superseded on sequencing, priorities and billing; the Startup Boost roadmap filed in `collaboration/` with no row, beside the deck and the playbook; the five transcripts stay under `.icm/processed/` and are cited from there.

## Made in this run

- <D-n (the next free id) — the decision, why, which stage made it. A decision Build had to
  make is a spec gap: say so in `notes.md` → Notes for Release>
