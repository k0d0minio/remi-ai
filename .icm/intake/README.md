# Intake — this repo's backlog

> The formats live next door: [`CONTEXT.md`](CONTEXT.md) (template-owned) owns the breakdown and
> stub shapes, the triage stub, the archive rules and the triage verbs; the estate contract is
> `_system/contracts/TICKETS.md` in icm-board and `.claude/skills/ticket-craft/` is its working
> knowledge. This file is what is true of **this** backlog: the epics, the decisions of record
> that bind them, and the milestones. Identity is the path — no ticket numbers. Done is a folder
> move: `new-run.sh --stub` moves a stub to `_done/` when its run opens, `close-out.sh` archives
> the epic when its last run merges. The admin dashboard's tickets board reads this folder from
> `main`.

## The backlog

Re-cut 2026-09-10 from Morgane's feedback on the first version
([`.icm/docs/collaboration/remi-v2-feedback-on-first-version.docx`](../docs/collaboration/remi-v2-feedback-on-first-version.docx)),
retriaged 2026-09-18 into the pipeline template's stub shape, and **amended 2026-09-23** from the
11 September call and her 14 September « Ce que les consultants doivent voir » — now precedence
row 1 — by the Scope run [`runs/september-sources/`](../runs/september-sources/01_scope/output/scope.md)
(decisions D-16 … D-25 below). The three epics were cut before the Scope front existed, so the
epics themselves have no `scope.md`: the decisions a front would have recorded are the list below,
and Define proceeds from the stub alone; the 2026-09-23 amendments do have one.

| Epic                                               | What it is                                                                                                                                                                                                                      |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`patient-loop/`](patient-loop/breakdown.md)       | The link the patient writes into — home, meals and writes shipped; next her 14 Sept asks: challenges, documents and links (the files seam), general feedback; then check-ins and progression, profile edit; recipe feedback P2. |
| [`ai-assist/`](ai-assist/breakdown.md)             | The model arrives — the Vercel AI Gateway behind the seam, meal suggestions to the patient, recipe generation into the library, a summary draft for Morgane; one P2 parked.                                                     |
| [`beyond-december/`](beyond-december/breakdown.md) | The old version's flows that are right and not for now — accounts, autonomous patient + PDF, practitioner space, photos, groups, genotype, record export, send-link mail. All P2.                                               |

Order: **`practitioner-workflow` → `patient-loop` → `ai-assist`** (D-4). `practitioner-workflow`
shipped whole on 2026-09-18 and `nutrition-knowledge` ran alongside it (CIQUAL imported, her rules
authored) — both archived under [`_done/`](_done/). `patient-loop` is the live epic; `ai-assist`
starts mid-October (D-14) into the slots it leaves. Nothing in `beyond-december` is "next" until
the owner moves it. The target is Morgane's § 9 — « utilisable pour moi » — met on the console, a
patient page the people she follows now can use in October, and a patient experience FunMedDev's
team can test on 1 December.

One-off findings sit in [`triage/`](triage/); finished ones in its `_done/`. A lane starts from
one by name: `/pipeline bug|tweak|chore <stub-name>`.

## Decisions of record

The decisions that bind every epic above. D-1 … D-12 were taken by Jamie on 2026-09-10, the day
the feedback arrived; D-13 … D-15 on 2026-09-11, preparing the call with Morgane and Arnaud;
D-16 … D-24 on 2026-09-23, scoping that call's transcript and her 14 September answer to it
([`runs/september-sources/01_scope/output/scope.md`](../runs/september-sources/01_scope/output/scope.md)
carries the full table with its why and its changes). Where
one supersedes a decision of 2026-09-01
([`_done/patient-record/breakdown.md`](_done/patient-record/breakdown.md) § Decisions) it says so;
the rest of that list still stands, as does the brainstorm's § 7 what-not-to-build. A stub names
the decisions it rests on under its **Notes for Define**; a spec carries the ids forward.

