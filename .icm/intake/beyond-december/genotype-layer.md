# Stub: Genotype layer — nutrients to favour from a genetic test, as an additive input to generation

- feature-slug: genotype-layer
- sequence: 6 of 6
- depends-on: none
- priority: P2
- size: M
- blocked: the rights to the source table are unestablished — Dr Mouton's book and its table are
  copyrighted material; Fagron's data needs an agreement. Owner's question, not a pickup's.
- sources: feedback § 7 ("Fagron peut venir enrichir ce moteur si le patient a réalisé un test
  génétique … REMI doit fonctionner de la même manière sans test génétique") · V2 explication
  ("pour les génotypes, je veux être sûre qu'il va bien chercher l'information du livre du docteur
  Mouton et son tableau") · direction letter § 6 ("intégrer progressivement les génotypes … sans
  bloquer") · decision #7 (parked) · `.icm/docs/history/v1-report.md` § 6 (the v1 ApoE / DIO2 /
  AMY1A table, provenance only) · `ai-assist/recipe-generation` (the empty "nutrients to favour"
  slot)

## What this is

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

## Worth knowing

- The v1 report records the earlier 26-rule nutrigenomic table for provenance and says V2
  consumes none of it — that decision stands until the owner reopens it here.
- Genetic data is a special category under GDPR alongside health data; RETENTION gains a row and
  consent may need a separate line.

## Open questions — flag these on pickup

- Licence or author: which route does the owner take for the rule content?
- Which markers Fagron's test actually reports — the table starts from that list, not the book's.

## Prompt

Run `/pipeline new .icm/intake/beyond-december/genotype-layer.md` in the remi-ai repo and follow
the pipeline from there — only after the owner has settled the rights question and removed the
`blocked` line. Read the stub and its epic's `breakdown.md` first. Scope: a per-patient genotype
row set entered by hand, a marker → nutrients rules table with citations (content licensed or
authored as nutrition rules), and the mapped nutrients feeding the existing generation context
slot and CIQUAL ranking. Raise the stub's open questions rather than answering them.
