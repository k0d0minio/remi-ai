# REMI-028 · Collect the real practitioner document formats

|                |                                                                     |
| -------------- | --------------------------------------------------------------------- |
| Status         | blocked — needs real documents from real practitioners              |
| **Type**       | chore (input gathering)                                             |
| **Priority**   | P1 — Phase E; the parser cannot be scoped without it                |
| **Size**       | A day, once documents arrive                                        |
| **Depends on** | —                                                                   |
| **Blocked by** | Real consultation documents, de-identified                          |
| **Sources**    | Status report Phase E bullet 2 · `.icm/docs/braindump/developpement-produit/ai.md` |

## Problem statement

The recommendation parser (REMI-029) is the strongest claim REMI has to proprietary technology, and
the report's advice on it is to **start narrow — with the formats the beta practitioners actually
produce** — and widen later. A parser built against imagined documents will be impressive in a demo
and useless in a clinic.

So the first Phase E work is not code. It is getting a real corpus: what these documents actually
look like, how they are structured, how much varies between practitioners, and what a
recommendation looks like in the wild rather than in a specification.

## Required steps

1. Ask the practitioners already in contact for real consultation documents — PDFs, notes,
   protocols — **de-identified before they are sent**, or de-identified on receipt with the
   originals deleted.
2. Store them somewhere that is not this git repository. A repo is the wrong home for patient
   material, even de-identified.
3. Catalogue what is in them: format, structure, how recommendations are expressed, how much
   varies, what is ambiguous even to a human reader.
4. From that, write the parser's realistic first scope: which formats and which recommendation
   types are in, and which are explicitly out.
5. Keep a small held-out set for evaluating the parser, so its accuracy is measured rather than
   asserted.

## Open questions — flag these on pickup

- **Who can supply documents, and how many?** The braindump describes practitioner interviews and
  the FunMedDev relationship; whether documents can be obtained today is unknown.
- **Where do they live?** Not in git. That needs a decision and probably a processing agreement
  (REMI-015) before anything is collected.
- **Is de-identification enough?** A consultation document can be re-identifying even without a
  name. Counsel's view is worth having before collection, not after.
- **Is FunMedDev a source or a partner?** The relationship exists but its terms are not written down
  anywhere in the repository.

## Acceptance criteria

- [ ] Real, de-identified documents from more than one practitioner exist and are catalogued.
- [ ] None of them are in this git repository.
- [ ] The catalogue names formats, structures and ambiguities, not just a count.
- [ ] The parser's first scope is written down, with what is explicitly out of scope.
- [ ] A held-out evaluation set exists.

## Agent prompt

```text
Work in the remi-ai monorepo. Read .icm/docs/braindump/developpement-produit/ai.md (the parser
section) and Phase E of .icm/docs/remi-status-report.html.

Task: get the parser a real corpus before any parser code is written.
1. Draft the request to practitioners for real consultation documents, stating clearly that they
   must be de-identified before sending and how.
2. Propose where the corpus lives — NOT this git repository — and flag that a processing agreement
   is likely needed first (see REMI-015).
3. Once documents exist, catalogue format, structure, how recommendations are expressed, variance
   between practitioners, and what is ambiguous even to a human.
4. Write the parser's first scope from the catalogue: what is in, what is explicitly out.
5. Hold out a small evaluation set.
Never commit patient material to this repository, de-identified or not. Push a branch, open a PR
with the request draft and the storage proposal, and leave this ticket open until real documents
exist.
```