1. **D-1 — The practitioner space is the admin console, reorganised.** No second signed-in
   surface before the open day. Morgane stays an operator. Her § 3's A/B split ("console admin"
   vs "espace praticien") is _console pages vs the patient page_ inside `apps/admin`, not two
   apps.
2. **D-2 — The patient link becomes read + write on the same token.** Supersedes 2026-09-01
   decision 1 (view-only, WhatsApp carries the loop). The token in the URL is still the whole
   credential; patient accounts are parked in `beyond-december`.
3. **D-3 — AI vendor: Mistral, EU-hosted, behind the existing text-provider seam.** Supersedes
   "AI deliberately unchosen". One adapter file; nothing above the seam names it. **Superseded by
   D-16.**
4. **D-4 — Order: `practitioner-workflow` → `patient-loop` → `ai-assist`.** `nutrition-knowledge`
   runs alongside the first two and is a dependency of recipe generation. Her § 9 order.
5. **D-5 — Recipes: the library stays.** Generation writes into it and assigns in the same step;
   a recipe can be created from the patient page and assigned at creation; duplicate-as-variant
   exists. Extends 2026-09-01 decision 5 rather than replacing it. Patient groups are parked.
6. **D-6 — Meal suggestions go straight to the patient** — no practitioner gate. Every exchange
   is visible in the journal in admin and Morgane can correct after the fact. Generated recipes
   pass an _automated_ check (allergies, intolerances, diet, active recommendations, time and
   difficulty) and reach the patient without a manual gate; she can archive any of them.
7. **D-7 — Knowledge layer now: CIQUAL + Morgane's own nutrition rules as text.** Genotype
   (Fagron / Dr Mouton) parked until the rights question is answered.
8. **D-8 — First AI round: meal suggestions, recipe generation, consultation notes → summary
   draft.** "Free text → structured rows" is _explicitly excluded_ from the first round; it sits
   P2 at the end of `ai-assist` so it is not lost.
9. **D-9 — Check-ins are in-page, with no outbound channel**; a simple progression view on both
   sides.
10. **D-10 — FunMedDev's team tests on 1 December as patients Morgane creates.** Practitioner
    sign-up, admin approval, Stripe, the 3-months-free rule, patient accounts and PDF import are
    all parked in `beyond-december`.
11. **D-11 — Her feedback ranks 1** in [`.icm/docs/README.md § Precedence`](../docs/README.md).
    **Superseded by D-17** — it ranks 2, under the 11 September call.
12. **D-12 — The meal journal stays text-only** (2026-09-01 decision 6 stands); photos are parked
    pending a blob vendor — an owner decision, never made in passing. **The vendor is decided by
    D-18**; the journal stays text-only and photos stay parked.
