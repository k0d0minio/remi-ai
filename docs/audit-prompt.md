# Pre-build audit — the prompt

The brief handed to a fresh **Fable 5** session before the first feature is built. Its one job is
to read this repo end to end and write a findings report. It changes no code, fixes nothing, and
opens no PR — the report is the whole deliverable.

Copy everything below the line into a fresh session with this repo checked out.

---

## Your job

You are auditing **Remi AI** — a Turborepo monorepo that is fully scaffolded but has not yet had a
real feature built on it. The owner wants to know, before breaking ground, whether the foundation
is genuinely ready: clean, scalable, well structured, honestly documented, and running on sound
devops practice.

**Your only output is a single markdown file: `docs/audit-report.md`.** You write that file and
nothing else. No code changes, no refactors, no "while I was in there" fixes, no PR. If you spot
something that begs to be fixed, it goes in the report as a finding — not in the tree.

Read everything before you judge anything. This repo is small enough to read properly: roughly 400
source and doc files. Do not sample and extrapolate.

## Ground rules

1. **Read-only.** The only tools you use are file reads, searches, `git log` / `git show`, and
   directory listings. The one file you write is `docs/audit-report.md`.
2. **Never run `build`, `lint`, `typecheck`, `format`, or a dev server.** A hook blocks them and
   that is deliberate — this repo's checks belong to CI, not to a session. Judge the code by
   reading it.
3. **Every claim needs an address.** A finding cites the file, and a line number where one applies:
   `packages/services/src/server/env.ts:12`. A claim you cannot point at does not go in the report.
4. **Never guess.** If you could not verify something — a Vercel setting, a GitHub branch rule,
   anything outside the repo — say so plainly and put it in the "Could not check" list. An honest
   gap is worth more than a confident invention.
5. **Say what is good.** The owner needs to know what to keep, not only what to fix. A section that
   is genuinely solid gets recorded as solid, in one line, and you move on.
6. **Do not decide things that are the owner's to decide.** Where a vendor, a strategy or a
   trade-off is still open, write it as a question with your recommendation attached — never as a
   finished conclusion.

## Write so a non-engineer can follow it

The report is read by the people who own the product, not only by whoever writes the code. That
sets the register:

- **Plain English, short sentences.** Say "the app has no way to tell you when it crashes in
  production", not "no APM / error-tracking instrumentation is wired into the runtime".
- **Explain any term you cannot avoid**, once, in brackets, the first time you use it: "the seam
  (the plug socket a vendor gets wired into later)".
- **Every finding answers four questions in this order:** what is true, why it matters, what
  happens if it is ignored, what to do about it. Two or three sentences each — never a wall.
- **No hedging.** "This is missing" beats "it may be worth considering whether this could be
  beneficial to address".
- **Scannable first, detailed second.** Someone should get the whole picture from the first page,
  and only read further for the parts they care about.
- Written in **English** — it is a technical document, and English is this repo's technical
  language.

## What this repo is

Six Next.js apps over two shared packages, plus a delivery pipeline that work flows through.

```text
apps/web        the product, signed-in                apps/docs      the reference site (Nextra)
apps/marketing  the public site                       apps/support   the public help centre
apps/admin      internal operations                   apps/demo      the prototype sandbox
packages/ui         @remi/ui — the design system
packages/services   @remi/services — storage, email, AI, env
pipeline/           the six-stage delivery process
```

Start with these, in this order, then go wherever they point:

| File                         | What it tells you                            |
| ---------------------------- | -------------------------------------------- |
| `README.md`                  | the shape of the thing                       |
| `CLAUDE.md`                  | how the rules are organised                  |
| `CONVENTIONS.md`             | every code rule the repo claims to follow    |
| `packages/services/AGENTS.md`| the seams, and why no vendor is chosen yet   |
| `docs/ENV.md`                | every environment variable and secret        |
| `pipeline/CONTEXT.md`        | how work is supposed to get done             |
| `turbo.json`, `package.json` | the build graph and the toolchain            |
| `.github/workflows/`         | what CI actually enforces                    |

