# Stub: Genotype layer — nutrients to favour from a genetic test, as an additive input to generation

- feature-slug: genotype-layer
- scope: beyond-december
- personas: practitioner, patient
- initiative: a patient experience validated on real terrain, in time for the December open day / objective: the data question answered before the first real record exists
- depends-on: none
- sequence: 6 of 8
- priority: P2
- size: M
- blocked: the rights to the source table are unestablished — Dr Mouton's book and its table are
  copyrighted material; Fagron's data needs an agreement. Owner's question, not a pickup's.
- sources: feedback § 7 ("Fagron peut venir enrichir ce moteur si le patient a réalisé un test
  génétique … REMI doit fonctionner de la même manière sans test génétique") · V2 explication
  ("pour les génotypes, je veux être sûre qu'il va bien chercher l'information du livre du docteur
  Mouton et son tableau") · direction letter § 6 ("intégrer progressivement les génotypes … sans
  bloquer") · decision D-7 (parked) · `.icm/docs/history/v1-report.md` § 6 (the v1 ApoE / DIO2 /
  AMY1A table, provenance only) · `ai-assist/recipe-generation` (the empty "nutrients to favour"
  slot)

## Problem

Her rule is the design: generation works identically without a genetic test; with one, it favours certain foods or nutrients. The rights to the source table (Dr Mouton's book, Fagron's data) are unestablished, so the layer is blocked on an owner question.

## Proposed change

Her rule is the design: generation works identically without a test; with one, it favours certain
foods or nutrients. So the layer is small and additive:

- A **`patient_genotypes`** row set: marker, variant, source (lab, date) — entered by Morgane from
  the report, never parsed from it in this stub.
- A **rules table** mapping marker + variant → nutrients or foods to favour / limit, with a
  citation column — the content is what is blocked: it is either licensed from its source or
  authored by Morgane in her own words in `nutrition-rules` (kind `genotype`), which sidesteps
  the rights question by making it hers.
- The "nutrients to favour" slot in `recipe-generation`'s context block reads the mapped nutrients;
  `ciqual-import`'s ranking gains them as components. Nothing else changes.

## Acceptance criteria (rough)

- [ ] A per-patient `patient_genotypes` row set (marker, variant, source, date), entered by Morgane from the report
- [ ] A marker + variant → nutrients-or-foods-to-favour rules table with a citation column, its content licensed or authored by Morgane as nutrition rules of kind `genotype`
- [ ] The mapped nutrients feed `recipe-generation`'s « nutrients to favour » slot and CIQUAL ranking; nothing else changes
- [ ] RETENTION gains a row for genetic data; consent is reviewed as a special category

## Out of scope (this feature)

- Parsing a lab report; the v1 nutrigenomic table (provenance only)

## Notes for Define

- **Decisions that bind** ([`README.md § Decisions of record`](../README.md)): D-7 (genotype parked until the rights question is answered).

- The v1 report records the earlier 26-rule nutrigenomic table for provenance and says V2
  consumes none of it — that decision stands until the owner reopens it here.
- Genetic data is a special category under GDPR alongside health data; RETENTION gains a row and
  consent may need a separate line.
- **A second blocker, from the 28 Aug call [9:31]–[9:59] (D-23):** in Belgium a doctor must order
  the genotype test. A patient of Morgane's cannot simply buy one, so the layer may need a medical
  validation step before REMI ever reads a result — settle with the owner alongside the rights.

**Open for Define** — settled with the operator before the spec is approved, never assumed:

- Licence or author: which route does the owner take for the rule content?
- Which markers Fagron's test actually reports — the table starts from that list, not the book's.

## Prompt

Run `/pipeline new genotype-layer` in the remi-ai repo — **only after the owner has settled the rights question and removed the `blocked` line**. Define reads this stub, its epic's `breakdown.md` and the decisions of record in `.icm/intake/README.md`, and asks the points under **Open for Define** rather than answering them. Scope is the Proposed change and nothing under Out of scope.