13. **D-13 — A bridge for "tester dès maintenant" that calls no model: `copy-context`.** Her
    § 9.4 aside — she already generates with ChatGPT from a hand-typed profile — became one
    button that exports the patient's pseudonymous context as a prompt. Its assembler is the
    context block every `ai-assist` prompt opens with, built first and reused, so the bridge is
    not throwaway. Shipped 2026-09-17 (#96).
14. **D-14 — The AI order stands, with its reason written down.** Grids and slots first so the
    model has somewhere to fill; `free-text-to-rows` stays P2 for that reason and is re-examined
    at the 31 October milestone, not before. Mistral starts mid-October, once
    `patient-loop/link-writes` and `meal-entry` exist for suggestions to land in. Not "AI later" —
    "AI into slots that exist".
15. **D-15 — The backlog carries dates.** Five milestones to 1 December are below; a stub's epic
    tells the milestone it serves. One person runs the agents, in parallel where the epics allow
    it and serially where they do not; the dates assume one stub a day.
16. **D-16 — AI vendor: the Vercel AI Gateway first, EU residency later.** Supersedes D-3. One
    adapter behind the seam targets the gateway; model ids stay behind the three roles; the
    cheapest capable models first; EU-hosted inference is revisited when patient volume justifies
    its price. Prompts carry pseudonymised context only. From the 11 Sept call [29:15]–[33:59]:
    Jamie's recommendation, Morgane's « au début, le moins cher ». `ai-assist/mistral-adapter`
    became `ai-gateway-adapter`.
17. **D-17 — The 11 September call and her 14 September answer rank first.** Supersedes D-11. Her
    feedback on the first version ranks 2 and wins only where the call is silent; the four August
    calls are a lower row, cited as context.
18. **D-18 — Files: a files seam with Vercel Blob as its one adapter, EU region.** The fourth
    seam in the services package, built by `patient-loop/patient-documents-and-links`. Answers the
    vendor question D-12 left open; `meal-photos` and `autonomous-patient-pdf-import` are parked,
    no longer blocked.
19. **D-19 — The patient link gets what she asked for on 14 September, before any model:**
    `challenges`, `patient-documents-and-links`, `general-feedback` — P1 in `patient-loop`, in that
    order. `recipe-feedback-and-favourites` drops to P2 (« pas besoin pour l'instant »);
    `check-in-and-progression` carries her weekly 0–5 score as an open point.
20. **D-20 — Recipes: the library stays (D-5); a seed base is Define's question.** The proposal put
    to her in `recipe-generation`: ~20 anti-inflammatory recipes she supplies as a transformation
    canvas, against CIQUAL-only generation. A culinary-coherence check joins the post-generation
    control either way.
21. **D-21 — Recorded, not built:** the practitioner knowledge-sharing forum; speech-to-text for
    consultations; a supplement reference table; the 20 Aug catalogue's shopping list, follow-up
    board, period synthesis and pre-consultation questionnaires; the governance asks of the August
    calls. Out of scope in the Scope run, no stubs.
22. **D-22 — Parked P2 in `beyond-december`:** `patient-record-export` (her 20 Aug § 30 trust
    principle) and `send-link-email` (the 28 Aug promise, through Resend).
23. **D-23 — Two facts from the August calls land in existing stubs:** `genotype-layer` carries
    the Belgian rule that a doctor must order the test; `patient-profile-edit` carries the 18+ rule
    and « age, not date of birth » as an open point (`birth_date` is stored today).
24. **D-24 — Where the September documents live:** « REMI V2 Features » (20 Aug) in
    `collaboration/` with a precedence row as a superseded reference; the Startup Boost roadmap in
    `collaboration/` with no row; the five transcripts under `.icm/processed/`, cited from there.
25. **D-25 — One environment, one database (Jamie, 2026-09-26, estate audit):** preview and
    production are the two deploy targets, there is no UAT, and both read the one Neon database.
    Previews never run migrations — `migrate.mjs` fails closed off production and the admin project's
    `ALLOW_NON_PRODUCTION_MIGRATIONS` opt-out goes. Settles `triage/previews-migrate-the-shared-database`
    (its duplicate `env-preview-migrations-row-is-stale` was folded in the same day).

## Milestones

Dated 2026-09-11 (D-15), for the call with Morgane and Arnaud that day; state as of 2026-09-23.
The two fixed points come from the direction letter: FunMedDev's team tests on **1 December**,
the open day is **19 December**. Everything else is derived backwards at one stub a day, one
person, agents in parallel where the epics allow it. A missed date is reported on the Friday
call, not absorbed silently.

| By           | Milestone                                                    | Stubs                                                                                                                                                                                                                              |
| ------------ | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 30 September | **Console usable for Morgane** — her § 9.1 to 9.4            | **Met 2026-09-18.** `practitioner-workflow/*` shipped whole: at-a-glance-page (#93), copy-context (#96), bulk-entry (#97), recipe-in-place (#95), consultation-update (#99), secondary-sections (#100), reuse-and-duplicate (#107) |
| 15 October   | **The patient writes into the link** — home, meals, her page | shipped: `patient-loop/link-writes` (#98), `patient-home-today` (#106), `meal-entry` (#110) · left: `challenges`, `patient-documents-and-links`, `general-feedback` (her 14 Sept asks, D-19) · `recipe-feedback-and-favourites` P2 |
| 31 October   | **REMI answers a meal** — the gateway live, her knowledge in | shipped: `nutrition-knowledge/*` (#102, #101) · left: `ai-assist/ai-gateway-adapter`, `meal-suggestions` · `free-text-to-rows` P2 re-examined here                                                                                 |
| 15 November  | **REMI proposes recipes** — the loop closes                  | `ai-assist/recipe-generation` (seed base or not: D-20), `summary-draft`, `patient-loop/check-in-and-progression`, `patient-profile-edit` · `recipe-feedback-and-favourites` returns from P2 before generation needs it             |
| 30 November  | **Freeze** — fixes only until the open day                   | triage                                                                                                                                                                                                                             |
| 1 December   | FunMedDev's team tests                                       | —                                                                                                                                                                                                                                  |
| 19 December  | Open day                                                     | —                                                                                                                                                                                                                                  |

The gateway starts mid-October by choice, not by capacity (D-14): a suggestion needs a meal entry
to land in, and a generated recipe needs the library-and-assign path. Until then Morgane tests
generation through `copy-context` with the model she already uses.

## Open points are deliberate

Every stub carries an **Open for Define** list under its `## Notes for Define`, and every prompt
tells the session to raise those points rather than answer them. That is on purpose: a number of
things the source documents do not settle — a vocabulary Morgane has not confirmed, a visibility
choice only she can make — would be decided by accident if an implementation just picked one.
Define is the last stage that gathers requirements: it asks the operator in session
(`stages/02_define/CONTEXT.md` step 2), and what cannot be settled goes under the spec's **Out of
scope**, never left open for Build to guess.

## Where the previous backlogs went

Five epics have shipped and sit in [`_done/`](_done/): `patient-record` and `patient-surface`
(the manual-first record and the read-only link, cut from the v2 structure brainstorm),
`nutrition-knowledge` (CIQUAL and her rules, archived by `close-out.sh` on 2026-09-18 once both
runs had merged), `practitioner-workflow` (the console around her consultation, seven runs, the
last merged 2026-09-18), and `patient-workspace`, which was **dropped whole** on 2026-09-10 — a re-layout
of the admin patient page with nothing changed in what it does, superseded by Morgane's feedback
that the page must be rebuilt around her workflow. Each of its stubs carries a `> Dropped:` line;
its research (R1–R30) is still cited by `practitioner-workflow`.

The numbered REMI-NNN tickets (phases A–F, cut 18 Aug 2026 from the direction report) were purged
in the 28 Aug clean slate (commit 444ecf5) after
[`new-development-direction.docx`](../docs/new-development-direction.docx) superseded their
sequencing — terrain-first, patient experience before the practitioner space. They remain
recoverable in git history.

## Four facts that keep getting re-invented

Worth knowing before reading any older document in this repository:

1. **There is no signed pilot.** ~15 practitioners is a beta **recruitment target**. Nobody has
   signed anything.
2. **There is no billing date and no revenue.** The "€24.50/practitioner/month from 1 September
   2026" was demo fixture data that an earlier audit read as a contract.
3. **The database question is closed — Neon.** The braindump named Supabase; the owner settled on
   Neon on 27 August 2026, and it is connected.
4. **V2 is not a port of v1, nor of the old V2.** The 7-day food diary, the psychological
   questionnaire, the nutrigenomics engine and rigid weekly plan generation are all out of scope;
   the old V2's flows (`remi-v2-explication-systeme.docx`) are inputs to learn from, at Morgane's
   own request, never a spec.

The precedence order between documents is in [`.icm/docs/README.md`](../docs/README.md).
