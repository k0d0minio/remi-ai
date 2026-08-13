# Stage 01 — Scope (contract)

Invoked via `/pipeline scope "<topic>"` (or `/pipeline scope <slug>` to revise). Your job is **one
thing**: propose the **business logic** in intricate detail until the scope is settled or its
unknowns are explicitly flagged, capture it in `scope.md` for the owner's approval, and — once
agreed — cut it into the intake batch of future runs. No spec, no code, no feature PR.

## The scope is business and product logic only — nothing else

**This is the rule that governs every other rule in this contract.** The scope is read to decide how
the product should work. It does not describe what the platform does today, what is already built,
or how any of it is implemented — and saying so makes the document harder to read and biases the
answer toward whatever happens to exist.

So the scope describes **how the product should work**, in the language the business uses, as if it
were being designed from nothing. Write the target logic, not the delta from today.

Never put any of these in it (or in the conversation you build it from):

- File paths, line references, function / component / hook / route / table / field names, API
  endpoints, schemas, env vars, package names — any identifier that only exists in the codebase.
- Framework, library or vendor names (Next.js, Postgres, Tailwind, …), including "we already use X
  for this". If a capability matters, name it in business terms: "the customer is notified by email".
- Statements about the current implementation: "this already exists", "there's no endpoint for this",
  "we'd extend the existing table".
- Effort, sizing, sequencing or feasibility framing — "this is a small change", "phase 2",
  "technically difficult". The cut handles sequencing; Define handles feasibility.
- Screens described as UI mechanics (button placement, modals, tabs). Describe what a person needs
  to be able to **decide or do**, not the control they click.

**Translation, not omission.** When something genuinely constrains the logic, state the constraint
in business terms. Not "there's no vendor column on the leads table" → but "today a lead cannot be
attributed to a partner; the logic below assumes it must be able to be."

If the honest answer to a question is "it depends what's already built", that is not a sentence for
the scope — it is a flag for the owner or a question for the operator.

## Inputs (read only these)

- The user's input — a brief, a call summary, or a topic to investigate.
- `pipeline/_shared/knowledge-map.md` — from it, only `apps/docs/app/business/roles/` (who this
  serves) and `business/initiatives/` (the why-now). **Both are written**: quote them rather than
  paraphrasing. Where a page says a thing is not decided, that is the answer — record the gap in
  `scope.md` and carry on. A hole in the strategy is a finding to report, not a reason to invent
  one or to go reading source instead.
- For the cut (step 4 only): `pipeline/intake/CONTEXT.md`.
- If revising: the existing `pipeline/runs/<slug>/01_scope/output/scope.md`.

**Do not read source code at all** — no `apps/**` or `packages/**` source, no `/CONVENTIONS.md`, no
`AGENTS.md`, no schemas, no config, no `pipeline/runs/**`. Not to check a fact, not to confirm a
seam, not to see whether something already exists. **There is no targeted-grep exception in this
stage**: the current state of the platform is exactly what the scope must be free of, and every look
at the code leaks into what you write.

Missing knowledge is resolved the way every other unknown is: ask the operator, or flag it for the
owner. Never by reading the codebase.

Context budget: the Inputs above are the budget (`pipeline/CONTEXT.md` → Layers). Record overruns on
a one-line `Context budget:` note in `scope.md`.

## Process

1. **Pick the slug** — short kebab-case (`csv-export`). It names everything from here on: the scope
   file, the intake folder, the demo work, the branch and PR. One string traces the feature end to
   end. Reuse the given slug if revising.

