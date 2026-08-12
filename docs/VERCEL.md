# Vercel — the hosting playbook

How the Vercel Pro subscription is used, so the setup is never trapped in one person's head. Six
apps are six Vercel projects on one Pro team with **one paid seat**. The budget stance is a rule,
not a hope: **the monthly bill is the platform fee (plus VAT) and nothing else** — every metered
resource fits inside what the fee already includes, and a hard backstop enforces it.

## The envelope

The $20/month platform fee includes:

- **1 deploying seat** — additional Owner/Member seats are $20/month each; Viewer seats are free
  and unlimited.
- **$20/month usage credit** — resets monthly, never rolls over.
- **1 TB fast data transfer** and **10M edge requests** per month, before anything touches the
  credit.

Billing order: included allotments first, then the credit, then on-demand charges. "No extra
spend" therefore means: stay inside the allotments and the credit. Everything in this file serves
that constraint.

**The envelope is team-wide, not per project.** The credit, the allotments and the spend backstop
cover every project on the team — including the non-remi projects that share it. When the usage
page shows the credit draining, check *which* project is draining it before assuming remi.

## Builds are free — keep them free

Vercel bills builds only on the larger machine tiers or when builds skip the queue. Both of those
are **on by default for new Pro teams**, so the free configuration is a deliberate choice:

| Setting                       | Where                          | Value        | Why                                                            |
| ----------------------------- | ------------------------------ | ------------ | -------------------------------------------------------------- |
| Build machine                 | Team → Build and Deployment    | **Standard** | Elastic is the default and bills $0.0035/CPU-minute            |
| On-demand concurrent builds   | Team + each project            | **Off**      | On (the default) bills every build; off gives 3 free slots     |
| Prioritize production builds  | Each project → Build settings  | **On**       | Free; production never waits behind a queue of previews        |

With on-demand concurrency off, the team has **3 concurrent build slots** and further builds
queue. That is enough because the repo already minimises builds:

- `apps/*/vercel.json` runs `turbo-ignore` per project, so a push only builds the apps it
  touches. Most pushes touch one app.
- A change to `packages/ui` or `packages/services` rebuilds all six apps. That fan-out is the
  accepted price of correctness (audit, Area 11) — six queued Standard builds cost nothing but
  minutes.
- The Turborepo remote cache is **free on Pro** (1 TB/month fair use), already enabled in
  `turbo.json`, and already shared with CI via `TURBO_TOKEN` / `TURBO_TEAM`.

## The hard backstop — spend management

Enable Spend Management on the team (Settings → Billing) the day the plan starts:

- **Spend amount: $5**, with **Pause production deployment: enabled** and notifications on. The
  amount only counts on-demand spend *beyond* the credit, so $5 is not a working budget — it is a
  tripwire that should never fire.
- Checks run every few minutes, not continuously — a runaway can overshoot the amount slightly
  before the pause lands.
- The pause takes down **production for every project on the team** (503), and projects must be
  unpaused one by one. That blast radius is accepted: it is what "capped" means.

## Where the credit can go

Current exposure is close to zero — roughly 110 of the ~120 routes across the six apps prerender
at build time. What can spend the credit, and the rule for each:

| Dimension           | Today                                                          | Rule                                                                                                                       |
| ------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Functions           | Only `apps/web`'s signed-in routes render per request           | Keep fluid compute on (default). $20 buys ~100 active-CPU hours — vast headroom at pilot traffic. Future crons bill here too |
| Image optimization  | Zero — no `next/image` anywhere                                 | Before the first `<Image>`: set `images.qualities: [75]` and `minimumCacheTTL` ≥ 31 days in that app; `unoptimized` on docs/demo |
| ISR                 | None — pages are fully static or fully dynamic                  | Keep it that way. A `revalidate` is a recurring cost and needs a reason in the PR                                            |
| Web analytics       | `@vercel/analytics` wired in five apps                          | Pro includes **zero** events ($0.03 per 1K, from the credit). Fine at pilot traffic; a bot storm is the risk — see firewall  |
| Edge requests / FDT | Trivial                                                         | 10M requests / 1 TB dwarf current traffic; bots are the only realistic consumer                                              |

Two standing mitigations:

- **Firewall bot filtering is free** — enable the managed bot-protection rules on the three
  public, indexable sites (marketing, docs, support) so crawler junk never counts against
  requests or analytics events.
- **The AI Gateway is not inside the envelope.** `AI_GATEWAY_API_KEY` routes model traffic
  through Vercel's invoice, outside the fee-plus-credit frame this file defends. If the cap
  matters, wire AI through `ANTHROPIC_API_KEY` directly; routing through the gateway is a
  deliberate budget decision, not a default.

## Function regions

The decisions page pins compute to the EU; nothing configures it yet, and unpinned functions
deploy to `iad1` (US East). The fix is one line in `apps/web/vercel.json` — the only app with
per-request compute:

```json
"regions": ["fra1"]
```

EU compute costs ~40% more per active-CPU hour than `iad1` ($0.184 vs $0.128). At this scale the
residency story wins; land the line when `apps/web` first touches real data.

## Never enable

Each of these either bills per build/event or is a monthly add-on. All of them defeat the cap:

- **Elastic build machines** and **on-demand concurrent builds** — see above; the two defaults
  to turn off.
- **Speed Insights** ($10/month/project), **Web Analytics Plus** ($10/month), **Observability
  Plus** ($1.20/M events) — the built-in logs and analytics tiers are the chosen observability
  suite (decisions page); the paid tiers wait until something demands them.
- **Advanced Deployment Protection** ($150/month) — already rejected for the admin exposure
  problem (REMI-001); real operator auth is the plan.
- **SAML** ($300), **Flags Explorer** ($250), **Preview Deployment Suffix** ($100), **Static
  IPs** ($100/project), **Microfrontends** ($250/project — the six apps stay six plain projects).
- **Marketplace integrations** (storage, databases, etc.) — billed monthly *outside* both the
  credit and the spend cap. Vendors arrive through the `@remi/services` seams on their own
  accounts, never through the Vercel Marketplace.

## One seat is not a bottleneck

The paid seat holds dashboard and configuration rights. Everything else the pipeline needs is
free:

- **Git integration deploys previews and production for every branch push** — agents and CI never
  need a seat. The Build and Verify stages read the preview exactly as today.
- **Viewer seats are free and unlimited** — reviewers see deployments, comment on previews and
  read analytics. Previews stay behind Vercel authentication (standard protection, free), which
  viewers pass.
- **Instant rollback** is included per project — the rollback runbook (REMI-016) should name it.

## Housekeeping

Found while writing this file; each is a small correction:

- The `remi-ai` Vercel project is set to **Node 24.x**; the repo pins `"node": "22.x"` in every
  `package.json`. Align the six projects' Node setting to 22.x so Vercel builds what CI checks.
- `apps/docs` runs Pagefind as a `postbuild` writing into `public/` — confirm the index is
  actually served on the deployed docs site, since `public/` is normally collected before
  `postbuild` runs.
- Check the team's other projects once after upgrade: anything with Elastic machines, paid
  add-ons or real traffic shares this envelope.
