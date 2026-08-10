# Remi AI — pre-build audit report

Audited on 2026-08-08 at commit `5844bbb`, by reading the repository end to end: every rule
document, every source file in both packages and all six apps, the pipeline contracts and scripts,
the CI workflows, and the git history. Nothing was executed and nothing was changed except this
file. The brief for this audit is `docs/audit-prompt.md`.

---

## 1 · The verdict

**This foundation is architecturally excellent and unusually honest with itself, but it is not
ready to build features on yet — and one thing needs closing today, not before feature work.**
The structure, conventions and discipline are genuinely strong; what is missing is everything that
touches the outside world: there is no database, no sign-in, no tests, no way to know the product
crashed, and the internal console — which contains a live, confidential equity negotiation
document — has no access control inside this repository. The shortest path to ready is about two
weeks of foundation work plus a handful of decisions only the owner can make (database vendor,
authentication, payments, the data-protection posture). None of the gaps is expensive relative to
what is already built.

| #   | Area                           | Rating     | One-line reason                                                                                                                                         |
| --- | ------------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Structure and boundaries       | Good, gaps | The boundaries genuinely hold everywhere; the repo's own "no export without a user" rule is broken ~20 times                                            |
| 2   | The stack                      | Solid      | One version of everything, everywhere; a few version pins live outside the shared catalogue                                                             |
| 3   | The connections map            | Missing    | Except analytics, nothing external is connected — deliberate, but the empty rows are real, and the one live form collects messages it cannot deliver    |
| 4   | The seams                      | Good, gaps | Well-built plug sockets, but the database socket is too small for the first real screen and the AI socket is too thin for the product's own rules       |
| 5   | The data model                 | Needs work | The access-control entity the docs call decided does not exist; auth, audit and consent have no entities at all                                         |
| 6   | Configuration and environments | Solid      | The three-list rule holds exactly; secrets hygiene is exemplary; two cosmetic nits                                                                      |
| 7   | Build, CI and deployment       | Good, gaps | Real enforcement with a zero-warning ceiling, but documentation-only changes skip checks entirely and the human gates are enforced by nothing           |
| 8   | Testing                        | Missing    | Zero test files, no runner, no CI step — against a stated 75% coverage commitment                                                                       |
| 9   | Running it in production       | Missing    | A production crash is invisible today: no error tracking, no health checks, no alerts                                                                   |
| 10  | Security and data protection   | Needs work | Confidential business content is one URL-guess away; no authentication exists; secrets handling, by contrast, is exemplary                              |
| 11  | Scale                          | Good, gaps | The rendering and bundle discipline is right; one baked-in slow-query pattern and two deployment-config traps                                           |
| 12  | The user-facing surface        | Good, gaps | Design-system and language discipline near 100%; missing skip links and some public-site polish                                                         |
| 13  | Documentation honesty          | Good, gaps | Mechanically excellent (zero broken links), but "every rule lives in one place" is not true in practice, and five duplicated rules have already drifted |

## 2 · What to do before building features

Ordered by what has to happen first. Sizes are working-effort estimates.

1. **Close the admin and docs exposure — today.** Verify Vercel deployment protection (a
   password/SSO wall the hosting provider puts in front of a site) is actually ON for the admin
   project, and decide whether the docs site should be public — it currently publishes the pilot's
   confidential pricing and the fact that the console is unprotected. Also decide whether the
   equity-offer page belongs in any deployed app at all. This comes first because it is a live
   exposure, not a code-quality issue. _(Hours — it is configuration, not code.)_ → F-30, F-31
2. **Give the contact form somewhere to deliver.** The public contact form is honest — it tells
   the sender delivery is not connected and to email directly — but it still keeps no record of
   who wrote in, during an open pilot-recruitment window. Wire the Resend email adapter (the seam
   and the env variable are already prepared) or store submissions somewhere retrievable.
   _(Hours to a day.)_ → F-06