2. **Work out the business logic — then interrogate it, two lanes.** Push the brief to a **proposal
   the owner can react to line by line**. They are the domain expert; your job is to put a detailed,
   opinionated draft in front of them so they can correct and extend it — not to hand over a thin
   outline and ask them to fill it in. Vagueness they have to resolve from scratch is the failure
   mode; a specific rule they can strike through is the goal.

   Go deep on the logic itself: who acts, what starts it, what happens in what order, what the rules
   and thresholds are, what states things are in and what moves them, who is told what and when,
   what money or time is involved, and what happens when it goes wrong. Get concrete — real amounts,
   real durations, real counts. Each one is either something the owner stated, or a proposed default
   they can overrule.

   Where a rule is genuinely undetermined, **still propose one** and mark it. A proposal with a flag
   beats a blank. Never resolve a question by reasoning about what the platform does today.

   In parallel, drive out the unknowns:
   - **In-session:** ask the operator sharp questions (`AskUserQuestion`) about anything the brief
     plausibly settles. Don't manufacture questions when the answer is already on the table.
   - **Flag for the owner:** anything the operator can't settle — an unknown, an assumption you'd
     otherwise have to make, a fork only the owner can pick. Write each as a crisp, answerable
     question (yes/no or pick-one where possible), never open-ended musing, and state the default
     you'd take if they don't mind. A flagged unknown is fine; a silent assumption is not.

   **Out of scope is written first** and stays business-level ("we are not handling refunds this
   round"), never technical ("no API changes"). It prevents more rework than anything else here.

3. **Write `pipeline/runs/<slug>/01_scope/output/scope.md`** — the six fixed sections, in order (see
   Outputs). This **is** the Definition of Ready: the scope is not ready until every section is
   honestly filled.

   **Section 3 is where the detail goes** — the other five are framing. Its subsections are built
   from a required core plus a menu, so every scope doesn't come out shaped like the last one.

   **Always required, on every scope:**

   | Subsection                    | What goes in it                                                                                   |
   | ----------------------------- | ------------------------------------------------------------------------------------------------- |
   | **The model**                 | What this thing _is_, in the business's own words, plus the vocabulary the rest of the scope uses |
   | **Rules**                     | Numbered `BR-1`, `BR-2`, … — one thought per rule, each stated so it can be agreed or struck out  |
   | **Edge cases and exceptions** | `<the awkward case>` → `<what the business does about it>`. Where the real logic hides            |
   | **Worked example**            | One concrete end-to-end walk-through with real names, dates and numbers                           |

   **Required when more than one role is named in section 2:**

   | Subsection          | What goes in it                                                                                                                                                   |
   | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | **Decision rights** | Per role: what they can see, what they can change, what needs someone else's say-so. "Who is allowed to do this" is the most common silent assumption in a scope. |

   **Menu — include a subsection only if the topic genuinely has one.** An empty heading is worse
   than a missing one:

   | Subsection          | Include when…                                                     |
   | ------------------- | ----------------------------------------------------------------- |
   | Trigger             | something specific starts this — an event, a date, someone acting |
   | The flow            | there is an ordered sequence of steps                             |
   | States              | a thing moves through a lifecycle (Draft → Submitted → Approved)  |
   | Numbers that matter | amounts, percentages, deadlines, limits, counts are involved      |
   | Notifications       | someone needs telling — who, when, through which channel          |
   | Measures            | the topic is about counting or reporting something                |
   | Money               | pricing, fees, commission, who pays whom                          |

   **Invent one the menu doesn't cover** when the topic needs it — that's expected, not a deviation.
   Order them so the scope reads forwards: the model first, then the mechanics, then rules, then
   edge cases, then the worked example last.

   `BR-n` numbering is the stable reference — subsection numbers shift when a subsection is dropped,
   rule numbers don't — so the owner can answer "BR-4 is wrong, it's actually …". That's the point:
   a draft to correct, not a summary of what they already said.

   **The model subsection is where the current-implementation rule breaks first.** It is the least
   prescriptive slot and the easiest place to slide into "here's how it works today". Describe the
   **target** model, as if nothing existed yet.

   A small scope legitimately produces a short section 3 — three rules, two edge cases, one example
   is a pass. What is not a pass is a heading with nothing under it.

   For a **spike or investigation** the spine bends on purpose: section 3 becomes findings → options
   → recommendation, and section 6 carries the decision the owner must make rather than clarifying
   questions. Sections 1, 2, 4 and 5 stay as they are.

4. **Gate — HARD, in conversation.** Hand over the scope path, list the flagged questions, and
   **stop**. Proceed only when the operator confirms agreement **and relays the flag answers** — an
   "agreed" scope with unanswered cut-affecting flags is not agreed yet. On agreement the scope
   **freezes**: from Define onward `spec.md` is canonical and `scope.md` is never edited again. Any
   later change is a visible `spec.md` revision that re-opens the **Spec approved** tick. There is
   exactly one canonical scope per feature at every moment.

5. **Cut the intake batch.** Now — and only now — read `pipeline/intake/CONTEXT.md` and follow it:
   cut the agreed scope into `pipeline/intake/<slug>/breakdown.md` plus one stub per future feature
   PR, strictly sequenced. **Every scope gets an intake folder, however small** — a single-PR scope
   gets one stub whose `feature-slug` is the scope slug itself. Cut-level ambiguity is resolved from
   the agreed scope; if it leaves a cut-affecting hole, go back to step 2 rather than guessing.

6. **Commit straight to `main` and push.** These are markdown-only artifacts and landing them
   immediately keeps every device in sync. Commit message:
   `docs: <slug> — scope agreed (scope + intake cut)`. Touch nothing outside
   `pipeline/runs/<slug>/**` and `pipeline/intake/<slug>/**`. If branch protection rejects the push,
   fall back to a tiny docs-only PR merged green (`_shared/github.md` → the front regime) — never
   leave the front's artifacts local-only.

7. **Stop.** Report the scope path, the intake folder with its stub count and order, and that the
   next step is `/pipeline design <slug>` — or `/pipeline new` to walk the batch straight into
   Define if no prototype is needed.

## Outputs

`pipeline/runs/<slug>/01_scope/output/scope.md` — the six fixed sections, always present, always in
this order:

```md
# <Topic title> — scope

- slug: <slug>
- roles: <who this serves>
- status: awaiting approval | agreed <YYYY-MM-DD>
- stubs: <n> (pipeline/intake/<slug>/)

## 1. Problem

<what's broken or missing for the business — one or two sentences>

## 2. Who it's for

| Role   | What they get                      |
| ------ | ---------------------------------- |
| <role> | <one line — what changes for them> |

## 3. Business logic

<3.1, 3.2, … — the required core plus whichever menu subsections the topic actually has.
Rules numbered BR-1, BR-2, …>

## 4. Acceptance criteria

- <observable, testable statement of done, in business language>

## 5. Out of scope

- <what we are deliberately NOT doing — filled in first>

## 6. Open discussion

**For the owner — please answer before approving:**

1. <crisp yes/no or pick-one question> (default if you don't mind: <default>)

## Answers

- <question> → <the answer, or "default accepted: <default>">
```

Plus `pipeline/intake/<slug>/` — the breakdown and stubs — both committed on `main`.

## Verify (before handing off)

- The six sections are present, in order, with **Out of scope** filled in.
- **The scope is pure business and product logic.** Re-read it end to end against the rule at the
  top: no file paths, no component or table names, no framework or vendor names, no "already
  exists / currently doesn't", no effort or feasibility talk. Someone who has never seen the
  codebase reads it as a complete proposal. One offending sentence → rewrite it before handing over.
- **No source code was read this stage.**
- **Section 3 carries its required core** — the model, numbered `BR-n` rules, edge cases, and a
  worked example; plus decision rights whenever more than one role is named. Menu subsections appear
  only where the topic actually has one, and **no heading is empty**.
- **Section 3 carries real detail.** If the owner could only reply "yes, sounds right", it isn't
  specific enough to be worth their time.
- The model subsection describes the **target**, not what exists today — check this one specifically.
- **Every unknown is either answered in-session or flagged**, each flag states its default, and
  nothing was silently assumed.
- You stopped at the gate and got explicit confirmation, with the flags answered and recorded.
- The intake folder exists with ≥1 stub, strictly sequenced per `intake/CONTEXT.md`.
- `scope.md` and the intake folder are committed on `main` and pushed — resumable from any device.
- No spec, no code, no branch, no feature PR was created.
