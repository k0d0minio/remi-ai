# REMI-028 · Nutrigenomic interpretation engine (ApoE × DIO2 × AMY1A)

|                |                                                                                                                                                                                   |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Type**       | feature (pure logic, clinically sensitive)                                                                                                                                        |
| **Priority**   | P1                                                                                                                                                                                |
| **Size**       | Days                                                                                                                                                                              |
| **Depends on** | REMI-008 (harness)                                                                                                                                                                |
| **Blocked by** | **REQ-26 — the original FunMedDev source table.** The v1 code has a known bug (duplicated E3/E3 rows made four rules unreachable); do not re-implement from the buggy translation |
| **Sources**    | v1-report §6.3, §11 third bullet; info-gathering REQ-26                                                                                                                           |

## Problem statement

The 26-rule ApoE × DIO2 × AMY1A interpretation table is clinical doctrine: it maps genotype
combinations to a gluco-lipid index (1–100), a diet orientation, and macro ranges (protein always
20–25%). v1's implementation contained a known translation bug — two duplicated E3/E3 rows made
the later "modéré/glucidique" variants dead rules; the source table likely positioned patients
within ranges by blood markers, a nuance lost in code. Getting this wrong changes what people are
told to eat. The engine must be re-implemented from the **original source table**, not from the
preserved-but-buggy rule list.

## Required steps

1. Obtain the original FunMedDev source table (REQ-26). **Hard gate: do not implement the
   ambiguous rows from the v1 reconstruction.** The unambiguous parts (normalisers, E2/E2, E2/E4,
   E4/E4 rows, the doctrine's shape) can proceed.
2. Implement lab-notation normalisers: DIO2 AA→A, AG→H, GG→M; AMY1A CC→A, CT→H, TT→M, or
   copy-number ≤4→A, ≤8→H, else M; ApoE's six genotypes plus E2/E4.
3. Implement the interpretation: first-match rule table → {index, orientation, carb %, lipid %,
   protein 20–25%}; E2/E4 → "defer to blood markers" (an explicit result, not an error).
4. Resolve the duplicated-row question against the source table, and encode whatever the blood-
   marker positioning nuance turns out to be — with a written note in the code citing the source.
5. Include the 26 named genotype profiles ("Pure Ketogenic" … "Vegetarian Balanced") if the
   source confirms them.
6. Exhaustive tests: all genotype combinations produce a result; the doctrine invariants hold
   (E2-ward → fat-ward, E4-ward → carb-ward, protein always 20–25%); normaliser edge cases.
7. Treat outputs as special-category-adjacent data: the engine is pure and stateless; persistence
   of results goes through the audited entities (REMI-018).

## Acceptance criteria

- [ ] Every valid (ApoE, DIO2, AMY1A) triple maps to exactly one defined outcome; unreachable
      rules are impossible by construction.
- [ ] The implementation cites the source table version it encodes.
- [ ] Normalisers covered by tests including copy-number inputs.
- [ ] The previously-dead "modéré/glucidique" rules are either reachable or documented as
      superseded by the source.

## Agent prompt

```text
Work in the remi-ai monorepo. Read CLAUDE.md, CONVENTIONS.md, then docs/v1-report.md §6.3 in
full — including the "known bug preserved knowingly" paragraph — and docs/info-gathering.md
REQ-26.

HARD PRECONDITION: this engine encodes clinical doctrine with a known bug in its only code-derived
record (two duplicated E3/E3 rows made four rules dead). If the original FunMedDev source table
has not been supplied to you in this session, implement ONLY the unambiguous layer and stop
before the E3/E3 interior rows:
- the notation normalisers (DIO2 AA/AG/GG -> A/H/M; AMY1A CC/CT/TT -> A/H/M and copy-number
  <=4/<=8/else -> A/H/M; the ApoE genotype vocabulary),
- the structurally certain rows (E2/E2 -> ketogenic; E2/E4 -> "defer to blood markers" as an
  explicit typed outcome; E4/E4 -> flexitarian, no saturated fat),
- the result types {index, orientation, carbPercentRange, lipidPercentRange, protein: 20-25},
and leave the full 26-rule table as a typed TODO that fails loudly if invoked, with tests pinning
the implemented rows. Say clearly in the PR that the rest is blocked on REQ-26.

If the source table IS available: implement the full first-match table from it (not from the v1
report's reconstruction), resolve the duplicated-row ambiguity per the source (including any
blood-marker positioning within index ranges), cite the source version in a header comment, and
add the 26 named genotype profiles if the source confirms them.

Either way: pure, stateless TypeScript in the services layer; exhaustive Vitest coverage (every
input combination, every normaliser alias, doctrine invariants: E2-ward means fat-ward, E4-ward
means carb-ward, protein always 20-25%). No persistence, no UI here.
Run tests only; push a feature branch and open a PR.
```
