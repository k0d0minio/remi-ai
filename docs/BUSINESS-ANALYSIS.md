# REMI — business analysis for the incoming CTO

_Prepared 4 August 2026. Written for a technical reader with no business background: every business
term is explained the first time it appears. Sources are linked throughout; anything that could not
be verified is flagged. Figures marked ⚠ are estimates or come from sources of dubious quality._

---

## 1. The short version

**REMI is a real market opportunity with an honest wedge, wrapped in a very early, very fragile
company — and the risk you are being asked to absorb is large relative to the equity on offer.**

Five findings drive everything else in this document:

1. **The product does not exist yet.** The repo contains a polished marketing site and a
   well-designed front-end — but no database, no authentication, no payments, no tests, and no AI
   actually wired up. Every screen renders fixture (fake) data. Your 12-month commitment to "a
   working product in the hands of the FunMedDev pilot" is, in effect, a commitment to build the
   entire back half of a health-data platform, part-time.
2. **The market is genuinely underserved where REMI sits, but it is small.** No EU-native platform
   combines practice management, a client app, secure messaging and functional-medicine workflow in
   French/Dutch with GDPR-first posture. But at €24.50/practitioner/month, Belgium's entire
   dietitian population is worth at most ~€2.5M/year in revenue, and the whole European category
   ceiling is roughly €25–40M/year — shared with established, funded competitors. This can be a
   good business; it is unlikely to be a venture-scale one without expansion or a higher price.
3. **The €2.5M valuation the founders quoted is at the very top of what is defensible.** Standard
   pre-revenue valuation methods put REMI at roughly €1M–€3M _if raising from investors_; on an
   asset-sale basis it is worth close to nothing today. €2.5M assumes a complete team and a working
   product — neither exists without you.
4. **The regulatory path is navigable but not optional.** GDPR health-data compliance
   (~€30–60k in year one) is a precondition to launch, the Belgian regulator has named health data
   a 2026–28 audit priority, and one product decision — whether protocols ever address named
   diseases — determines whether REMI stays a lightweight SaaS or becomes a medical device
   (12–18 months and six figures of certification).
5. **The deal terms need work, and several claimed facts are unverified.** 5% for an unpaid
   2-day/week founding CTO is below cofounder norms; your 10% counter is reasonable and arguably
   still modest. The "€50,000 invested for 50%" and the pilot's commercial terms exist nowhere in
   verifiable form. Section 8 lists what must be confirmed in writing before signing.

**Bottom line:** this is a plausible bet on a niche you could realistically win, with a
distribution channel (FunMedDev) that has a proven analogue. But go in with eyes open: the base
case for companies like this is 5–9 years to meaningful scale, most never get there, and right now
the entire technical execution risk is priced onto you at 5–10% of the company.

---

## 2. What REMI actually is

**The pitch.** REMI ("Reprise En Main Individualisée") is a _wellness copilot_ that extends a
health practitioner's guidance between consultations. A practitioner (nutritionist, dietitian,
functional-medicine doctor) sets recommendations; REMI turns them into daily meals, habits and
small steps for the client, and feeds progress signals back. Two sides, one loop. Clients only
arrive through a practitioner — there is no self-serve consumer product.

**The safety thesis** (and the smartest thing in the design): the _therapeutic frame_. The
practitioner defines hard boundaries (excluded foods, emphasised foods, precepts) and REMI may only
generate content inside that frame. REMI holds no clinical opinion of its own, never diagnoses,
never treats. This is simultaneously the product's differentiator and — as Section 7 shows — its
regulatory survival strategy.

**The people.**

| Who               | Role                               | Notes                                                                                                                                                         |
| ----------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Morgane Paquet    | Co-founder, product & nutrition    | Training in naturopathy and nutritherapy                                                                                                                      |
| Arnaud Ruelle     | Co-founder, strategy & development | Entrepreneurial background                                                                                                                                    |
| Dr Georges Mouton | Partner (not founder)              | Founder of the FunMedDev clinic (Liège + London), a European reference in functional medicine; signed partnership; FunMedDev patients among first pilot users |
| You               | Proposed founding CTO              | ~2 days/week, unpaid until funding; author of the entire codebase to date                                                                                     |