3. **Turn on branch protection and settle the merge rules.** Make the Quality check required on
   the main branch, configure squash-merge (the repo's own stated rule, never yet practiced), and
   resolve the trap that documentation-only changes skip checks entirely. Everything after this
   step inherits its safety from it. _(Hours — GitHub settings plus one workflow edit.)_ → F-22, F-23, F-45
4. **Fix the drift batch.** One sitting: add `support` to the two pipeline scripts and two
   templates that don't know it exists; correct the four docs claiming the business pages are
   unwritten; fix the stale packages page; delete the dead routing hook. Cheap now, misleading
   forever if left. _(Hours.)_ → F-21, F-44, F-46, F-47
5. **Stand up the test harness.** Vitest (a test runner that fits this stack with zero extra
   build machinery), first tests on the ~900 lines of pure logic that already exist (locale
   parsing, link building, formatters, env parsing), and a CI step so it gates every PR. Do this
   _before_ the first database adapter, not with it — bootstrapping harness + adapter + coverage
   floor in one PR is how the floor gets waived. _(A day.)_ → F-26
6. **Wire error tracking.** Sentry (or equivalent) via an `instrumentation.ts` file in each app,
   plus the missing `global-error.tsx` safety nets. The repo already calls this "the top unstarted
   ops item" and has reserved the variable names. Until this exists, every crash after this point
   is invisible. _(A day.)_ → F-27, F-29
7. **Model the missing entities before the first byte of real data.** The
   practitioner↔person relationship record (the decided access-control primitive), consent
   capture, the audit trail, and the AI-generation record. These shape the database schema, so
   they come before the adapter. _(A few days, including the decisions attached.)_ → F-14, F-16
8. **Choose the database vendor and land the first adapter** — with migrations, a registration
   point, and the coverage floor switched on. This unblocks every real feature and is where
   findings F-08 through F-11 get resolved. _(A week or more.)_ → F-08–F-11
9. **Choose the auth approach and replace the development session.** Magic links are already
   decided in principle; pick the implementation and wire the real session provider into the seam
   that is waiting for it. _(A week or more; can overlap with 8.)_ → F-32
10. **Do the GDPR groundwork in parallel with 7–9:** processor agreements, the pseudonymisation
    decision for AI calls, a retention schedule. Owner-and-legal work, not engineering. _(A few
    days of owner time.)_ → F-34 and section 7

Items 1–4 are a day or two in total and remove every live risk. Items 5–6 make everything after
them safe to build. Items 7–10 are the real pre-feature work and are dominated by decisions, not
code.

## 3 · What is already right

- **The boundaries are real, not aspirational**: zero app-to-app imports, zero packages importing
  apps, zero direct Radix imports in apps, zero orphaned files across all 147 app component/lib
  files — verified mechanically, not sampled.
- **Secrets hygiene is exemplary**: nothing sensitive has ever been committed in 111 commits, the
  ignore rules are right, and the env-variable three-list rule holds exactly (8/8 server
  variables, 6/6 public overrides).
- **Client/server discipline is the best part of the codebase**: all 32 `"use client"` directives
  earn their place, the animation library never touches first paint, and there are documented
  _refusals_ to ship JavaScript where HTML would do.
- **Design-system compliance in apps is effectively 100%** — tokens not raw colours, Typography
  not raw tags, one intent vocabulary, sentence case in both languages, and English/French parity
  enforced by the compiler.
- **CI is small and serious**: a zero-warning ceiling with a written ratchet policy, minimal
  workflow permissions, and pipeline shell scripts that verify every HTTP response instead of
  assuming success.
- **The failure modes are designed**: unregistered database and AI adapters throw errors that name
  the fix; the unconfigured mailer is loud instead of silent; error pages show a correlation id
  and deliberately hide details that could leak data.
- **The documentation culture is honest**: gaps are usually named as gaps ("a production exception
  is invisible", "not an access control and is not treated as one") — this audit found drift, but
  almost no pretending.

## 4 · The stack

| Layer           | Technology                                            | Version                     | Pinned in                                   |
| --------------- | ----------------------------------------------------- | --------------------------- | ------------------------------------------- |
| Runtime         | Node.js                                               | 22.x (LTS line)             | `package.json:37`, CI `quality.yaml:52`     |
| Package manager | pnpm                                                  | 10.33.0 exact               | `package.json:40`                           |
| Monorepo        | Turborepo                                             | ^2.9.16                     | `package.json:53`                           |
| Framework       | Next.js (App Router)                                  | catalogue ^16.2.3 → 16.2.12 | `pnpm-workspace.yaml:15`                    |
| UI library      | React                                                 | catalogue ^19.2.0 → 19.2.8  | `pnpm-workspace.yaml:16-17`                 |
| Language        | TypeScript, strict everywhere                         | catalogue ^5.9.3            | `pnpm-workspace.yaml:19`, `tsconfig.json:7` |
| Styling         | Tailwind CSS                                          | catalogue ^4.1.14 → 4.3.3   | `pnpm-workspace.yaml:18`                    |
| Components      | shadcn/ui over Radix, lucide-react icons              | Radix ^1/^2 per package     | `packages/ui/package.json:35-51`            |
| Validation      | zod                                                   | catalogue ^4.3.0 → 4.3.5    | `pnpm-workspace.yaml:20`                    |
| Docs site       | Nextra + Pagefind search                              | ^4.6.0 / ^1.4.0             | `apps/docs/package.json:21-31`              |
| Package build   | tsup → ESM                                            | ^8.5.0                      | both packages                               |
| Lint/format     | ESLint 9 flat config, Prettier 3, Husky + lint-staged | —                           | root `package.json:41-56`                   |
| Hosting         | Vercel, one project per app                           | —                           | `apps/*/vercel.json`                        |

Everything resolves to exactly one version across all eight workspaces — no version splits
anywhere. Nothing on the stack is a beta or pre-release. Two version matters need a decision:
several tools are pinned literally in multiple files instead of the shared catalogue (F-04), and a
few dependencies are pre-1.0 (`lucide-react` 0.545, `class-variance-authority` 0.7) where minor
updates may break — decide whether those pins should be exact.

## 5 · The connections map

Every external thing this product will need, with its honest status today. The empty rows are
deliberate design (the "seams" — plug sockets a vendor gets wired into later) — but they are
still empty.

| Connection     | For                                                                                    | Vendor chosen?                                                                                                                                 | Code exists?                                                                                          | What happens today if something calls it                                                                                                                                                    |
| -------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Database       | All persistence — the entire core loop                                                 | In docs only: Neon (EU Postgres), Supabase named as likely later (`apps/docs/app/technical/decisions/page.mdx:13-16`)                          | Seam only — interface + registration point, no adapter                                                | Nothing calls it. Every screen reads built-in fake data instead (`apps/web/lib/queries/clients.ts:21-22`), so it does not even fail loudly — see F-08                                       |
| Authentication | Practitioner/person sign-in; operator access to admin                                  | Shape decided (magic links, `decisions/page.mdx:17-19`); **no vendor**                                                                         | A session seam in the web app only                                                                    | Sign-in ignores email and password entirely; a role radio button is the whole "login" (`apps/web/lib/actions/session.ts:26-38`). Admin has **nothing** — see F-30, F-32                     |
| Email          | Magic links, pilot invites, contact form                                               | Leaning Resend (`docs/ENV.md:63`)                                                                                                              | Seam + a console fallback that logs instead of sending (`packages/services/src/email/index.ts:34-40`) | Any caller of the seam is told "sent" while nothing leaves the process. The live contact form does not call the seam at all — it validates, says so plainly, and keeps no record — see F-06 |
| AI             | Structuring notes, generating plans/meals within the therapeutic frame                 | Anthropic models via Vercel AI Gateway, in docs (`decisions/page.mdx:26-28`; model ids hardcoded in `packages/services/src/ai/index.ts:15-19`) | Seam only, no adapter, no caller                                                                      | Throws a clear "no AI provider registered" error (`ai/index.ts:48-52`) — correct behaviour, zero call sites                                                                                 |
| Payments       | Billing starts **1 September 2026** (`apps/docs/app/business/initiatives/page.mdx:24`) | **Nothing — no vendor, no leaning, no code, no reserved variable**                                                                             | Nothing                                                                                               | Nothing to call. Three weeks from the audit date — see F-07                                                                                                                                 |
| Error tracking | Knowing the product crashed                                                            | Deferred; Sentry names reserved (`docs/ENV.md:102-103`)                                                                                        | **Nothing**                                                                                           | Crashes vanish — see F-27                                                                                                                                                                   |
| Analytics      | Traffic measurement                                                                    | **Yes — Vercel Analytics, the one live connection**                                                                                            | Wired in 5 of 6 apps (docs declares it but never renders it)                                          | Works (if enabled on the Vercel side)                                                                                                                                                       |
| File storage   | Lab reports, plan exports (both promised by the product docs)                          | No; Supabase buckets mentioned as a future option                                                                                              | Nothing                                                                                               | Nothing to call — a decision for later, but the 90-day export promise needs it                                                                                                              |

## 6 · Findings

Grouped by the thirteen audit areas. Severities: **Blocker** (build on this and it breaks, or it
puts data or users at risk) · **Important** (fix before feature work) · **Later** (real, can
wait — with the signal that it can't anymore).

### Area 1 · Structure and boundaries

#### F-01 · About twenty exported things have no user, against the repo's own rule

**Severity:** Important
**Where:** `packages/ui/src/index.ts:26,41,52-53,61,70-73` · `packages/ui/src/server.ts:27-45` · `packages/ui/src/motion/index.tsx:117,130` · `packages/services/src/shared/index.ts:11,13,27-29,38-56`

**What is true.** The conventions say an export without a consumer is a review blocker
(`CONVENTIONS.md:163-165`). Mechanically checking every import in the repo: nine client
components/sub-parts, five style-variant exports, two animation shells, and several helpers and
types (`formatCurrency`, `formatDateTime`, `unwrap`, eight domain types) are exported and imported
by nothing. The entire Tooltip component — file, exports, and its `@radix-ui/react-tooltip`
dependency (`packages/ui/package.json:45`) — is dead. The unused `./globals.css` package export
builds an artifact nothing reads (`packages/ui/package.json:22,29`).
**Why it matters.** These are the repo's own rules, and each unused export is a commitment that
blocks renames and hides what the real public surface is.
**If ignored.** The gap between claimed and actual discipline widens with every PR, and the
"twenty thousand lines of drift" the conventions warn about starts here.
**What to do.** One cleanup PR deleting the unused exports and the tooltip dependency — or, where
a seam export is deliberately pre-built (see F-13 caveat), say so in the barrel comment. _(Hours.)_

#### F-02 · The docs app is exempt from all the boundary lint rules

**Severity:** Later
**Where:** `eslint.config.ts:17-23` — `CONSUMER_APPS` lists five apps; `apps/docs` is not one

**What is true.** The lint rules that stop an app importing Radix directly, growing a local design
system, or reaching into the services package's root all apply to five apps; docs gets none of
them. Today docs behaves perfectly (its only services import is the sanctioned
`@remi/services/shared`, `apps/docs/app/layout.tsx:5`).
**Why it matters.** An unguarded app is where a second design system quietly starts.
**If ignored.** Nothing, until someone adds UI to docs — that is the signal it can no longer wait.
**What to do.** Add `apps/docs` to the restricted list; it costs nothing today. _(Minutes.)_

#### F-03 · A second real-world domain lives outside the one-domain catalogue

**Severity:** Later
**Where:** `apps/marketing/lib/content/en.ts:679,685` (and `fr.ts:683,689`) vs `packages/services/src/shared/links.ts:29`

**What is true.** The rule is that exactly one file knows the domain, and that file says the root
domain is `jamienisbet.com`. The marketing contact copy hardcodes `morgane@remiai.be` and
`arnaud@remiai.be` — the product's actual brand domain, in four content lines.
**Why it matters.** When the domains consolidate (see F-39 and section 7), these are the lines
that get missed.
**If ignored.** Contact emails pointing at the wrong domain after the move.
**What to do.** Note them in `links.ts`'s comment or centralise contact addresses; fix at domain
consolidation time. _(Minutes.)_

### Area 2 · The stack

#### F-04 · Tool versions pinned outside the shared catalogue, in up to seven places

**Severity:** Important
**Where:** `@tailwindcss/postcss` in five apps (e.g. `apps/web/package.json:26`) and `@tailwindcss/cli` in `packages/ui/package.json:57`; `eslint ^9.39.1` in root + all six apps; `postcss` in five apps; `tsup` in both packages

**What is true.** The catalogue (`pnpm-workspace.yaml:7-20`) exists precisely so shared versions
are pinned once, and the runtime dependencies honour it perfectly. But the Tailwind companion
packages, ESLint, PostCSS and tsup are pinned literally in 2–7 files each.
**Why it matters.** Tailwind and its companions must move together; today they can drift
independently — the exact failure the catalogue comment warns against.
**If ignored.** A future Tailwind upgrade updates the catalogue and misses a companion pin,
producing a version mismatch that breaks builds confusingly.
**What to do.** Add the six packages to the catalogue and replace the literal pins with
`catalog:`. _(An hour.)_

#### F-05 · One orphaned catalogue entry and one declared-but-unused dependency

**Severity:** Later
**Where:** `pnpm-workspace.yaml:12` (`date-fns` — nothing declares or installs it) · `apps/docs/package.json:19` (`@vercel/analytics` — never imported in docs)

**What is true.** `date-fns` is catalogued but used by no workspace and absent from the lockfile.
The docs app declares the analytics package but never renders it — every other app does.
**Why it matters.** Both violate "every dependency needs an import" (`CONVENTIONS.md:160-162`);
the docs one also means docs is the only app reporting no traffic.
**If ignored.** Minor confusion; missing traffic data for docs.
**What to do.** Delete the `date-fns` line; either add `<Analytics />` to
`apps/docs/app/layout.tsx` or drop the dependency. _(Minutes.)_

### Area 3 · The connections map

#### F-06 · The public contact form delivers nowhere and keeps no record — but it says so

**Severity:** Important
**Where:** `apps/marketing/app/[locale]/contact/actions.ts:65-76` · the success copy at
`apps/marketing/lib/content/en.ts:698-700` and `fr.ts:701-703`

**What is true.** The marketing contact form validates input, then returns success without
delivering the message anywhere — a code comment admits it ("When an adapter lands: import it
from @remi/services/email"). It is **not** dishonest about this: the success body reads "Delivery
is not connected yet, so nothing has been sent; write to us directly at the addresses above"
(French equivalent identical in force), so the sender is told to use the addresses in F-03. What
is still missing is any record that they wrote at all. The pilot-recruitment window is open right
now (1 July – 31 August 2026, `apps/docs/app/business/initiatives/page.mdx:19-25`), and this is
the public site's contact channel.
**Why it matters.** The honest copy removes the deception but not the loss: a prospective pilot
practitioner who fills the form and does not go on to re-type their message into a mail client is
gone with no trace. (Caveat: whether the marketing site is deployed and receiving traffic could
not be verified from the repo — section 8.)
**If ignored.** Silent drop-off during the one window the current quarter is built around, with no
way to know how many.
**What to do.** Wire the Resend adapter (seam and env variable already prepared) or persist
submissions somewhere retrievable, and then restore an ordinary "we'll reply" success message.
_(Hours to a day.)_

#### F-07 · Payments do not exist in any form, and billing starts on 1 September 2026

**Severity:** Important
**Where:** `docs/ENV.md:104-105` (the only mention) · `apps/docs/app/business/initiatives/page.mdx:24` (the billing date)

**What is true.** The signed pilot terms say billing (€24.50/practitioner/month) starts
1 September 2026. There is no payment vendor, no code, no seam, and no reserved variable — the
only trace is a smoke-test checklist line that stays "not touched".
**Why it matters.** This is the only connection with a contractual date attached, and it is the
least started.
**If ignored.** Either billing slips, or it gets built in a rush against the pilot's first
invoice — the most error-intolerant feature in the product, done under the most time pressure.
**What to do.** Decide the vendor now (section 7); for fifteen practitioners, even manual
invoicing is a legitimate first answer — but decide it, don't discover it in September.

### Area 4 · The seams

#### F-08 · "A missing database fails loud" is not true where it matters — production serves fake data silently

**Severity:** Important
**Where:** `apps/web/lib/queries/clients.ts:16-22` (and all eight `apps/web/lib/queries/*` files) vs `packages/services/src/db/client.ts:49-53`

**What is true.** The seam's `getDatabase()` does throw loudly when no adapter is registered — but
nothing calls it. Every query module in the signed-in app returns fixture (built-in fake) data
unconditionally; `isDatabaseRegistered()` exists and has zero users.
**Why it matters.** The design promise (`packages/services/AGENTS.md:15`) is that a missing
database is impossible to miss. In reality a production deploy today renders plausible fake
patients with no error anywhere.
**If ignored.** The first feature built "against the seam" will actually be built against
fixtures, and the difference will surface as a surprise during the adapter migration — or worse,
in front of a pilot user.
**What to do.** When the first adapter lands, make the query modules go through the seam in the
same PR, and delete the fixture path or gate it behind an explicit flag. Until then, treat every
screen as a mock-up. _(Part of the adapter PR.)_

#### F-09 · The database interface is too small for the first real screen

**Severity:** Important
**Where:** `packages/services/src/db/client.ts:17` · `packages/services/src/types/index.ts:25-28`

**What is true.** The `Collection` interface offers find-by-id and find-by-exact-match only: no
sorting, no ranges, no "any of these values". The existing screens already need more (meals sorted
by date, `apps/web/lib/queries/meals.ts:24`; signals by recency). The pagination type is
cursor-based with no defined sort order, which cannot be implemented deterministically.
**Why it matters.** The seam's whole promise is that the first adapter is "one file plus one
registration line". With this interface, it is that plus an interface redesign.
**If ignored.** The first adapter PR grows into a seam-redesign PR under feature pressure.
**What to do.** Extend `Collection` (sort, range, in-list) before the adapter, as its own small
reviewed change. _(A day.)_

#### F-10 · The decided access model cannot be expressed through the seam

**Severity:** Important
**Where:** `apps/docs/app/technical/decisions/page.mdx:20-22` vs `packages/services/src/db/client.ts:17`

**What is true.** The decision log says every query scopes through a practitioner↔person
relationship record. A single-collection exact-match filter cannot express that relationship
check; there is no join or scoped-query capability.
**Why it matters.** Access control ("who may see this person's data") is the one query pattern a
health product cannot get wrong, and the current seam forces it to live above the seam, in
app code, repeated per query.
**If ignored.** Tenancy checks get hand-rolled per screen — the classic origin of
"practitioner A saw practitioner B's patient".
**What to do.** Design the scoped-query shape (or commit to database-level row security and say
so) together with F-14, before the adapter. _(Part of the F-14 work.)_

#### F-11 · There is no place where an adapter would actually be registered

**Severity:** Important
**Where:** `packages/services/src/db/client.ts:34-37` (names the instrumentation hook) — no `instrumentation.ts` exists in any app; `packages/services/src/db/index.ts:8-13` and `packages/services/AGENTS.md:63-82` name `db/services/` and `db/migrations/` — neither directory exists

**What is true.** The documented registration point (a Next.js `instrumentation.ts` startup file)
exists in no app. The documented service-layer and migrations directories do not exist. The
seam has a `close()` nobody will call on serverless hosting, and no migration story.
**Why it matters.** "One adapter file and one registration line" is really: adapter + bootstrap
file per app + migrations tooling + connection lifecycle decisions.
**If ignored.** The first adapter PR is scoped as an afternoon and turns out to be a week —
schedule surprise, not code surprise.
**What to do.** Nothing to build now; re-size the adapter milestone honestly (section 2, item 8).

#### F-12 · The AI socket is too thin for the product's own safety rules

**Severity:** Important
**Where:** `packages/services/src/ai/index.ts:38` vs `apps/docs/app/technical/decisions/page.mdx:29-32`

**What is true.** The AI interface is `generateText(prompt) → string`. The decision log requires
every AI output to be validated against the practitioner's therapeutic frame before rendering, and
persisted with its context as an audit trail. A bare string in, bare string out interface supports
neither — no structured output, no context object, no usage metadata, no streaming. The docs
acknowledge the seam must grow first.
**Why it matters.** The audit-trail and bounded-generation requirements are the product's safety
thesis, and the current interface cannot carry them.
**If ignored.** The first AI feature either bypasses the seam (breaking the architecture) or ships
without the audit trail (breaking the promise).
**What to do.** Redesign `TextProvider` (structured output, generation-context in, persisted
generation record out) alongside the F-16 entity, before any AI feature. _(A few days, design-heavy.)_

#### F-13 · Small seam inconsistencies worth one tidy-up

**Severity:** Later
**Where:** `packages/services/src/email/index.ts:45-47` and `ai/index.ts:43-45` (silent re-registration; the DB seam correctly rejects it, `db/client.ts:40-44`) · `server/env.ts:11-22` (every variable optional, so the promised fail-at-boot only happens via `requireEnv`, which nothing calls yet) · `ai/index.ts:15-19` (hardcoded Anthropic model ids, two of three undated)

**What is true.** Three guards behave three ways; the env schema cannot fail at boot as its header
claims; the model ids include undated names that must be verified when the adapter lands. A noted
caveat to F-01: the unused seam entrypoints (`/server`, `/db`, `/ai`, `/email` — zero importers
today) are documented as deliberately pre-built, a stated tension with the lean rule rather than
rot.
**Why it matters.** Each is a small trap for the person wiring the first adapter.
**If ignored.** Minor confusion at adapter time; nothing before that.
**What to do.** Align the registration guards, and check the model ids in the adapter PR. _(An hour.)_

### Area 5 · The data model

#### F-14 · The access-control entity the docs call "decided" does not exist

**Severity:** Blocker
**Where:** `apps/docs/app/technical/decisions/page.mdx:20-22` (the decision) vs `packages/services/src/db/models/` (ten entities, none of them this one); `person.ts:57` (a bare `practitionerId` instead)

**What is true.** The decision log's tenancy model — a practitioner↔person relationship record
with a start and end date, where the end date ends access — has no entity. What exists is a plain
`practitionerId` field on Person, with no dates and no history.
**Why it matters.** This entity is who-may-see-whose-health-data. Every query, every screen and
the database's own row-level security will be shaped by it.
**If ignored.** The first persistence feature builds on the bare foreign key; retrofitting
relationship history onto live health data later is a migration with legal implications, not a
refactor.
**What to do.** Model `CareRelationship` (and adjust Person) before the first adapter — this is
section 2, item 7, and it is small once decided. _(A day of modelling; the decisions around it are
the real work.)_

#### F-15 · The admin console's whole domain lives outside the shared model layer

**Severity:** Important
**Where:** `apps/admin/lib/fixtures.ts:781,799,1121,1407,1535` — `PilotApplication`, `PilotCohort`, `SupportTicket`, `FeatureFlag`, `AuditEntry` defined app-locally

**What is true.** Five entity types the quarter's own objective depends on ("fifteen
practitioners enrolled … applications tracked in the console",
`apps/docs/app/business/initiatives/page.mdx:38`) exist only as fixture types inside the admin
app, not in `packages/services/src/db/models/`.
**Why it matters.** The first real admin feature — tracking actual pilot applications — needs
these in the shared model layer, where every other entity lives.
**If ignored.** Either the admin domain gets persisted app-locally (forking the architecture) or
the first admin feature starts with an unplanned model migration.
**What to do.** Promote the admin entities into the shared models when the enrolment feature is
scoped. _(A day.)_

#### F-16 · No entities for auth, consent, audit, or AI generations

**Severity:** Important
**Where:** `packages/services/src/db/models/` (nothing of the kind) · `packages/services/src/types/index.ts:11-16` (base entity has no created-by, no deleted-at)

**What is true.** There is no session/token entity (magic links need one), no consent record
(explicit consent for health data is listed as phase-1-blocking, `apps/admin/lib/roadmap.ts:65-67`),
no audit-log entity (despite an admin audit screen sketched in fixtures and the rule that
destructive admin operations record who did what, `apps/admin/AGENTS.md`), and no AI-generation
record (despite "every AI output persisted with its context", `decisions/page.mdx:30-31`). No
entity carries actor attribution or supports soft deletion.
**Why it matters.** These are the entities GDPR and the product's own safety rules require to
exist _before_ the first real record, not after.
**If ignored.** Personal health data exists before the structures that make it lawful and
accountable — retrofit under regulatory exposure.
**What to do.** Model consent, audit and AI-generation entities with F-14, before the adapter.
_(Included in section 2, item 7.)_

#### F-17 · Several relationships are stored twice or as prose, and can drift

**Severity:** Important
**Where:** `plan.ts:18-19` (`recommendationIds`/`stepIds` arrays duplicating `step.ts:12`'s `planId`) · `practitioner.ts:17` + `therapeutic-frame.ts:24` (the same link stored on both sides) · `recipe.ts:17-22` (`honours` links recipes to recommendations in plain words) · `progress-signal.ts:23-24` (an id field that could point at anything, with no type marker)

**What is true.** Two relationships are stored on both sides with nothing keeping them in step,
and the provenance chain the product sells ("this meal came from your own consultation") is a list
of free-text strings, not a real reference.
**Why it matters.** Harmless with fixtures; the day writes exist, double-stored facts disagree,
and prose links cannot be queried or verified.
**If ignored.** "Which recommendation did this recipe honour?" becomes unanswerable in real data —
and that traceability is a selling point.
**What to do.** Pick one owning side per relationship and make `honours` a typed reference during
the F-14 modelling pass. _(Included in item 7.)_

#### F-18 · Primitive choices that will calcify

**Severity:** Later
**Where:** `recipe.ts` (`Ingredient.quantity` is free text, regex-parsed at `apps/web/lib/queries/meals.ts:33-44`) · `person.ts:39` (`shoppingDay` free text) · `meal.ts`/`step.ts` (calendar-day concepts typed as `Date` — a timezone hazard) · `step.ts:21` (`completedDays` is a counter, so _which_ days is unrecoverable) · `recipe.ts` (no language field in a bilingual product)

**What is true.** Several fields are typed loosely in ways that are convenient now and painful
after real data exists.
**Why it matters.** Model shape is cheap to change before the first record and expensive after.
**If ignored.** Lossy shopping-list maths, off-by-one-day bugs across timezones, and untranslatable
recipes — each surfacing after launch.
**What to do.** Sweep these in the same modelling pass as F-14/F-16/F-17; none needs more than an
hour of thought. _(Included in item 7.)_

### Area 6 · Configuration and environments

The three-list rule (zod schema + `docs/ENV.md` + `turbo.json`) was checked variable by variable
and **holds exactly**: 8/8 server variables agree across all three lists, the six public URL
overrides agree across their three homes, CI-only variables are correctly excluded, no `.env` file
was ever committed, and a full-history scan for credential patterns came back clean. Two nits:

#### F-19 · One raw environment read outside the documented exception, and one uncatalogued variable

**Severity:** Later
**Where:** `packages/services/src/shared/links.ts:87` (a raw `NODE_ENV` read — the file's documented exception covers six reads; it has seven, and `packages/services/AGENTS.md:46` states "six") · `NODE_ENV` itself is in the schema and `turbo.json:5` but has no `docs/ENV.md` row

**What is true.** As stated. Functionally harmless — Next.js inlines `NODE_ENV` anyway.
**Why it matters.** The env discipline is the repo's proudest mechanical rule; the one file with a
carve-out miscounts its own carve-out.
**If ignored.** Nothing breaks; the rule's credibility erodes slightly.
**What to do.** Fix the AGENTS.md sentence and add (or explicitly exempt) a `NODE_ENV` row. _(Minutes.)_

#### F-20 · A ghost variable, and an undocumented command

**Severity:** Later
**Where:** `docs/ENV.md:84` + `turbo.json:19` (`NEXT_PUBLIC_ANALYTICS_KEY` — read by nothing; Vercel Analytics needs no key) · `turbo.json:55` + all six apps (`env:pull` scripts exist, documented nowhere) · three pipeline scripts read `GITHUB_API_URL`, absent from ENV.md's table

**What is true.** As stated — each violates a stated rule ("a config key with no reader is
deleted"; ENV.md as the single catalogue).
**Why it matters / if ignored.** Small, but ENV.md is bus-factor insurance and should be exact.
**What to do.** Delete the analytics row and turbo entry (or move to "Not wired yet"); add a line
for `env:pull` and `GITHUB_API_URL`. _(Minutes.)_

### Area 7 · Build, CI and deployment

What is actually enforced before code reaches main: Prettier at commit time (Husky/lint-staged),
then one CI workflow running format-check, lint with a **zero-warning ceiling**, and typecheck
(`.github/workflows/quality.yaml:59-68`) — real and well built, with minimal permissions and a
shared build cache. Deploys are per-app Vercel projects that skip unaffected apps
(`apps/*/vercel.json`). What is _not_ enforced: everything else — see below. Rollback: nothing
written anywhere; in practice it would be Vercel's instant-rollback or a git revert, but nobody
has written down which (`pipeline/lanes/chore/CONTEXT.md:58` is the only rollback mention in the
repo).

#### F-21 · The pipeline does not know the support app exists

**Severity:** Important
**Where:** `pipeline/scripts/validate-spec.sh:27` and `pipeline/scripts/project-labels.sh:40` (`APPS=(web admin marketing docs demo packages)`) vs `.github/labels.yml:70`, `pipeline/_shared/github.md:89`, `.github/pull_request_template.md:10` (all include support); the templates at `pipeline/stages/03_define/CONTEXT.md:89` and `pipeline/intake/CONTEXT.md:94` also omit it

**What is true.** Both pipeline scripts carry the comment "must stay in step with
.github/labels.yml" and are not: a feature spec naming only the support app fails validation and
the labelling script dies.
**Why it matters.** This is a live contradiction inside the repo, and the first support-touching
feature run will hit it as a hard error.
**If ignored.** The first support feature fails at the Define stage with a confusing message.
**What to do.** Add `support` in the four places. _(Minutes — part of the drift batch, item 4.)_

#### F-22 · Documentation-only and pipeline-only changes skip the Quality checks entirely

**Severity:** Important
**Where:** `.github/workflows/quality.yaml:8-10` (`paths-ignore: pipeline/**, **/*.md`)

**What is true.** PRs touching only markdown or the pipeline folder never trigger the Quality
workflow. If branch protection _requires_ that check, such PRs can never merge (a deadlock); if it
doesn't, then a red Quality run blocks nothing anywhere (a hole). Which regime applies is invisible
from the repo (section 8). Markdown formatting is also genuinely unchecked on those PRs even
though the format command covers `.md` files.
**Why it matters.** Either failure mode undermines "merge only on green" — the repo cannot tell
you which one it has.
**If ignored.** Docs-only PRs silently stuck, or unchecked changes merging — discovered at an
inconvenient moment.
**What to do.** Check the branch-protection setting (item 3); the usual fix is to keep the
workflow running on all PRs and let its jobs no-op cheaply on doc-only diffs.

#### F-23 · The two human gates are enforced by nothing but good behaviour

**Severity:** Important
**Where:** `.github/pull_request_template.md:26-34` (the checkboxes) · no workflow reads PR bodies · `.claude/settings.json:30` pre-approves `gh pr merge` for agent sessions

**What is true.** The pipeline's two binding approvals — "Spec approved" and "Ready to merge" —
are checkboxes that no machinery checks. Enforcement is contract text instructing the agent to
stop; the agent tooling is simultaneously pre-approved to run the merge command without a prompt.
**Why it matters.** The gates are the owner's control points over an agent-driven process; today
they are honour-system.
**If ignored.** One over-eager agent session merges past an unticked box, and the gate's meaning
is gone.
**What to do.** Branch protection with required reviews (item 3), and/or a small workflow that
fails when a gate anchor is present and unticked; remove `gh pr merge` from the pre-approved list.
_(Hours.)_

#### F-24 · Rollback is undocumented

**Severity:** Later
**Where:** No runbook anywhere; closest are `pipeline/lanes/chore/CONTEXT.md:58,64`

**What is true / why it matters.** A bad deploy tonight would be handled by whoever notices,
improvising between Vercel's rollback button and a git revert — with six apps to reason about.
**If ignored.** Fine until the first bad deploy under time pressure; the signal is the first real
user.
**What to do.** A half-page runbook: where the button is, when to revert instead, what to check
after. _(An hour.)_

#### F-25 · A deleted automation is still documented as live, and its script is still on disk

**Severity:** Later
**Where:** `.claude/hooks/route-request.sh` (unreachable — its registration was removed in commit `41b59d6`) · `.claude/skills/pipeline/SKILL.md:14-17` (still tells the router to expect its output) · also `.claude/SKILLS.md:52-53` calls a label-_writing_ script "read-only"

**What is true.** As stated — dead code plus two stale descriptions, in the repo whose conventions
call unreachable code a review blocker.
**What to do.** Delete the script, fix the two sentences. _(Minutes — drift batch, item 4.)_

### Area 8 · Testing

#### F-26 · The commitment is test-driven development; the reality is zero tests

**Severity:** Important
**Where:** `CONVENTIONS.md:169-178` (the commitment: TDD for logic, 75% coverage floor on the database layer, harness "arrives with the first db adapter PR") · the entire tree (no test file, no runner config, no test dependency, no CI step — verified exhaustively) · `pipeline/stages/05_verify/CONTEXT.md:47` ("There is no automated test suite yet, so this human pass carries the quality load")

**What is true.** No test exists anywhere. No PR has yet violated the rule's letter (the rule
postdates the current services code, and the db-adapter trigger hasn't fired), but ~900 lines of
testable pure logic already exist: locale/header parsing (`packages/services/src/shared/i18n.ts` —
whose own comment advertises it as designed for testability), cross-app link building
(`shared/links.ts` — the file that 404s every cross-app link if it regresses), formatters, the
Result type, env parsing, and the three seam registries.
**Why it matters.** The plan bundles harness-bootstrapping into the first adapter PR — runner,
coverage gate, CI wiring _and_ the adapter at once. That is how coverage floors get waived "just
this once".
**If ignored.** The floor exists only on paper at the exact moment the layer it protects starts
holding health data.
**What to do.** Stand the harness up _now_, before the adapter (section 2, item 5): Vitest +
`@vitest/coverage-v8` in the catalogue, colocated `*.test.ts` files, a `test` task in
`turbo.json`, a Test step in `quality.yaml`, and the 75% threshold pre-wired for `src/db/**`.
First five test files cover nearly all existing logic. One decision attached: the "factory owns
the checks" hook should block local test runs too, or the rule forks (`CONVENTIONS.md:177`).
_(A day.)_

### Area 9 · Running it in production

#### F-27 · Nothing tells you when the product breaks

**Severity:** Important
**Where:** `docs/ENV.md:102-103` — "Until it exists, a production exception is invisible. This is the top unstarted ops item." Nothing reads `SENTRY_DSN`; no tracking SDK exists anywhere

**What is true.** A server-side crash shows the user a branded error page with a correlation id,
and writes a stack trace to hosting logs that expire unread — no alert, no aggregation. A
_client-side_ crash (in the browser) is recorded **nowhere at all** — there is no client tracker,
and browser errors never reach server logs. A whole-app outage has no uptime probe. The team
learns about failures when a human reports them. The one passive signal is Vercel Analytics
traffic curves in five apps.
**Why it matters.** "Invisible failure" here is literal: the pilot's fifteen practitioners are the
monitoring system.
**If ignored.** The first production incident is diagnosed from a user's screenshot of an error
id whose matching log line has already expired.
**What to do.** Item 6: error tracking via `instrumentation.ts` + the error boundaries' report
hook, an uptime check on the six origins, and a decision on who gets alerted. The variable names
are already reserved; this is a day of wiring. _(A day.)_

#### F-28 · No health checks — and no API surface at all

**Severity:** Later
**Where:** No `route.ts` exists in any app; `apps/web/app/api/.gitkeep` is the entire API; `packages/services/src/db/client.ts:25` mentions "the health endpoint" — which does not exist

**What is true.** There is nothing to probe and, today, little that needs probing — six
static/server-rendered sites with no backend. The seam docs already anticipate a health endpoint.
**Why it matters / if ignored.** The moment a database adapter registers, "is the app up _and can
it reach its database_" becomes a question nothing can answer. That moment is the signal.
**What to do.** Add a health route in the same PR as the first adapter. _(An hour, then.)_

#### F-29 · Missing safety nets: no `global-error.tsx`, no `instrumentation.ts`, anywhere

**Severity:** Later
**Where:** Verified absent in all six apps; ordinary `error.tsx` / `not-found.tsx` coverage is otherwise complete in all six

**What is true.** An exception in a root layout bypasses every existing error boundary and renders
Next.js's unstyled crash page. `instrumentation.ts` is also where both F-27's tracking and F-11's
adapter registration want to live — one file, three reasons.
**What to do.** Add both files per app as part of item 6. _(Included there.)_

### Area 10 · Security and data protection

#### F-30 · The admin console holds genuinely confidential content behind no access control in this repo

**Severity:** Blocker
**Where:** `apps/admin/lib/offer.ts:22-35` (a document headed "Confidentiel", containing the live equity negotiation: valuation, percentages, rates, accrued amounts, fallback positions) · `apps/admin/lib/questions.ts:57-176` (legal/strategy deliberations, including that public and signed pilot pricing contradict each other) · `apps/admin/lib/fixtures.ts:1033-1062` (the unpublished pilot terms) · no `middleware.ts` anywhere; `apps/admin/vercel.json` contains only a build-skip command; the repo's own words: "an unpublished address and noindex … is not an access control and is not treated as one" (`apps/docs/app/technical/decisions/page.mdx:46-48`)

**What is true.** All of this renders statically to anyone who has the admin URL. The protections
that exist (`apps/admin/app/robots.ts:6-11`, noindex metadata) stop search engines, not people.
The decision log says Vercel deployment protection is the interim answer — whether it is actually
switched on cannot be verified from the repo, and that single fact decides whether this is a live
exposure or a mitigated one.
**Why it matters.** This is not fixture data. It is the founder's live negotiating position and
the company's internal legal reasoning, one shared or guessed URL away.
**If ignored.** The equity negotiation and internal strategy are readable by exactly the people
they must not be readable by, silently.
**What to do.** Today: confirm deployment protection is ON for the admin project (and see F-31 for
docs). Then decide whether a negotiation document belongs in a deployed app at all — a private
doc would carry zero risk. Real operator authentication is already roadmapped and should not slip
past phase 3. _(Hours for the config; the auth is item 9.)_

#### F-31 · The docs site is fully crawlable and publishes what the public site deliberately withholds

**Severity:** Important
**Where:** `apps/docs/app/layout.tsx:23-29` (no robots rules, no noindex — the only app with neither) · `apps/docs/app/business/initiatives/page.mdx:19-31` (the pilot's exact pricing and dates, directly under the sentence "The public site publishes none of these figures") · `apps/docs/app/technical/decisions/page.mdx:46-48` (publishes the fact that the admin console lacks an access gate)

**What is true.** The docs site has no robots file, no noindex, no sitemap, no canonical URLs —
it is in the worst middle state: crawlable with no guidance — while hosting internal business
knowledge and a description of the security posture.
**Why it matters.** If the docs deployment is publicly reachable, a search engine can index the
confidential pilot terms and a signpost to the unprotected console.
**If ignored.** Internal knowledge surfaces in search results; the "unpublished figures" sentence
becomes false via a different app.
**What to do.** Decide (section 7): private (deployment protection + noindex, like admin) or
public (then move business/decision content out). Either is an hour; the middle is the only wrong
answer. _(Hours.)_

#### F-32 · No real authentication exists anywhere; the sign-in form ignores its own fields

**Severity:** Important
**Where:** `apps/web/lib/actions/session.ts:26-38` ("Nothing reads the email or the password … the role picker is the only field that decides anything") · `apps/web/lib/auth/development-session.ts` (a session is the presence of a role cookie) · `apps/web/lib/auth/session.ts:55-61` (silent fallback to the development provider)

**What is true.** Anyone can "sign in" to the product as either role by picking a radio button.
The gate itself is correctly shaped — one check in one layout
(`apps/web/app/[locale]/(app)/layout.tsx:26-31`) with a clean provider seam waiting for a real
implementation — and everything behind it is fake data.
**Why it matters.** Harmless today precisely because nothing real is behind it. It defines the
hard precondition: **no real personal data may enter this system in any form before a real
session provider replaces the development one.**
**If ignored.** The day someone seeds one real patient "just to test", the product is serving
special-category health data to anyone who clicks a radio button.
**What to do.** Item 9: pick the auth implementation for the already-decided magic-link shape and
register it into the existing seam. The silent dev fallback should also refuse to run in
production builds. _(A week or more; the refuse-in-prod guard is an hour now.)_

#### F-33 · A real, named practitioner appears in fixtures with invented professional activity

**Severity:** Important
**Where:** `apps/admin/lib/fixtures.ts:203-215` — "Dr Georges Mouton", "FunMedDev", Brussels; the file's own comment: "The rest of this record is invented activity against a real person's name"

**What is true.** One identifiable real person is shown in the admin console with fabricated
patient rosters, sign-in history and client counts (the code did responsibly give him an
unroutable example email). Fourteen other fixture practitioners use plausible real `.be` email
domains.
**Why it matters.** Fabricated professional activity attributed to a real, identifiable person is
personal data under GDPR and a reputational risk if the console leaks (see F-30) — the two
findings compound each other.
**If ignored.** Combined with F-30, an outsider could read an invented client list under a real
doctor's name.
**What to do.** Rename the record to a fictional person; switch fixture email domains to
`example.com`-style reserved domains. _(An hour.)_

#### F-34 · The data-protection groundwork that must precede the first real record is undecided

**Severity:** Important
**Where:** Decided and documented: EU database region, EU function regions, AI via gateway, pseudonymisation leaning (`apps/docs/app/technical/decisions/page.mdx:13-40`); undecided and absent: any processor register or DPA record (none for Vercel, Anthropic, Neon, or Resend — "processors named before they process" is promised at `apps/docs/app/business/initiatives/page.mdx:40`), any retention schedule, any deletion/anonymisation capability (no model support — F-16), the pseudonymisation decision itself (`decisions/page.mdx:33-36`)

**What is true.** The thinking is unusually good and unusually honest — but the concrete
obligations (signed processor agreements, retention, deletion capability, the
pseudonymise-before-AI decision) are all still open, and the genotype field already in the model
(`packages/services/src/db/models/person.ts:15-20`) is _genetic_ data, the most sensitive GDPR
category, which the open questions don't yet call out.
**Why it matters.** These aren't launch tasks; they are preconditions for the first stored record
— the repo's own quarter objective says "the data question answered before the first record
exists".
**If ignored.** Health data exists before its legal basis does; every later fix is remediation.
**What to do.** Section 7 lists the decisions; the owner-and-legal work is item 10. _(A few days
of owner time, zero engineering.)_

#### F-35 · No security headers anywhere

**Severity:** Later
**Where:** All six `apps/*/next.config.ts` files — no `headers()` in any; no middleware sets any; zero hits for CSP/HSTS/X-Frame-Options across the repo

**What is true.** No app sends a content-security policy (which limits what a compromised page can
do), strict-transport-security on custom domains, or clickjacking protection.
**Why it matters / if ignored.** Low risk for static content sites; real for the sign-in surface
and the console. The signal it can no longer wait: real authentication going live.
**What to do.** A shared headers block in the web and admin configs when auth lands. _(Hours, then.)_

#### F-36 · Dependency updates are entirely manual

**Severity:** Later
**Where:** No `dependabot.yml` or Renovate config; no audit step in `quality.yaml`

**What is true.** No automated vulnerability alerts or update PRs are configured in-repo (GitHub's
account-level alerts may exist — unverifiable, section 8). CI does use a frozen lockfile,
correctly.
**What to do.** Enable Dependabot alerts + a weekly update batch through the chore lane, once real
users exist. _(An hour.)_

### Area 11 · Scale

The shape is right: the public sites render fully static, the signed-in app is per-request
dynamic, the six-deployment split isolates blast radius and skips unaffected builds, and the
shared-package fan-out (a token change rebuilds all six apps) is the correct price of correctness.
Three real strains:

#### F-37 · The client-roster query pattern is an N+1 waiting for a real database

**Severity:** Important
**Where:** `apps/web/lib/queries/clients.ts:80-99` — one list query, then three queries per client, per page view

**What is true.** The practitioner's roster page issues 1 + 3×N reads (plan, steps, signals per
client). Free against in-memory fixtures; against a real database this is the first slow page in
the product, on the practitioner's most-visited screen. The seam's interface (F-09) currently
offers no batched alternative.
**Why it matters.** The pattern is being copied as the house style for new queries while it is
invisible-cost.
**If ignored.** The pilot's largest practice gets a roster page that makes ~46 database
round-trips per view.
**What to do.** Fold a batched read into the F-09 interface work; restructure this query when the
adapter lands. _(Part of item 8.)_

#### F-38 · Preview deployments cross-link to production unless six variables are set per environment

**Severity:** Important
**Where:** `packages/services/src/shared/links.ts:51-64,90-94` — any non-development build answers with production origins unless each `NEXT_PUBLIC_*_URL` override is set

**What is true.** A preview build of the marketing site links its header and footer to
_production_ web/support/docs. The pipeline's whole review model is stakeholders clicking through
preview URLs.
**Why it matters.** A reviewer on a preview silently walks onto production mid-review — confusing
at best, wrong-data-shown at worst.
**If ignored.** Every design review carries a trapdoor into production.
**What to do.** Set the six overrides in each Vercel project's preview scope (Vercel exposes the
deployment URL as an env variable that can feed this), or teach `links.ts` to detect preview
hosts. _(Hours, config-side.)_

#### F-39 · Every public canonical URL currently advertises a placeholder personal domain

**Severity:** Important
**Where:** `packages/services/src/shared/links.ts:29` — `rootDomain = "jamienisbet.com"`; flows into every canonical URL, hreflang alternate and sitemap on the public sites (`apps/marketing/lib/metadata.ts:54-61`, `apps/marketing/app/sitemap.ts:25-29`, support equivalents)

**What is true.** The single-domain catalogue — a genuinely good design — currently catalogues a
personal placeholder domain, while the brand domain (`remiai.be`, linked from `README.md:74`)
appears only in contact-email content (F-03).
**Why it matters.** If the public sites are live and indexed, search engines are being told the
canonical home of Remi AI is a personal domain — SEO equity accrues to the wrong place.
**If ignored.** The longer it runs, the more indexed URLs point at the placeholder; the migration
is one edit, but the re-indexing isn't.
**What to do.** Decide the real domain (section 7) and change one line — that being one line is
the payoff of the design. _(Minutes, after the decision.)_

### Area 12 · The user-facing surface

Locale structure is deliberate and exactly consistent between the routing files and the catalogue
(web/marketing/support carry a language prefix; admin/docs/demo do not — `links.ts:73-80` matches
the filesystem). English/French parity is compiler-enforced. Marketing's SEO surface (metadata,
canonical/hreflang, sitemap, robots, OG image) is complete; accessibility foundations (landmarks,
current-page marking, form-field wiring, focus rings) are above the framework baseline.

#### F-40 · No skip link in any app — the targets already exist

**Severity:** Important
**Where:** Zero `href="#…"` anchors across all apps and `packages/ui`; web and admin even ship `<main id="content">` (`apps/web/app/[locale]/(app)/layout.tsx:56`, `apps/admin/app/(admin)/layout.tsx:15`)

**What is true.** A keyboard or screen-reader user must tab through the full header and sidebar on
every page of every app; the skip-to-content link (the standard first-tab-stop escape hatch) is
missing everywhere, despite two apps already having the anchor target it would point to.
**Why it matters.** It is the single cheapest accessibility fix with the broadest daily impact,
and a health product sold partly on care quality should clear the accessibility floor.
**If ignored.** Every keyboard user pays a toll on every page; it also fails WCAG 2.4.1.
**What to do.** One small component in `packages/ui`, rendered first in each shell. _(Hours.)_

#### F-41 · Public-site polish gaps: a promised social image that doesn't exist, and weak-form noindex

**Severity:** Later
**Where:** `apps/support/lib/metadata.ts:68-72` (declares a large social-card image; no image exists — marketing's own comment at `lib/metadata.ts:9` warns about exactly this) · web and demo have noindex metadata but no `robots.ts` file, the weaker form — admin's comment explains why (`apps/admin/app/robots.ts:4-8`)

**What is true / what to do.** Support links shared on social render imageless; add an
`opengraph-image.tsx` like marketing's. Give web and demo the same two-line robots file admin has.
The signal it can't wait: the marketing push for the pilot. _(Hours.)_

#### F-42 · Language attributes and baked-in English strings undercut the French surfaces

**Severity:** Later
**Where:** `apps/admin/app/layout.tsx:38` (`lang="en"` over deliberately-French Company pages — screen readers will read French prose with English pronunciation) · `packages/ui/src/components/sheet.tsx:68` and `dialog.tsx:52` (hardcoded "Close" reaching French screens) · `apps/marketing/components/contact-form.tsx:97-113` (the consent error message is not programmatically linked to its checkbox)

**What is true / what to do.** Three small accessibility/i18n leaks. A `lang="fr"` on the admin
Company wrapper, a label prop on the two primitives, and an `aria-describedby` on the consent
error. _(Hours.)_

#### F-43 · Unknown-language URLs get the unstyled default 404

**Severity:** Later
**Where:** web, marketing and support have `not-found.tsx` only _inside_ the `[locale]` segment; a request like `/xx/anything` 404s outside it and renders Next.js's default page. Admin and demo place theirs at the app root, correctly. No app has `global-error.tsx` (also F-29)

**What is true / what to do.** Add a root-level not-found page to the three locale apps. _(An hour.)_

### Area 13 · Documentation honesty

The mechanical hygiene is excellent: all 27 relative links across 32 documents resolve; the
pipeline scripts match their documentation precisely; the env discipline is exactly as documented;
several "not built yet" admissions are models of honest docs. But the repo's strongest claim —
"each rule lives in exactly one place … if two files say the same thing, one of them is wrong"
(`README.md:72`) — fails its own test:

#### F-44 · Four documents instruct agents that the business pages are unwritten; they were written a week ago

**Severity:** Important
**Where:** `pipeline/stages/01_scope/CONTEXT.md:42-44`, `pipeline/intake/CONTEXT.md:17-19`, `pipeline/_shared/github.md:93-95`, `.github/labels.yml:55` — all say the roles/initiatives pages are "stubs" or "aren't written yet"; the pages are substantive (`apps/docs/app/business/roles/page.mdx`, 81 lines; `initiatives/page.mdx`, 68 lines, commit `7f9d066`); `pipeline/_shared/knowledge-map.md:21` correctly says "Both are written"

**What is true.** One fact, five copies, four stale.
**Why it matters.** These are instructions to the Scope stage — the pipeline's very first step.
An agent following its own contract will ignore the real product knowledge and improvise.
**If ignored.** The first scoping run works from the assumption the product definition doesn't
exist.
**What to do.** Fix the four sentences. _(Minutes — drift batch, item 4.)_

#### F-45 · The process documentation describes practices that have never happened

**Severity:** Important
**Where:** `pipeline/runs/` and `pipeline/intake/` are empty; `git log --all` shows no run has ever been created — while 29 PRs of real feature work merged outside the pipeline · `CONVENTIONS.md:206` mandates squash-merge; `git log --merges` shows every PR (#8–#29) landed as an ordinary merge commit — not one squash

**What is true.** The pipeline and the squash rule are both written in the present tense
("How work gets done here", `CLAUDE.md:82-87`) and neither has ever been exercised.
**Why it matters.** For an owner reading the docs to understand how their product is built, the
described process and the actual process have never yet been the same thing. The pipeline may
genuinely be the plan for what comes next — but then the docs should say so.
**If ignored.** The audit-grade documentation trust this repo trades on erodes; nobody can tell
which other present-tense claims are aspirations.
**What to do.** Either run the next feature through the pipeline (its machinery all checks out —
this audit verified the scripts) and configure squash-merge in GitHub, or reword both claims as
intent. _(The GitHub setting is part of item 3.)_

#### F-46 · The same rule is restated in three to six places, and five sets have already drifted

**Severity:** Important
**Where:** Eleven duplicated rule-sets catalogued in this audit; the five already drifted: the support vocabulary (F-21), the "stubs" claims (F-44), the packages docs page (below), `apps/marketing/AGENTS.md:47-48` (documents a `urls.ts` file deleted when links were centralised — the same file's lines 32-34 state the new truth), and the command lists (`apps/docs/app/technical/development/page.mdx:8` omits `support:dev`; `pipeline/_shared/knowledge-map.md:30` says "the five apps" — there are six)

**What is true.** The single-home principle is real at the mechanical level (env lists, scripts)
and not real at the prose level: the three-edits env rule appears in six places, the
factory-owns-checks table in six, the entrypoint catalogue in four (two of which omit the `/db`
entrypoint — `CONVENTIONS.md:75-77`, `eslint.config.ts:172`), the seam table verbatim twice.
All currently-agreeing copies are future drift.
**Why it matters.** Every restatement is a fork waiting to happen — five already have, in a repo
whose docs are load-bearing (agents execute them).
**If ignored.** The drift rate compounds with each feature; trust in any single document drops.
**What to do.** In the drift batch: fix the five stale sets, then thin the worst duplications to
pointers (the `_shared/conventions.md` redirect file is the in-repo model of how). _(Half a day.)_

#### F-47 · The technical docs page for the packages describes a structure two versions old

**Severity:** Important
**Where:** `apps/docs/app/technical/packages/page.mdx:7-13` ("Two build entries" — there are four: `packages/ui/tsup.config.ts:4-11`) and `:35` (says `/shared` contains "validation" — it doesn't; misses what it does contain) — and `pipeline/_shared/knowledge-map.md:41` routes the Build stage to this page

**What is true.** The page the Build stage is told to read as its map of the design system is
stale on the package's basic shape; the accurate description exists in
`packages/ui/AGENTS.md:28-37`.
**Why it matters.** This isn't passive documentation — the pipeline feeds it to the agent doing
the building.
**If ignored.** Build-stage work starts from a wrong map of the very package it modifies.
**What to do.** Rewrite the page from the AGENTS files, or reduce it to pointers at them. _(An hour.)_

#### F-48 · Small drift residue, one list

**Severity:** Later
**Where:** `eslint.config.ts:201` (error message points at "CONVENTIONS.md → apps/demo", a section that doesn't exist — the rules live in `apps/demo/AGENTS.md`) · `CONVENTIONS.md:1` + `pipeline/CONTEXT.md:50,54` (CONVENTIONS is "Layer 3" in three places and Layer 0 in one) · `CONVENTIONS.md:11` says ESLint "enforces" arrow functions while the rule is a warning — enforcement is real but indirect, via CI's zero-warning ceiling (`eslint.config.ts:90-97`, `quality.yaml:64-65`) · commit-format compliance is good but not clean (8 non-conforming of the last 200; undocumented scoped forms like `refactor(web):`)

**What is true / what to do.** Four small inconsistencies, none load-bearing; sweep them with the
drift batch. _(Minutes each.)_

## 7 · Decisions the owner needs to make

Open questions, as questions — with the realistic options, costs, a recommendation, and how long
each can wait.

**D-1 · Is Vercel deployment protection on for admin — and is the docs site public or private?**
Options: (a) protection on both, business content stays; (b) protection on admin, docs goes
public with the business/decision pages moved out; (c) status quo. Cost of (a)/(b): minutes of
configuration or an afternoon of content moves; cost of (c): F-30/F-31 remain live. _Recommendation:
(a) today, then decide (b) at leisure — and take the equity-offer page out of the deployed app
regardless; a negotiation document gains nothing from being a website._ **Can wait: not at all.**

**D-2 · Which database vendor?** The docs lean Neon (EU serverless Postgres) with Supabase as the
likely eventual home. Options: Neon now / Supabase now / defer further. Neon is the lighter
commitment consistent with the decided EU posture; Supabase bundles auth+storage (which would also
answer parts of D-3) but is a bigger commitment. Deferring further costs nothing _except_ that
items 7–8 of the checklist are blocked on it. _Recommendation: decide within the month; either
named option is fine — the seam genuinely makes this cheap to be wrong about._ **Can wait: until
the first persistence feature — which is the next real milestone.**

**D-3 · Which auth implementation for the decided magic-link shape?** Options: Auth.js
(self-hosted, free, more wiring), a hosted provider (Clerk et al. — fastest, per-user cost, EU
data questions), or the database vendor's auth if D-2 lands on Supabase. Locks in: session
mechanics, the 2FA path for practitioners, part of the GDPR processor list. _Recommendation:
decide together with D-2 — the pairing changes the answer._ **Can wait: until real users; but the
dev-session must refuse to run in production before any real data exists (F-32).**

**D-4 · How does billing actually happen on 1 September?** Options: a payment provider (Stripe
being the obvious one — real integration work, weeks), or manual invoicing for the fifteen pilot
practitioners (hours of admin per month, zero code). _Recommendation: manual invoicing for the
pilot; decide the provider when self-serve signup is scoped._ **Can wait: the decision cannot
(three weeks); the integration can.**

**D-5 · Is personal data pseudonymised before it reaches the AI provider?** The docs lean yes;
it costs a mapping layer and some prompt quality, and buys a materially smaller GDPR surface with
a US-owned processor. Also in this decision: the DPAs/processor register (Vercel, Anthropic,
Neon/Supabase, Resend) the docs promise "before they process". _Recommendation: yes, and do the
processor paperwork as item 10 — it is owner-and-legal work that gates nothing else._ **Can wait:
until the first AI feature touches real data — but not one day past.**

**D-6 · Which domain is the real one?** `links.ts` says `jamienisbet.com`; the brand and the
contact addresses say `remiai.be`. The design makes the switch one line (F-39) plus DNS/Vercel
work; every week of delay adds wrongly-indexed URLs. _Recommendation: consolidate on the brand
domain before any marketing push._ **Can wait: until the sites are meant to be found.**

**D-7 · Does the delivery pipeline start now, or get relabelled as intent?** The machinery
verifies clean (scripts, labels, templates — this audit checked), but 29 PRs happened outside it
and the gates are unenforced (F-23, F-45). Options: run the next feature through it and add the
enforcement; or keep the fast informal loop and mark the pipeline docs as the plan. Both are
honest; the middle isn't. _Recommendation: run the next real feature through it as its shakedown —
it was built for exactly the phase now starting._ **Can wait: until the next feature — i.e. not
long.**

**D-8 · Accept or annotate the pre-built-seam exception to the lean rules?** The unused seam
entrypoints and ~20 dead exports (F-01) technically violate "no export without a consumer".
Options: delete the genuinely dead ones and write the seam exception down; or enforce the rule
literally and trim the seams too. _Recommendation: the former — the seams are the architecture's
best idea; the tooltip and variant exports are just dead._ **Can wait: the next chore pass.**

## 8 · Could not check

Everything below lives outside this repository. None of it could be verified from inside, and
several findings above hinge on it.

- **Vercel deployment protection on the admin and docs projects** — the single fact that decides
  whether F-30/F-31 are live exposures or mitigated ones. Check: Vercel → each project →
  Settings → Deployment Protection.
- **Branch protection on `main`** — whether the Quality check is required (decides F-22's
  deadlock-or-hole), whether squash-merge is configured/enforced (F-45), who can merge, and
  whether direct pushes to main are allowed. Check: GitHub → Settings → Branches.
- **All other Vercel project state**: the six projects' existence and root directories, EU
  function-region settings (decided in docs, unverifiable here), environment-variable values and
  preview-scope overrides (F-38), whether Vercel Analytics is enabled per project (the code
  no-ops if not), log retention, and any log drains or observability add-ons.
- **Whether the marketing site is deployed and receiving real traffic** — F-06's practical
  severity depends on it.
- **GitHub Actions secrets/variables** (`TURBO_TOKEN`, `TURBO_TEAM`) and whether the label set in
  `.github/labels.yml` was ever created on the live repo (its comment says setup is manual).
- **GitHub account-level security features** — Dependabot alerts, secret-scanning push
  protection (F-36).
- **Any signed processor agreements** (Vercel, Anthropic, Neon, Resend) — no repo evidence either
  way (F-34).
- **Any external uptime monitoring** configured outside the repo (F-27).
- **Whether the globally-provided agent skills named by the Design stage** (`accessibility`,
  `dummy-dataset`, `webapp-testing`) exist in the sessions that run it — they are not in the repo.
- **Whether pinned versions are the latest published** — no registry queries were made; all
  version observations come from the lockfile and version strings.
- **Anything requiring execution** — builds, real bundle sizes, which routes Next.js actually
  marks static — running checks is deliberately blocked in agent sessions; every rendering and
  bundle conclusion above was derived by reading source.