Then read the source: both packages in full, and every app's `app/`, `components/` and `lib/`.

## What to audit

Thirteen areas. Cover all of them. If an area turns out to be genuinely fine, say so in a line and
spend your effort elsewhere.

**1 · Structure and boundaries.** The repo claims the dependency arrow only ever points app →
package: no app imports another app, no package imports an app, no second design system grows
inside an app. Check it holds in the code, and check the rules that are supposed to enforce it
(`eslint.config.ts`) actually do.

**2 · The stack, stated plainly.** Produce the definitive table of what this is built on and which
version — runtime, package manager, framework, language, styling, build, hosting. Flag anything
pinned in two places, anything drifting from the shared `catalog:` in `pnpm-workspace.yaml`, and
any dependency in a `package.json` that nothing imports.

**3 · The connections map.** This is the one the owner most wants. Every external thing this
product will need — database, authentication, email, AI, payments, analytics, error tracking, file
storage — as a table: what it is for, whether a vendor is chosen, whether any code exists, and what
happens today if something calls it. Be blunt about which of these are entirely absent, and which
are stubs that will throw the moment they are used. The empty rows are the point of the table.

**4 · The seams.** `@remi/services` deliberately defines interfaces instead of integrations
(`registerDatabase()`, `registerMailer()`, `registerTextProvider()`). Judge whether the seams are
actually good enough to take a real vendor: are the interfaces the right shape, is the
registration point unambiguous, is anything above the seam quietly assuming a specific vendor, and
what will genuinely have to change when the first adapter lands.

**5 · The data model.** `packages/services/src/db/models/` holds the entity types. Read them
against what the product is meant to do (`apps/docs/app/business/**`). Are the entities coherent
and complete, do the relationships make sense, are there obvious gaps a first feature would hit
immediately, and is anything modelled in a way that will be painful to change later.

**6 · Configuration and environments.** The repo claims a variable must appear in three places at
once: the zod schema in `packages/services/src/server/env.ts`, a row in `docs/ENV.md`, and
`globalEnv` in `turbo.json`. Check all three lists against each other and against every actual
`process.env` read in the tree. Report the mismatches as a table — this is a mechanical check and
it should be exact.

**7 · Build, CI and deployment.** The workflows in `.github/workflows/`, the Husky pre-commit hook,
the Turborepo cache, the per-app Vercel projects and their `turbo-ignore` commands. What is
actually enforced before code reaches `main`, what is claimed but not enforced, and what a rollback
looks like if a bad deploy goes out. Say clearly what you could not see from inside the repo
(branch protection rules, Vercel project settings, who can merge).

**8 · Testing.** `CONVENTIONS.md` commits to test-driven development and a 75% coverage floor on
the database layer. Compare that to what exists. Report the gap between the stated rule and the
reality, and say what the minimum credible test setup looks like before feature work starts —
runner, where tests live, what gets tested first, what gate makes it stick.

**9 · Running it in production.** If this shipped tomorrow and broke, how would anyone find out?
Cover error tracking, logging, health checks, uptime, alerting, and analytics. For each: does it
exist, is it wired, who gets told. Be concrete about what "invisible failure" means here.

**10 · Security and data protection.** This product handles health and nutrition data about
identifiable people, in Belgium — so GDPR and health-data sensitivity are live concerns, not
theoretical ones. Cover: how the admin app is protected, whether authentication exists at all, how
secrets are handled, whether anything sensitive is committed, what an audit trail would need to
record, and what the data-protection obligations imply for the storage decision that has not been
made yet. Flag the decisions that must be made **before** the first byte of personal data is
stored.

**11 · Scale.** Where does this design strain as usage grows — rendering and caching strategy, the
server/client component split, bundle size discipline, how database access will be shaped, and
whether six separate deployments help or hurt. Distinguish clearly between real limits and things
that are simply not built yet.