**The go-to-market.** A hand-picked founding pilot of 15 practitioners. Per the pilot agreement
rendered in the admin app: enrolment 1 July – 31 August 2026, free during the window, then
**€24.50/practitioner/month** (ex VAT) from 1 September 2026, month-to-month, price held for the
founding cohort's first year. ⚠ **Important:** these terms exist only as _fixture data_ (fake demo
content) in the admin app; the public site explicitly says pricing is not decided. Whether 15 real
practitioners have actually signed anything is unverified — see Section 8.

**Revenue reality check.** If all 15 convert on 1 September: 15 × €24.50 × 12 ≈ **€4,410 of ARR**.
(_ARR = annual recurring revenue, the yearly value of active subscriptions — the standard measure
of a subscription business's size._)

### The technical state, honestly

You know this better than anyone, but it belongs in the business analysis because it _is_ the
business risk: the company's only asset besides the FunMedDev relationship is a codebase that is
all front, no back.

- **Built and good:** six Next.js apps, a real design system, a disciplined domain model
  (consultation → recommendation → plan → steps/meals → progress signals, with a
  practitioner-confirmation gate on everything), a bilingual production-quality marketing site,
  and an unusually mature delivery pipeline.
- **Absent:** database (interface defined, zero adapters, never called), auth (a dev cookie
  stand-in), email (logs to console — **the pilot application form on the marketing site does not
  actually send anything**), payments (nothing), AI (model roles configured; `generateText` is
  never called by any app), tests (none), error tracking (none).
- **Consequence:** nothing has ever processed real user data. "Working product in pilot hands
  within 12 months" means building persistence, auth, GDPR-grade security, messaging, plan
  publishing, billing and the first AI features — at ~2 days/week.

---

## 3. Business vocabulary you need for the rest of this document

- **TAM / SAM / SOM** — Total / Serviceable / Obtainable market. TAM: everyone who could
  conceivably buy. SAM: the slice you can realistically serve. SOM: what you can plausibly win in
  a few years. Investors mostly care whether SOM supports a real company.
- **ARR / MRR** — annual / monthly recurring revenue.
- **Churn** — the % of customers who cancel per month. Small-business SaaS typically loses
  3–8%/month; at 5%/month you lose about half your customers every year, so growth must first
  refill a leaking bucket.
- **LTV** — lifetime value: average revenue per customer before they churn (≈ monthly price ÷
  monthly churn). At €24.50 and 3% monthly churn, LTV ≈ €800 per practitioner.
- **CAC** — customer acquisition cost. A healthy SaaS keeps LTV ≥ 3× CAC, which at €800 LTV means
  acquiring practitioners must cost well under ~€270 each — why a warm channel (FunMedDev) matters
  enormously at this price point.
- **Pre-money / post-money valuation** — company value before / after new money goes in. "5% at a
  €2.5M valuation" means your stake is _notionally_ worth €125k — on paper, illiquid, and worth €0
  unless the company eventually sells or IPOs.
- **Vesting / cliff** — equity earned over time (typically 4 years); a 12-month cliff means leaving
  before month 12 = nothing.
- **Fully diluted** — your % counting all shares that could ever exist (option pools, convertibles),
  the only honest way to state ownership.
- **Dilution** — every funding round mints new shares; a 20% round shrinks your 10% to 8%. Expect
  two or three rounds before any exit.

---

## 4. The market

### 4.1 Supply side — who would pay

The buyer is the practitioner. Verified counts
([Belgian FOD health-workforce statistics 2024](https://www.health.belgium.be), [DREES/AFDN](https://www.afdn.org/documentation/infographie-drees-2024-nombre-dieteticiens-france), [HCPC](https://www.hcpc-uk.org/about-us/insights-and-data/the-register/), [NVD](https://nvdietist.nl/), [EFAD](https://www.efad.org/membership/)):

| Market       | Licensed/active dietitians          | Notes                                                                                                                                 |
| ------------ | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Belgium      | **8,442** licensed residents (2024) | Growing ~5%/yr; 91% female; half under 35 — young, digital-native. Realistically ~3,000–4,000 in active private/ambulatory practice ⚠ |
| France       | 17,369 active (2024)                | Largest francophone adjacency                                                                                                         |
| Netherlands  | ~3,500 working                      | Dutch-locale flag already in REMI's roadmap                                                                                           |
| Germany      | ~14,000 ⚠                           | Fragmented titles                                                                                                                     |
| UK           | ~12,800 registered                  | Mostly NHS-employed                                                                                                                   |
| Europe total | **~70,000–100,000**                 | Derived from EFAD coverage                                                                                                            |

The functional-medicine / health-coach tier REMI also targets is real but **uncountable and
unregulated** — IFM-certified practitioners number only in the low thousands _worldwide_ ⚠. In
Belgium the credentialed pool is dietitians; the FM tier is a long tail of at most a few thousand
across Benelux.

**Solo-practice economics:** a Belgian dietitian grosses very roughly €35k/year (consults at
€30–80). €294/year of software is under 1% of revenue — affordable, but these are price-sensitive
micro-businesses that will compare against Nutrium's €15–19/month annual plans.

### 4.2 Demand side — why now (genuinely favourable)

- **Chronic disease is the decade's health story.** 59% of adults in the WHO European Region are
  overweight or obese ([WHO 2022](https://www.who.int/europe/publications/i/item/9789289057738));
  Belgium: 49.7% overweight, 17% obese (Sciensano 2023–24). Adherence to long-term therapy is ~50%
  — exactly the "between two consultations" gap REMI claims.
- **Belgian policy is actively expanding reimbursed dietetics**: new/expanded RIZIV trajectories for
  childhood obesity (10 free sessions, Dec 2023), eating disorders (up to 15 sessions/yr, Feb 2024),
  and diabetes. More reimbursed sessions → more clients per practitioner → more need for tooling.
- **The GLP-1 twist favours REMI's buyers**: Belgium _refused_ to reimburse Wegovy for obesity
  (June 2026), explicitly steering obesity policy toward lifestyle and dietetic care; meanwhile
  clinical guidance says GLP-1 patients need structured nutrition support most aren't getting.

### 4.3 Market size — the honest arithmetic

Ignore the "$1B dietitian software market" reports; they are content-mill fiction (at REMI-like
prices, 100% of the _world's_ ~520,000 dietitians would generate only ~€170M/year). Bottom-up:

| Level                                         | Seats       | ARR at €294/seat/yr    |
| --------------------------------------------- | ----------- | ---------------------- |
| Belgium TAM (every licensed dietitian)        | 8,442       | **€2.5M**              |
| Belgium SAM (private practice + coach tier) ⚠ | 4,000–6,000 | €1.2–1.8M              |
| Belgium SOM, ~3 years (5–10% of SAM)          | 200–500     | **€59–147k**           |
| Europe TAM (dietitians)                       | ~75,000     | ~€22M                  |
| Europe category ceiling incl. coach/FM tier ⚠ | —           | **€25–40M/yr, shared** |

**What this means:** Belgium alone supports a founder-profitable niche product, not a venture
outcome. €1M ARR requires ~3,400 paying practitioners — more than every private-practice dietitian
in Belgium. The growth story requires (a) France + Netherlands expansion (languages REMI already
speaks or plans), and/or (b) higher revenue per practitioner (clinic/multi-seat plans, client-side
monetisation, AI add-ons — incumbents charge $35/month for an AI scribe alone).

---

## 5. Competition

The category is served, funded, and consolidating — but not where REMI stands.

| Competitor                                        | Price (solo/mo)              | Scale                                             | Funding                         | Relevance                                                                     |
| ------------------------------------------------- | ---------------------------- | ------------------------------------------------- | ------------------------------- | ----------------------------------------------------------------------------- |
| [Practice Better](https://practicebetter.io) (CA) | $35–99                       | 10,000+ practitioners (2023)                      | ~$41M                           | Closest feature analogue incl. FM positioning; English-only, US/CA compliance |
| [Healthie](https://gethealthie.com) (US)          | $19–129                      | 25,000+ clinicians                                | ~$40M                           | API-first EHR; US insurance-centric                                           |
| [Nutrium](https://nutrium.com) (PT)               | **$15–49**                   | claims 80k+ professionals (registered ≠ paying ⚠) | ~$20M, Series A Sep 2025        | The EU price anchor and most direct threat; 7 languages                       |
| SimplePractice (US)                               | $49–99                       | ~200k practitioners                               | parent taken private at **$4B** | Proves the category's ceiling — for a US horizontal player                    |
| [LivingMatrix](https://livingmatrix.com) (US)     | $129                         | 600+ FM practices                                 | —                               | Proves FM practitioners pay premium prices, sold via an education channel     |
| Fullscript/Rupa (CA/US)                           | free (monetises supplements) | 125k providers, >$1B rev                          | —                               | North America only — this moat/model doesn't exist in the EU                  |

**Four takeaways:**

1. **Price is not a moat.** €24.50 undercuts every full-suite incumbent's usable tier, but
   Nutrium's annual plans undercut REMI. Competing on price against a Series-A-funded Portuguese
   company is a losing game.
2. **AI is table stakes, not differentiation** — Practice Better, Healthie, SimplePractice,
   Foodzilla and NutriAdmin have all shipped AI scribes or meal-plan generation. The open flank is
   **localisation**: nobody offers a French/Dutch clinical-notes scribe or Belgian-workflow
   (RIZIV trajectory) tooling.
3. **The real gap REMI fills:** EU-native + GDPR-first + FR/NL + functional-medicine workflow +
   a practitioner-controlled client app. That combination genuinely does not exist. Belgium
   specifically has _no_ native modern platform.
4. **The FunMedDev channel is the proven playbook.** LivingMatrix built 600 practices at $129/month
   by selling through the IFM education body. REMI × FunMedDev is the same motion in Europe, where
   it has no incumbent. This partnership is arguably worth more than the codebase.

**Moats in this category:** client-side lock-in (once a practitioner's whole client base is on your
portal, switching means re-onboarding every client), content libraries, and channel endorsement.
All three favour whoever gets practitioners _and their clients_ active first.

---

## 6. Valuation — what REMI is worth today

Three lenses, in ascending order of generosity:

1. **Asset/trade-sale value: ≈ €0.** Micro-SaaS under $1M ARR sells for ~2.5–4× ARR
   ([Acquire.com closed-deal data](https://blog.acquire.com/acquire-com-biannual-acquisition-multiples-report-jan-2026/)).
   At €4.4k pilot ARR that is €10–20k. REMI's value today is entirely _option value_ on the future.
2. **Pre-revenue investor methods: €1M–€3M.** The Berkus method (max ~$500k per factor: idea,
   prototype, team, relationships, sales) lands at ~€0.7–1.5M — REMI scores on prototype and
   partnership, is heavily discounted on team (solo founder pair, CTO unsigned, no full-time tech)
   and sales (€0). The Scorecard method (European pre-seed median ~€5M pre-money
   ([PitchBook 2025](https://pitchbook.com/news/reports/2025-annual-european-vc-valuations-report)),
   adjusted down for team and market size) lands at ~€1.5–3M. Note Belgian/solo-founder deals sit
   in the _bottom half_ of that European distribution.
3. **The founders' number: €2.5M.** Inside the defensible band — but at its top, and the two
   factors that would justify the top (complete team, working product) are precisely what your
   joining would supply. You are being asked to _create_ the valuation used to price you.

**Sanity checks from the comparables:** Nutrium, Practice Better and Healthie — the three closest
success stories — were all founded ~2016 and took **5–9 years** to reach institutional funding; two
bootstrapped to profitability first. Only ~13% of SaaS companies reach $1M ARR within 3 years of
first revenue, ~25% within 5 ([ChartMogul](https://chartmogul.com/reports/saas-growth-the-odds-of-making-it/)).
The base case is a long, capital-light grind through practitioner word-of-mouth — which the
€24.50 price point and 2-day/week staffing must survive.

**Scenario sketch (illustrative, not prediction):**

| Scenario                          | ~3 yr state                                                                                      | Company value                   | Your 10% (post one ~20% dilution round) |
| --------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------- | --------------------------------------- |
| Bear (most likely single outcome) | Pilot fizzles or backend never ships; company idles                                              | ~€0                             | €0                                      |
| Base                              | 300–500 BE/FR practitioners, ~€100–150k ARR, profitable-ish niche                                | €0.3–0.6M (micro-SaaS multiple) | €25–50k _illiquid_                      |
| Bull                              | FunMedDev channel scales across FR/NL/UK, 2–3k seats + AI add-on ARPU, ~€1M ARR, raises properly | €4–8M                           | €300–650k paper                         |
| Dream                             | Becomes the EU Practice Better; Series A+                                                        | €20M+                           | Life-changing, and ~10 years away       |

---

## 7. Regulatory and reputational risk

This is the section least visible from inside the code and most likely to bite. Severity-ordered:

### 7.1 GDPR — launch-gating, ~€30–60k in year one (manageable)

Client meal plans, protocols and practitioner messaging are **special-category health data**
(GDPR Art. 9). Before real users: a data-processing agreement with every practitioner (built into
ToS — practitioner is controller, REMI is processor), a data-protection impact assessment, an
(outsourced) DPO, EU-region hosting with a transfer assessment for US-linked infrastructure
(Vercel/Supabase both US-headquartered), encryption + strict role-based access, records of
processing. Cost of the standard playbook: **~€30–60k year one**. Two sharpeners: the Belgian DPA's
**2026–28 strategic plan explicitly targets health-data players for proactive audits**, and a
chunk of REMI's target users (unregulated FM practitioners) have no professional-secrecy status, so
client **explicit consent** flows are needed — an architectural decision, not paperwork.

### 7.2 Medical Device Regulation — the one structural landmine (blocker if ignored)

EU law ([MDCG 2019-11](https://health.ec.europa.eu/system/files/2020-09/md_mdcg_2019_11_guidance_en_0.pdf)):
software intended for **treatment or alleviation of disease** is a medical device; under Rule 11
that means **Class IIa minimum** — notified body, ISO 13485, clinical evaluation, realistically
12–18 months and mid-six figures. Storage, communication, scheduling and _lifestyle/wellbeing_ meal
planning are explicitly exempt.

REMI's word "protocols" is the tripwire. The moment templates, marketing or an AI feature frame
protocols around _named diseases_ ("SIBO protocol", "insulin-resistance plan"), intended purpose
drifts from wellness to treatment — and disclaimers don't save you; claims and UI copy decide.
The therapeutic-frame design (practitioner authors, REMI transports) is the right defence.
**Recommendation: make "REMI never generates or suggests condition-specific interventions; the
practitioner authors, REMI organises and communicates" a written product constraint with your name
on it.** It is also the AI Act firewall: high-risk AI obligations would only reach REMI _via_
medical-device classification (now deferred to Dec 2027/Aug 2028 by the 2026 Omnibus). The only AI
Act duty that bites now (from 2 Aug 2026, Art. 50): disclose AI, label AI-generated content.

### 7.3 The functional-medicine tension (watch — business risk more than legal)

Functional medicine is **not a recognised profession** in Belgium or the EU, and mainstream
medicine widely labels it pseudoscientific. Consequences: (a) reputational contagion — "AI +
functional medicine + health protocols" is a bad headline waiting for one practitioner's harmful
advice; (b) weaker legal footing for those users (illegal-practice-of-medicine exposure is theirs,
but the platform's ToS must firmly allocate clinical responsibility to the practitioner); (c) the
_regulated_ dietitian segment is legally safer and has RIZIV workflow hooks — but is more
price-sensitive. Strategic fork to force with the founders: is REMI "software for nutrition
practitioners" (defensible, larger) that FM practitioners happen to use, or "the FM platform"
(niche, contagious)? Positioning copy should choose the former.

### 7.4 Later (watch): EHDS

The European Health Data Space applies in waves 2027–2031. Nothing to do before ~2028 except: don't
casually market "EHR" or "interoperable with patient records" (those words now carry regulatory
weight), and lean FHIR-aligned in data formats. Belgian eHealth/mHealthBelgium integration would
require CE marking — correctly deferred.

---

## 8. The deal — and what must be verified before signing

### 8.1 Where the numbers stand

- Offered: **5%**, unpaid until a funding round, against a claimed €2.5M valuation (€125k paper).
- Your counter: **10% fully diluted, 4-year vest, 12-month cliff**, ~2 days/week, no cash before
  funding; €120/h rate post-funding; ~€88k/year of forgone billing.

### 8.2 What the benchmarks say

- A **hired** part-time/fractional CTO (paid) gets 1–8%. An **unpaid full-time late-joining
  technical cofounder** gets 20–35%. An unpaid 2-day/week founding CTO who is also the sole author
  of the codebase sits between: **~10–20% on a 4-year vest** is the coherent range
  ([Index Ventures benchmarks](https://www.indexventures.com/rewarding-talent/allocation-considerations-and-benchmarks),
  fractional-CTO market guides).
- The **Slicing Pie** model (the standard framework for part-time founders: contributions at fair
  market value, non-cash × 2 for risk) values your contribution at ~€176k/year of at-risk input.
  At the claimed €2.5M valuation, that "buys" ~7%/year — i.e. **the 5% offer is under-priced by the
  founders' own valuation within roughly one year of your work**. This is the cleanest argument in
  the negotiation: either the valuation is lower, or the equity is higher; both can't hold.
- Also on the table if 10% stalls: milestone step-ups (e.g. +2.5% on shipping the pilot backend,
  +2.5% if you later go ≥3 days/week), or an anti-dilution-flavoured top-up at first funding.
- **Assign the IP carefully.** The codebase is currently yours. Assigning it at signature is
  normal — but make the assignment conditional on the equity terms closing, and keep it out of any
  period where you've contributed work without a signed agreement.

### 8.3 The verification list (conditions precedent — all standard, none optional)

1. **Cap table and articles of association** — confirm "€50,000 invested for 50%" (this implies the
   founders priced _themselves_ at €100k post-money and are pricing _you_ at €2.5M — worth an open
   conversation), confirm no hidden convertibles/SAFEs, confirm option-pool plans.
2. **The FunMedDev agreement, in writing** — exclusivity? duration? who owns the practitioner
   relationships? what was promised to Dr Mouton (equity? revenue share?)? The channel is the
   company's most valuable asset; you need to know how firmly it is attached.
3. **The pilot's reality** — signed agreements with how many of the 15 practitioners? The
   €24.50/enrolment-window terms exist only as demo fixture data while the public site says pricing
   is undecided; and the application form on the site **doesn't actually send**. How were the 15
   actually recruited and what were they promised? (Note the timeline: the fixture window closes
   31 August 2026 and billing "starts" 1 September — with no payment system in existence.)
4. **Company hygiene** — BCE/KBO registration, VAT number, who the shareholders of record are, any
   debts, who owns the `remiai.be` domain and trademark. (None of this appears anywhere in the repo
   or on the site.)
5. **Written role boundaries** — you are a 2-day/week CTO: what happens when GDPR work, pilot
   support and feature delivery all compete for those two days? Who does support? Who is the DPO?
6. **The regulatory budget** — founders' written acknowledgement that ~€30–60k of compliance spend
   (or equivalent founder time) precedes launch, and agreement to the Section 7.2 product
   constraint on disease-specific protocols.
7. **Your rate and backpay** — €120/h post-funding is in the proposal; get the trigger defined
   (what counts as "a funding round"? minimum size?) and whether pre-funding hours accrue.

---

## 9. What has to be true for this to work

A checklist to revisit quarterly — if these stop being true, the bear case is unfolding:

1. **The 15 pilots convert to paying** (≈ €4.4k ARR) and monthly churn stays under ~4%.
2. **The backend ships within 12 months** on ~100 days/year of your time — which means ruthless
   scope discipline: persistence + auth + GDPR baseline + plans/messaging + billing, and almost
   nothing else. (The current seams-first architecture is well suited to this; the risk is scope,
   not design.)
3. **FunMedDev actually produces practitioners** beyond the founding 15 — the LivingMatrix
   analogue (600 practices via a channel) is the whole distribution thesis.
4. **France or the Netherlands opens by year 2** — Belgium's ceiling is too low to sustain the
   story otherwise.
5. **ARPU grows past €24.50** — clinic seats, an FR/NL AI scribe (first-in-market, incumbents
   charge $35/month for English ones), or client-side features. The price point as it stands
   cannot fund a company.
6. **REMI stays on the wellness side of the MDR line** — one enthusiastic "disease protocol"
   feature can convert the business into a 18-month regulatory project.

---

## 10. Verdict

**As a business:** real problem, real tailwinds (Belgian policy is practically subsidising demand),
real gap (EU-native, bilingual, FM-aware, GDPR-first), proven channel playbook, and a domain model
already designed around the correct safety and regulatory posture. Also: a tiny home market, a
price point that can't carry the company, funded competitors one price-cut away, and a category
where the winners took most of a decade.

**As your decision:** the downside is bounded (your time, ~2 days/week, with a cliff protecting
both sides) and the option value is genuine. The two things that would make this a bad deal are
both fixable before signature: equity that under-prices you against the founders' own valuation
math, and unverified claims (cap table, FunMedDev contract, pilot reality). Sign nothing until
Section 8.3 is satisfied in writing; and if the founders resist either the verification or the
10%, that resistance is itself the answer.