**12 · The user-facing surface.** Accessibility, the two-language setup (which apps carry a locale
prefix and which do not, and whether that is deliberate), SEO basics on the public sites, error and
loading states, and whether the design system is being used as the rules require.

**13 · Documentation honesty.** The repo's strongest claim is that every rule lives in exactly one
place and that the docs describe reality. Test it. Find rules stated twice in ways that could drift
apart, documentation describing something the code does not do, and code doing something no
document mentions. Each of those is a finding.

### Checks worth doing mechanically

These are exact, so do them exactly rather than by impression:

- every `process.env` read in the tree, against the three lists in area 6
- every dependency in every `package.json`, against actual imports
- every export from `packages/ui/src/index.ts` and the `@remi/services` entrypoints, against a real
  consumer — the repo forbids exports nothing imports
- imports crossing an app boundary, or reaching into `@radix-ui/*` directly
- hardcoded URLs and origins anywhere outside `packages/services/src/shared/links.ts`
- anything that looks like a credential, key or token committed to the tree
- files nothing reaches — dead components, orphaned helpers, duplicated utilities

## The report

Write `docs/audit-report.md` with exactly these sections, in this order.

### 1 · The verdict

Three or four sentences, no jargon. Is this foundation ready to build features on? If not, what is
the shortest path to ready. Then the scoreboard — one row per area, and nothing but these four
words in the rating column:

| Area | Rating | One-line reason |
| ---- | ------ | --------------- |

**Solid** (ready as is) · **Good, gaps** (works, known holes) · **Needs work** (fix before
building) · **Missing** (does not exist).

### 2 · What to do before building features

A numbered checklist, ordered by what has to happen first. Each line: the action, why it comes
where it does, and rough size — **hours**, **a day**, **a few days**, **a week or more**. This is
the section the owner will actually work from, so it must stand alone and be honest about
sequencing.

### 3 · What is already right

The things worth protecting, five to ten lines. Real strengths only — no padding.

### 4 · The stack

The definitive table from area 2, plus a short paragraph on anything version-related that needs a
decision.

### 5 · The connections map

The table from area 3. Every external dependency the product will need, with its honest status.

### 6 · Findings

The body of the report, grouped by the thirteen areas. One block per finding:

```markdown
#### F-07 · Nothing tells you when the app breaks in production

**Severity:** Important
**Where:** `docs/ENV.md:104` — `SENTRY_DSN` is listed as "not wired yet"

**What is true.** Plain statement of the fact.
**Why it matters.** The consequence, in the owner's terms.
**If ignored.** What actually goes wrong, and when.
**What to do.** A concrete, sized next step.
```

Number findings `F-01` onward and use exactly three severities:

- **Blocker** — build a feature on this and it breaks, or it puts data or users at risk
- **Important** — fix it before feature work; it gets much more expensive after
- **Later** — real, but it can wait, and here is the signal that it can no longer wait

Order the findings within each area by severity, worst first.

### 7 · Decisions the owner needs to make

The open questions, as questions. Each one: what is being asked, the realistic options, what each
option costs and locks in, your recommendation, and how long it can be left unanswered. Vendor
choices, the data-protection posture, and anything else where the right answer is a judgement call
rather than a fact.

### 8 · Could not check

Everything you could not verify from inside the repo, and what someone would have to look at to
close each gap. Do not pad it and do not hide it.

## Before you finish

Read your own report back and confirm all of this:

- Someone who has never seen the code understands the verdict from the first page.
- Every finding cites a file. Every severity is one of the three words.
- Nothing is stated that you did not verify — and everything you could not verify is in section 8.
- The strengths are recorded as clearly as the problems.
- There is no jargon left unexplained, and no sentence that needed to be read twice.
- You changed no file except `docs/audit-report.md`.

Length is whatever the findings need. A shorter honest report beats a padded thorough-looking one —
but do not compress away a real finding to keep it tidy.
