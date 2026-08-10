# Remi AI — v1 (Lovable) analysis report

Analysed on 2026-08-10 by reading the `v1-lovable/` folder end to end — every page, hook,
service, component, utility, migration, edge function and legal document. This is Morgane's
attempt to build the product with Lovable (Vite + React SPA + Supabase), dropped into the repo
untracked and **without any git history** — the folder carries no provenance beyond its README
(Lovable project `da52c366-fde5-4b34-8c26-6e3960f831cc`). The folder will be deleted after this
report, so this document is deliberately self-contained: everything needed to port the
functionality is written down here, and nothing below assumes the code still exists.

**How to use this document.** The companion `docs/audit-report.md` says what the new foundation
needs before feature work (its section 2 checklist). This report says what the features _are_.
The intended order: audit items first (test harness, error tracking, entity modelling, database
adapter, auth), then port the v1 functionality feature by feature using sections 3–8 here as the
spec. Section 9 maps every v1 feature onto the monorepo and onto the audit's findings; section 10
lists what must _not_ be ported.

---

## 1 · The verdict

**v1 is a real, working product with a genuinely valuable core — and almost none of its code is
worth carrying over.** What is worth carrying over, and is captured in full below, is:

1. **The product definition** — a complete, coherent user journey from psychological onboarding
   through medical-document ingestion to an AI-generated, guardian-validated 12-week nutrition
   plan with a feedback loop. Nobody has to invent the product again; v1 _is_ the spec.
2. **The domain knowledge** — the 20-question Nutrition Mindset questionnaire, the 7-profile
   psychological scoring algorithm with per-profile coaching doctrine, the 26-rule
   ApoE/DIO2/AMY1A nutrigenomic interpretation table, the EU-14 allergen model, and the
   phase-reduction rules. This is irreplaceable and reproduced in section 6.
3. **The data model and pipeline shape** — 13 tables, 23 edge functions, two cron loops, and a
   bidirectional contract with an external Python meal-plan API that does the actual AI
   generation and "Guardian Agent" validation. The _shape_ is right even where the
   implementation isn't.
4. **The vendor inventory** — Brevo (email), LlamaParse (PDF→markdown), OpenRouter LLM (default
   model `google/gemini-3-flash-preview`), and the private Python meal-plan API. These are the
   real answers to the seams the new repo deliberately left open. **Notably: the AI brain is not
   in this codebase.** The Python API (`MEAL_PLAN_API_URL`) generates plans, validates them, and
   builds supplement calendars — if that service is Morgane's too, it needs its own preservation
   decision before anything is deleted; if it is gone, the generation logic must be rebuilt from
   the contract documented in section 5.

The code itself has the defects you'd expect of a generated SPA grown under pressure: an
IDOR-riddled authorization model (any signed-in user can act on any patient), validation state
stored as array indices inside JSONB blobs, four copies of the same query, ~14 copy-pastes of the
same transformation, localStorage as a data layer, three languages in the comments, and a
substantial body of dead code from abandoned feature generations. None of that should survive the
port. One genuine credit: **74 test files** exist across utils, services, hooks and components —
more tests than the new monorepo has today — and **no plaintext secret was found anywhere** in
the tree (verified by pattern scan; all credentials are env-var reads).

## 2 · The product, in one page

REMI is a French-language wellbeing/nutrition companion for the Belgian market (default phone
prefix `+32`, 21% VAT, Belgian SRL). The journey:

1. **Consent** — the landing page's signup tab requires accepting the CGV/privacy policy _and_ a
   separate explicit health-data-processing consent (GDPR Art. 9 style); the consent timestamp is
   captured before any account exists.
2. **Psychological onboarding** (unauthenticated) — 20 Likert questions across 5 dimensions;
   an edge function computes one of 7 psychological profiles ("Le Structuré Volontaire",
   "L'Émotif Intuitif", …) shown to the user immediately.
3. **Biological intake + account creation** — one long form: identity, DOB (must be 18+),
   weight/height, diet type, EU-14 allergens, intolerances, cooking appetite, food budget,
   personal goal — then `supabase.auth.signUp` and profile + questionnaire persistence.
4. **Discovery week** — a 7-day food diary (the window starts at registration), plus a mandatory
   upload of a "FunMedDev" medical report PDF. Finalising the diary is irreversible and flags the
   patient ready for plan generation.
5. **Document intelligence** — the PDF is parsed to markdown (LlamaParse), then three parallel
   LLM extractions pull out supplements, genotypes (ApoE/DIO2/AMY1A) and medical
   recommendations. A human operator **validates every extracted item** in the admin console.
6. **Plan generation** — once validated, the operator generates week 1. The Python API generates
   one week at a time (recipes, drinks, supplements, weekly goals, shopping list), a "Guardian
   Agent" validates it against seven safety dimensions (immune safety, supplement validation,
   metabolic integrity, hormonal stability, medical compliance, biochemical consistency,
   enjoyment/sustainability), and cron loops auto-generate subsequent weeks (cap: 13 weeks) and
   auto-regenerate anything unvalidated.
7. **Living with the plan** — the patient sees today's meals on the dashboard and the full week
   in the program page; can skip any meal (reason + feedback → instant AI regeneration, exclusion
   remembered); gets a supplement calendar derived from the validated document; gives weekly
   feedback from day 4 (satisfaction + adherence 1–10) that earns medal badges and feeds the next
   week's generation; and receives a per-profile weekly advice message.
8. **Operations** — a single-admin console lists all users with a 7-day habits countdown, and per
   patient exposes profile, questionnaire (editable, rescored on save), the document validation
   workflow, plan generation/regeneration controls, feedback, the diary, and the supplement
   calendar.

Business model per the CGV: adults-only, paid auto-renewing subscription (EUR incl. 21% VAT, no
figures committed), 14-day EU withdrawal right (waivable on immediate access), cancel-anytime at
period end, Belgian law and courts. Positioning is hammered throughout: wellness, **not** a
medical device, not medical advice, no GDPR-significant automated decisions.

## 3 · Complete feature inventory — patient surface

Routes were a React Router SPA; protection was client-side (`ProtectedRoute` /
`AdminProtectedRoute`) with a single `admin` role ("superadmin" was naming only).

| Route                                    | What it did                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/`                                      | Login/signup tabs. Login: email+password, inline forgot-password, post-login role check routes to `/superadmin` (admin) or `/app`. Signup: pitch + two mandatory consent checkboxes → stores consent timestamp in localStorage → `/onboarding`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `/onboarding` (public)                   | 20 Likert-1–5 questions, one dimension (4 questions) per screen, per-screen validation, progress bar (counts as 70% of signup), answers persisted to localStorage across refreshes.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `/psychological-profile-result` (public) | Calls `compute-psychological-profile` (stateless, public) with the responses; shows profile label + long description; continue → `/questionnaires`. Hard refresh loses state (passed via router state).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `/questionnaires` (public)               | The biological intake + account creation form (full field list in §2 step 3; validation: 18+ DOB with DD/MM/YYYY mask, integer-only height, decimal weight, ≥1 intolerance and ≥1 allergen selection with exclusive "none", conditional free-text for fish/other). Submit: signUp → upsert `patient_profiles` (biology into `metadata` JSONB) → `save-questionnaire` edge fn (`nutrition_mindset_v1`) → `/app`. **Known data-loss edge case:** if email confirmation is enabled, the flow stops after signUp and profile/questionnaire are never saved.                                                                                                                                                                                                                                                                                                                                                                                    |
| `/app` (Dashboard)                       | Greeting, welcome modal (localStorage-gated), CTA to the diary when no plan; **TodayMeals** — today's meals from the current validated week, in four timed sections (breakfast ☀️ / lunch 🍽️ / snacks 🍎 / dinner 🌙) each with pre/on/post-meal drink & supplement slots, plus between-meals supplements 💊; sidebar with the weekly advice message and a feedback/contact form (`send-feedback`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `/app/diary`                             | The one-off 7-day discovery diary. Day navigator over a window starting at **registration date**; entry form (meal type incl. "Boisson(s) en dehors des repas", foods, drinks, notes); edit/delete per entry; 7-tile week summary. "Valider et générer mon programme": blocked until a FunMedDev document exists (`clinic_insights` row), then an irreversible confirm sets `nutrition_habits_completed`. All mutation UI locks after finalisation or once a plan exists; the sidebar hides the diary entirely once a plan exists.                                                                                                                                                                                                                                                                                                                                                                                                         |
| `/app/program`                           | The core page (2,168 lines). Week navigation over available validated weeks with adherence medals (Or ≥80% / Argent ≥70% / Bronze ≥50%); 7 day-tabs defaulting to today; per-day meal sections identical to TodayMeals plus standalone drinks (name-normalised dedupe: eau/thé/café/tisane) and between-meals supplements; shopping-list dialog from the week's `shopping_list`. **Skip flow:** reason radio (taste/complexity/time/budget/other) + optional feedback → `regenerate-meal` edge fn with exclusion list → replacement swapped in, skip recorded, shopping list recomputed, meal excluded from future weeks. **Weekly feedback:** auto-opens from day 4 of the current week (5s delay, 6-hour localStorage dismissal cooldown, never twice per week); satisfaction yes/no/unsure + adherence slider 1–10 + comment (mandatory if unhappy or score ≤3, enforced server-side too). No-plan states: 4-step onboarding checklist. |
| `/app/profile`                           | View/edit personal info (DD/MM/YYYY DOB mask, weight/height, phone; email read-only from auth); cooking preference and budget radios; allergies & intolerances editor (EU-14 allergen list + 6 intolerances, exclusive "none", conditional detail fields). **Key rule: changing allergies re-validates the current + all future plan weeks** (fires `validate-week-recipes` per consecutive week pair, fire-and-forget). Also: psychological profile card (from `questionnaires.computed_profile`), FunMedDev PDF upload (≤5 MB, to `upload-and-parse-pdf`; view via 1-hour signed URL; delete removes storage files + `clinic_insights` row), weekly badges card, and a nag dialog when allergies/intolerances are both empty.                                                                                                                                                                                                            |
| `/app/settings`                          | Mostly cosmetic: the only real setting was language (fr/en via i18next + localStorage) and sign-out. Profile/notifications/security tabs were unwired stubs.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `/forgot-password`, `/reset-password`    | Custom reset via a public `send-password-reset` edge fn (Supabase admin recovery link mailed through a Brevo template; always answers success against enumeration); reset page handles the Supabase recovery hash and calls `updateUser`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `/cgv`, `/confidentialite`               | Legal markdown rendered from `public/*.md` (summarised in §7).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

i18n existed (i18next, fr default + en) but covered ~10% of strings; the app was effectively
French-only, with the language switcher commented out.

## 4 · Complete feature inventory — admin console

One privileged role (`admin` in `patient_profiles.role`, with a **client-spoofable fallback** to
auth `user_metadata`/`app_metadata` — do not port that fallback). `/superadmin`:

- **User list** — all patients via `admin-get-users`: name, email, phone, signup date, days since
  signup, nutrition-habits badge (done / "7 jours écoulés" red after 7 days / countdown), derived
  status string ("Nutrition plan week N" → "Insights week" → "Profil créé" → "Onboarding"),
  client-side search.
- **Per-patient tabs** (`/superadmin/:userId/:tab`):
  - **Profil** — read-only: identity, weight/height/BMI/age, allergens/intolerances with
    free-text details, goal, budget/cooking preferences.
  - **Questionnaire** — every response with question text + dimension, the computed profile
    card, and an **edit dialog** (1–5 per question) that PUTs changed answers to
    `save-questionnaire`, which merges and **recomputes** scores/levels/profile.
  - **Documents** — the validation workbench. Upload PDF (≤5 MB) → poll processing status
    (supplements / genotype / recommendations each pending→processing→completed) → two-pane
    view: PDF preview (signed URL) beside three sub-tabs. _Supplements:_ rows
    `{name,dosage,frequency}` — validate per row, inline edit, delete, add-manual, validate-all.
    _Genotypes:_ rows `{code,value}` constrained to APOE ∈ {E2/E2…E4/E4,E2/E4}, DIO2/AMY1A ∈
    {A,H,M,A/H/M} — same actions plus an explicit **skip-genotypes**. _Recommandations:_ one
    free-text field seeded from the parsed markdown, with a one-shot validate boolean. Every
    save posts the **entire** validation state to `update-document`.
  - **Plans** — `week_recipes` rows per patient. "Generate week 1" appears only when the
    document is fully validated (all supplements + all genotypes-or-skipped + recommendations);
    it takes a start date and also fires supplement-calendar processing. Week N (2–13) is
    generatable only when week N−1 is `guardian_validated`. Generation returns 202 and takes
    10–15 minutes; empty `days_data` rows are in-flight placeholders (stale after 25 min →
    "Régénérer"). Read-only plan viewer per day/meal-slot, with an amber banner on unvalidated
    weeks. Week deletion is deliberately disabled server-side (always 403).
  - **Retours** — read-only weekly feedback (adherence n/10 + comment).
  - **Habitudes** — read-only 7-day diary view.
  - **Calendrier de compléments** — the generated supplement calendar (entries with dose
    schedules: per-dose timing/meal-type/specific-time, days-of-week/month, date ranges,
    monthly repetition); regeneration button gated on a plan existing. No manual editing —
    regeneration only.

## 5 · Backend: schema, edge functions, and the AI pipeline

### 5.1 Database schema (Postgres via Supabase; final state after 30 migrations)

No custom enums — TEXT + CHECK everywhere. All tables: UUID PK default `gen_random_uuid()`,
`created_at`/`updated_at` timestamptz with update triggers, RLS enabled.

| Table                                                                  | Columns that matter                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `patient_profiles`                                                     | `id` = `auth.users.id`; `first_name`, `last_name`, `date_of_birth` DATE, `sex`, `phone`, `role` ('patient'\|'admin'), `nutrition_habits_completed` bool, `metadata` JSONB. **All biology lives in `metadata`**: weight, height, allergens[], allergens_other, fish_allergy, intolerances[], intolerances_other, preferences (diet type), cooking_preference, budget_preference, personal_goal, genotype_profile, consent/onboarding timestamps. (Dedicated columns for weight/height/allergens/preferences were dropped in a late migration — much of the code still carries fallbacks.)                                                                                                                                                                                                      |
| `clinic_insights`                                                      | One medical document per patient (**upload deletes prior rows** — no history). `patient_id`, `metadata` JSONB holding _everything_: document/markdown paths + content, extracted `supplements` [{name,dosage,frequency}], `genotypes` [{code,value}] (or `""` when skipped — a quirk consumers special-case), `medical_recommendations` {text}, validation state (`validated_supplements`/`validated_genotypes` as **arrays of indices**, `validated_recommendations` bool, `genotypes_skipped`), `processing_status` per-extraction state machine. A DB trigger on metadata update fires the supplement-calendar pipeline.                                                                                                                                                                   |
| `questionnaires`                                                       | `questionnaire_key` ('nutrition_mindset_v1'), `respondent_id`, `responses` JSONB, `computed_scores`/`computed_levels`/`computed_profile` JSONB, `computed_outcome_version`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `week_recipes`                                                         | **The core table.** `patient_id`, `week_number`, `plan_id` (`week_{n}_{uuid}` — regenerated on every save, so nothing may rely on its stability), `start_date`/`end_date`, `days_data` JSONB (7 × {date, breakfast, lunch, dinner, snacks[]}; meals: {name, description, ingredients[], instructions[], nutritional_info, preparation_time, difficulty_level}), `drinks` JSONB [{date, timing, name, quantity, context}], `supplements` JSONB (legacy), `weekly_goals` TEXT[], `shopping_list` TEXT[], `guardian_validated` bool, `guardian_validation_result` JSONB (seven-dimension verdict + errors/warnings/summary). **No unique constraint on (patient_id, week_number)** — uniqueness held only by retry logic. An empty-`days_data` row doubles as the "generation in progress" lock. |
| `nutrition_diary_entries`                                              | `patient_id`, `entry_id` (client-generated, unique), `day`, `date`, `time`, `meal_type`, `foods`, `drinks`, `notes`, `week_start_date`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `weekly_feedback`                                                      | `patient_id`, `plan_id` (dangles — see plan_id note), `week_start_date`, `satisfaction` (yes\|no\|unsure), `adherence_score` 1–10, `feedback`. **No FK to `week_recipes`** — the client used a 4-strategy matching cascade to join them; the port should add a real key.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `skipped_meals`                                                        | `patient_id`, `week_number`, `day_index` 0–6, `meal_type`, `meal_name`, `skip_reason`, `skip_feedback`. Last 20 fed into every generation.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `patient_supplement_calendars`                                         | One row per patient: `supplements` JSONB (entries: name, dosage, frequency, date_range, doses[] {quantity, timing, meal_type, specific_time}, days_of_month[], days_of_week[] (1=Mon), repeat_monthly; also carries `{status:"processing"}` while Python computes), `start_date`, `end_date`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `weekly_advice`                                                        | `(profile_key, week_number)` unique → French motivational `message`; a static bank of ~21 messages × 7 psychological profiles.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `meal_plan_entries`, `meal_plan_structures`, `patient_recommendations` | Legacy tables from an earlier flat-plan format (`save-meal-plan` flow); superseded by `week_recipes`. `patient_recommendations` had an RLS bug letting **any user write global recommendations**. Don't port any of the three.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |

Storage: private bucket `private_documents`, path `{ownerId}/documents/{timestamp}_{name}`,
1-hour signed URLs; PDF + markdown MIME allowed; owner-or-admin read policy (but the INSERT
policy never constrained the path to the uploader's folder).

RLS model: single permissive policy per action of the form `is_admin(auth.uid()) OR auth.uid() =
patient_id`, on all patient tables; `weekly_advice` readable by any authenticated user. Nearly
all edge functions used the service-role client, so RLS mainly guarded direct PostgREST access.

Cron (pg_cron): hourly `auto-generate-week-recipes`; every 10 minutes
`auto-regenerate-unvalidated-weeks`. Both post to edge functions via `pg_net` with the
service-role key pulled from database settings — note the final remote-sync migration _dropped_
`pg_net` while the trigger functions still depend on it, one of several migration-replay bugs
(duplicate unschedule migrations, a trailing-comma syntax error in the `skipped_meals` CREATE, a
seed that conflicts with a later NOT NULL).

### 5.2 Edge functions (23) and the external contract

Patient-facing: `compute-psychological-profile` (public, stateless), `save-questionnaire`
(POST insert + PUT merge/rescore), `get-weekly-advice`, `save-weekly-feedback`,
`regenerate-meal`, `upload-and-parse-pdf`, `send-feedback` (public — Brevo mail, with an
unescaped-HTML injection bug), `send-password-reset` (public — Brevo template).
Admin: `admin-get-users`, `get-documents-data`, `update-document`, `process-supplements-calendar`.
Pipeline/internal: `extract-supplements`, `detect-genotype`, `extract-recommendations`,
`generate-week-recipes`, `validate-week-recipes`, `save-week-recipes` (Python callback),
`save-supplement-calendar` (Python callback), `auto-generate-week-recipes`,
`auto-regenerate-unvalidated-weeks`, `delete-week-recipe` (always 403), `save-meal-plan` (legacy).

**The generation pipeline end to end:**

1. `upload-and-parse-pdf`: store PDF → LlamaParse → markdown → delete prior `clinic_insights`,
   insert fresh row → fire three parallel extractions. `extract-supplements` first tries
   deterministic parsing of LlamaParse HTML tables (Code/Description/Posologie/Quantité/Timing),
   falling back to an OpenRouter JSON-mode call (temp 0.1, verbatim-copy prompt);
   `detect-genotype` LLM-extracts ApoE/DIO2/AMY1A with strict vocabulary validation and applies
   the interpretation table (§6.3); `extract-recommendations` LLM-extracts structured
   recommendations (12,000-char input cap on all LLM calls).
2. Operator validates everything (§4). Full validation is the hard gate for both plan generation
   and the supplement calendar.
3. `process-supplements-calendar` (also fired by DB trigger on validation): extracts treatment
   duration in months from the recommendations text **by regex** (FR/ES/EN patterns, default 3),
   writes a processing placeholder, and asks the Python API to compute the calendar → callback
   `save-supplement-calendar`.
4. `generate-week-recipes` assembles the entire patient context — profile + metadata biology,
   allergens/intolerances incl. free-text others, diet type, cooking/budget, personal goal,
   genotypes (clinic insight preferred over profile), validated supplements, doctor
   recommendations text, psychological profile + coaching guidance, all diary entries, all
   weekly feedback, last 20 skipped meals, supplement calendar, previous week's plan and
   feedback — and POSTs it to the Python API
   (`POST {MEAL_PLAN_API_URL}/api/meal-plan/week/{n}/recipes?language=fr`, 5-min timeout,
   Bearer `MEAL_PLAN_API_KEY`, 202 fire-and-forget). Python generates the week **and runs the
   Guardian validation**, then calls back `save-week-recipes` with `is_validated` +
   `guardian_validation_result`. One local rule on save: empty `drinks` forces
   `guardian_validated = false`.
5. `validate-week-recipes` re-runs Guardian validation on a **pair** of consecutive weeks
   (`.../api/meal-plan/validate-two-weeks`) — this is what the patient app fires when allergies
   change.
6. `regenerate-meal` synchronously asks Python for a single replacement meal (with exclusion
   list), swaps it into `days_data`, records the skip, and **recomputes the shopping list via an
   OpenRouter "Kitchen Logistics Manager" prompt** (consolidates and sums quantities; LLM-free
   dedupe fallback; supplements always excluded).
7. Cron: hourly — for each patient with a validated current week ending within 2 days and no
   in-flight week, generate the next (cap 13 weeks ≈ 3 months), or fill sequence gaps; every
   10 min — regenerate weeks unvalidated for >40 min, re-kick supplement calendars stuck >30 min.

**Guardian validation result schema** (worth preserving as the safety spec):
`{is_valid, validation_results: {immune_safety, supplement_validation, metabolic_integrity,
hormonal_stability, medical_compliance, biochemical_consistency, enjoyment_sustainability},
errors[], warnings[], summary}` — with per-check details such as problematic meals,
missing/duplicate supplements, and daily macro averages.

### 5.3 Vendor and env-var inventory

| Vendor                         | Role                                                                          | Env vars                                                                                                                            |
| ------------------------------ | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Python meal-plan API (private) | Plan generation, Guardian validation, supplement calendars — **the AI brain** | `MEAL_PLAN_API_URL`, `MEAL_PLAN_API_KEY`                                                                                            |
| OpenRouter                     | Extraction LLM + shopping-list consolidation                                  | `LLM_API_KEY`, `LLM_MODEL_NAME` (default `google/gemini-3-flash-preview`)                                                           |
| LlamaParse (LlamaCloud)        | PDF → markdown                                                                | `LLAMA_CLOUD_API_KEY`                                                                                                               |
| Brevo                          | Transactional email (feedback, password reset)                                | `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME`, `BREVO_REMI_EMAIL`, `BREVO_PASSWORD_RESET_TEMPLATE_ID`                  |
| Supabase                       | DB, auth, storage, edge functions, cron                                       | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`; client: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`      |
| Misc                           |                                                                               | `SITE_URL`; README also names a Cognee knowledge-graph sync (`COGNEE_SYNC_API_URL/KEY`) and `OPENAI_API_KEY` for edge-fn tests only |

No Anthropic, no Resend, no Stripe anywhere. The new repo's docs lean Resend + Anthropic — the
port therefore _changes_ email and (if generation is rebuilt in-house) AI vendors; the Brevo
password-reset template and the OpenRouter prompts are the assets to translate, not keep.

## 6 · Domain knowledge to preserve (the irreplaceable part)

### 6.1 The Nutrition Mindset questionnaire (`nutrition_mindset_v1`)

20 required Likert-1–5 items in 5 sections of 4 — Motivation, Control/Rigidity, Food & Emotions,
Resilience/Flexibility, Self-efficacy. The motivation section splits asymmetrically into three
scoring dimensions: **autonomous** (items 1 & 4: "matters to me / aligns with my values",
"proud and satisfied when I improve"), **extrinsic** (item 2: "mostly to please others"),
**amotivation** (item 3: "don't see much point"). Control items: meals planned ahead / guilt on
deviation / prefers clear rules / can't tolerate unplanned deviations. Emotions: stress eating /
comfort food / eating without hunger / disorganised when struggling. Resilience: bounces back /
mistakes as learning / adapts / stays positive. Self-efficacy: can sustain / finds solutions /
confident of goals / holds course despite temptation. No reverse-scored items.

### 6.2 The scoring algorithm and the 7 profiles

Seven dimensions (autonomous, extrinsic, amotivation, rigidity, emotional, resilience,
self-efficacy). Score = plain mean of the dimension's items (1.0–5.0, 2 dp). Levels: **low
≤ 2.4, medium 2.5–3.4, high ≥ 3.5**. Profile = first match in an ordered cascade:

1. **rigid_motivated** "Le Structuré Volontaire" — rigidity high ∧ autonomous med/high ∧
   self-efficacy med/high ∧ emotional low/med.
2. **emotional_reactive** "L'Émotif Intuitif" — emotional high ∧ resilience low ∧ self-efficacy
   low/med ∧ extrinsic med/high ∧ extrinsic ≥ autonomous.
3. **practical_autonomous** "Le Curieux Indépendant" — autonomous, self-efficacy, resilience all
   high ∧ rigidity low/med ∧ emotional low.
4. **non_ready_ambivalent** "Le Réfléchi en Chemin" — (amotivation high ∨ (extrinsic high ∧
   autonomous low)) ∧ self-efficacy low ∧ resilience low/med.
5. **resilient_flexible** "Le Souple Optimiste" — resilience & self-efficacy high ∧ autonomous
   med/high ∧ rigidity low/med ∧ emotional low.
6. **resilient_emotional** "Le Sensible Équilibré" — raw scores: resilience ≥4 ∧ self-efficacy ≥4
   ∧ autonomous ≥4 ∧ emotional ≥3.5.
7. **hybrid_motivated** "Le Motivé Rayonnant" — raw: autonomous ≥4 ∧ extrinsic ≥4 ∧
   self-efficacy ≥3 ∧ rigidity <3.5.

Fallback cascade if nothing matches, ending at resilient_flexible. Each profile carries a full
French coaching brief (portrait, cognitive/emotional/behavioural mechanisms, success triggers,
relapse risks, food strategies, coaching tactics) that was **sent to the plan generator** —
substance in brief: rigid → fixed menus 80% + one planned free meal, quantified positive
feedback, reframe slips; emotional → 5–6 repeated staple meals, comfort substitutes, daily
emotional check-in; practical-autonomous → modular choice-baskets, monthly challenges,
gamification, scientific explanations; non-ready → micro-changes only (+1 fruit/day, water
before meals, sodas ≤1×/week), ultra-positive tone; resilient-flexible → framework plans,
experimentation, feedback every 2–3 weeks; resilient-emotional → buffer meals, anticipatory prep
before stress; hybrid → participative/social plans, frequent recognition. The weekly-advice bank
(~21 messages/profile) keyed to these profiles.

### 6.3 The nutrigenomics table (ApoE × DIO2 × AMY1A)

Three genes: **ApoE** (E2/E2, E2/E3, E2/E4, E3/E3, E3/E4, E4/E4), **DIO2** and **AMY1A** (each
A = homozygous ancestral, H = heterozygous, M = homozygous modern; lab-notation normalisers:
DIO2 AA→A, AG→H, GG→M; AMY1A CC→A, CT→H, TT→M, or copy-number ≤4→A, ≤8→H, else M). Output:
gluco-lipid index (1–100), diet orientation, macro ranges; **protein always 20–25%**. The
26-rule table (first match wins; "a→b←c" was a range with midpoint):

| ApoE  | DIO2 | AMY1A                   | Index      | Orientation                                  | Carbs % | Lipids % |
| ----- | ---- | ----------------------- | ---------- | -------------------------------------------- | ------- | -------- |
| E2/E2 | any  | any                     | 1          | Cétogène                                     | 5–10    | 65–75    |
| E2/E3 | A    | any                     | 2          | Cétogène                                     | 5–12    | 63–75    |
| E2/E3 | H    | A                       | 3→3,5←4    | Cétogène                                     | 6–12    | 63–74    |
| E2/E3 | H    | H                       | 5→5,5←6    | Très gras                                    | 8–15    | 60–72    |
| E2/E3 | M    | A                       | 7→7,5←8    | Très gras                                    | 10–18   | 57–70    |
| E2/E3 | M    | H                       | 9          | Très gras                                    | 12–20   | 55–68    |
| E2/E3 | M    | M                       | 10         | Fort gras                                    | 15–22   | 53–65    |
| E3/E3 | A    | A                       | 11→13←15   | Fort gras                                    | 10–20   | 55–70    |
| E3/E3 | A    | H                       | 16→17←18   | Gras                                         | 12–22   | 53–66    |
| E3/E3 | H    | A                       | 19→27,5←36 | Gras                                         | 15–25   | 50–60    |
| E3/E3 | M    | A                       | 37         | Assez gras                                   | 20–28   | 47–55    |
| E3/E3 | M    | H                       | 38→43←48   | Modéré côté gras                             | 22–32   | 43–58    |
| E3/E3 | M    | A _(dup — unreachable)_ | 49→55,5←62 | Modéré                                       | 25–35   | 40–55    |
| E3/E3 | M    | H _(dup — unreachable)_ | 63→67←71   | Modéré côté glucidique                       | 28–38   | 37–52    |
| E3/E4 | A    | A                       | 72→72,5←73 | Plus glucidique / moins gras                 | 30–40   | 35–45    |
| E3/E3 | H    | M                       | 74→74,5←75 | Plutôt glucidique (reste modéré)             | 32–42   | 33–45    |
| E3/E3 | M    | M                       | 76→76,5←77 | Plus glucidique                              | 34–44   | 31–46    |
| E3/E4 | A    | H                       | 78         | Glucidique                                   | 35–45   | 30–45    |
| E3/E4 | H    | A                       | 79→81,5←84 | Glucidique                                   | 36–48   | 27–44    |
| E3/E4 | H    | H                       | 85→86←87   | Glucidique marqué                            | 38–50   | 25–42    |
| E3/E4 | M    | A                       | 88→90←92   | Riche en glucides                            | 40–55   | 20–40    |
| E3/E4 | H    | M                       | 93         | Riche en glucides                            | 45–55   | 20–35    |
| E3/E4 | M    | H                       | 94→94,5←95 | Fort glucidique                              | 48–58   | 17–32    |
| E3/E4 | M    | M                       | 96         | Flexitarien, peu de graisses saturées        | 50–60   | 15–30    |
| E4/E4 | any  | any                     | 97→97,5←98 | Flexitarien, **pas** de graisses saturées    | 50–60   | 15–30    |
| E2/E4 | any  | any                     | 99–100     | Inclassable — se fier aux marqueurs sanguins | n/s     | n/s      |

The doctrine: E2 carriers → ketogenic/high-fat; E3/E3 → a fat→carb gradient modulated by DIO2
then AMY1A (A→H→M pushes carb-ward); E4 carriers → carb-oriented/flexitarian with saturated fat
reduced (E3/E4) or eliminated (E4/E4); E2/E4 → defer to blood markers. **Known bug preserved
knowingly:** the two duplicated E3/E3 rows made the later "modéré/glucidique" variants dead
rules — the source table likely positioned within the arrow ranges by blood markers, and that
nuance was lost in translation to code. Whoever re-implements this should go back to the
original FunMedDev source table rather than trusting the code. A parallel list of 26 named
genotype profiles ("Pure Ketogenic" … "Vegetarian Balanced") with metabolic type and headline
recommendations was written to the patient profile when all three genes matched.

### 6.4 Allergen/intolerance/preference model

Allergens (EU-14 + splits): dairy, eggs, fish (species required), all-fish, shellfish,
tree-nuts, peanuts, wheat/gluten, soy, sesame, mustard, celery, lupin, mollusks, other (+
free text). Intolerances: lactose, gluten, fructose, histamine, fodmap, other. Diet types:
omnivore, vegetarian, vegan, pescatarian, flexitarian, ketogenic, paleo, mediterranean, halal,
other. Cooking appetite: dislike / a-bit / like / passionate. Budget: limited / medium /
comfortable / high.

### 6.5 Phase rules and other product constants

- Program length **12 weeks** displayed (server cap **13**); month 1 (w1–4) = 70% reduction of a
  flagged habit, month 2 (w5–8) = 50%, month 3 (w9–12) = 25% — allowed-per-week =
  `baseline × (100−reduction)/100`. (Built as `AllowedFoodsSection`, never mounted — a designed
  feature that never shipped; keep as spec.)
- Adherence medals: gold ≥80%, silver ≥70%, bronze ≥50% (score×10); badge only from ≥50%.
- Weekly feedback window opens on day 4 of the week; comment mandatory if unhappy or score ≤3.
- Diary window = 7 days from registration; habits countdown badge turns red after 7 days.
- Generation watchdogs: regenerate unvalidated weeks after 40 min; re-kick stuck calendars after
  30 min; auto-generate the next week when the current validated week ends within 2 days.
- Skipped-meals memory: last 20 fed to every generation.
- Upload cap 5 MB PDF; LLM input cap 12,000 chars; supplement treatment duration default
  3 months (regex-extracted, 1–24 accepted).
- A "Dr Mouton" knowledge base existed but was **explicitly simulated** placeholder content
  (six topics: vitamin D 5000 IU/day protocol, gut health/probiotics, protein 1.2–1.6 g/kg,
  chrononutrition ≤12-h eating window, hydration ≥2 L, stress-nutrition) with fake YouTube URLs
  — an aspiration for a real practitioner-knowledge corpus, not data. The habit analyzer was
  likewise hardcoded simulation.

## 7 · Legal documents (both v. 27.11.2025, marked "awaiting legal validation")

**Company**: REMI AI SRL, Avenue du Tonnelier 24, 1428 Lillois-Witterzée, Belgium;
arnaud@remiai.be / morgane@remiai.be; +32 486 12 46 83.

**CGV**: wellness positioning with explicit not-medical-device / not-medical-advice clauses and
an AI-transparency clause (no GDPR-significant automated decisions); adults only; paid
auto-renewing subscription in EUR incl. 21% VAT (no figures — deliberately); 14-day withdrawal
right waivable on immediate digital access; cancel anytime effective at period end, no pro-rata
refunds; Belgian law, courts of the registered office.

**Privacy policy**: controller REMI AI SRL; explicit Art. 9.2(a) consent for medical/genetic
data (names APOE, AMY1A, DIO2 specifically); sensitive data never for advertising, visible only
to the user, deleted immediately on removal and fully within 30 days of account deletion;
retention: interactions ≤24 months, billing 7–10 years; EU hosting or adequacy safeguards; data
never sold; one notable commitment to check with counsel — "amélioration des modèles d'IA" is a
listed purpose, which sits awkwardly beside the sensitive-data promises. Complaint route:
Belgian APD. These two documents substantially answer audit items F-34/D-5's "what did we
already promise" question and should seed the new repo's legal pages — after the pending legal
validation actually happens.

## 8 · Defects that must not survive the port

The port is a chance to fix these by construction; each is verified, not hypothetical.

1. **IDOR throughout the edge functions** — no function checked that the caller's user id
   matched the `patientId` it was given: any signed-in user could generate/read/write another
   patient's plans, feedback, and upload documents into their record. Admin checks existed on
   only 4 of 23 functions; generation/validation/upload required mere authentication.
2. **Client-spoofable admin fallback** — admin status fell back to `user_metadata.role/isAdmin`,
   which the user can write. The new repo's decided practitioner↔person relationship model
   (audit F-14) plus server-side checks replace this wholesale.
3. **`patient_recommendations` RLS** let any user write globally-visible rows.
4. **Validation-by-array-index inside JSONB** (`validated_supplements: number[]`), with
   client-side index re-shifting on delete, concurrent-edit desync, and three extraction
   functions doing read-modify-write on the same JSONB with stale snapshots. Model extracted
   items as rows with ids.
5. **Single-document-with-history-destruction** — uploading a document deleted all prior
   `clinic_insights`. A health product needs document history (also audit F-16's audit-trail
   entity).
6. **No FK integrity where it matters** — feedback↔week matched by a 4-strategy heuristic
   cascade; `plan_id` regenerated on every save; no unique (patient, week_number).
7. **State machines by inference** — "empty days_data = generating" as a lock, localStorage
   in-flight tracking, 25/30/40-minute staleness heuristics, polling loops, a 500 ms
   "let-the-DB-settle" sleep. The port should have a real job/run table.
8. **UTC/Paris timezone drift** — all server date math in UTC against a CET product; four
   different client-side date hacks.
9. **Unescaped HTML interpolation** in the public feedback mailer; public endpoints with no
   rate limiting; wildcard CORS everywhere incl. admin endpoints; service-role key compared by
   string equality as an internal auth scheme (and travelling through pg_net logs).
10. **localStorage as a data layer** — consent timestamps, onboarding answers, dismissal
    cooldowns, in-flight generation state. Consent capture in particular must be a database
    record (audit F-16).
11. **Signup data-loss path** — with email confirmation enabled, account creation succeeded but
    profile + questionnaire were silently never saved.
12. **Migration hygiene** — the migration chain does not replay cleanly (dropped `pg_net` still
    referenced, syntax error, seed/NOT-NULL conflict, duplicate migrations).

## 9 · Porting map — from v1 to the monorepo

### 9.1 Where each piece lands

| v1 piece                                                            | New home                                                           | Notes                                                                                                                                                                     |
| ------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Patient app (dashboard, program, diary, profile, onboarding funnel) | `apps/web`                                                         | The existing fixture-driven screens (clients/plans/meals) are practitioner-oriented; v1 is patient-oriented — reconcile the two audiences during Scope, don't assume 1:1. |
| Admin console (user list, document validation, plan controls)       | `apps/admin`                                                       | Replaces/extends the fixture-based console; the admin entities join the shared model layer (audit F-15).                                                                  |
| Data model (§5.1, corrected per §8)                                 | `packages/services/src/db/models/` + migrations                    | Do this **with** audit item 7 (CareRelationship, consent, audit, AI-generation entities) — v1's tables are the concrete input that modelling pass was waiting for.        |
| Edge-function logic                                                 | Next.js route handlers / server actions calling the services seams | The seam interfaces must grow first (audit F-09/F-12) — v1 is the evidence for exactly which query shapes and AI-call shapes are needed.                                  |
| Psych scoring + questionnaire (§6.1–6.2)                            | Pure TS module in `packages/services` (or a domain package)        | Pure logic, fully specified above, ideal first TDD target — v1 even ships tests to translate.                                                                             |
| Genotype interpretation (§6.3)                                      | Same                                                               | Re-derive the duplicated rows from the original source table before implementing.                                                                                         |
| Guardian validation + generation                                    | Decision needed (D-below)                                          | Either keep the Python API as a vendor behind the AI seam, or rebuild in-house per the audit's Anthropic-via-gateway decision.                                            |
| Weekly-advice bank, coaching briefs, legal docs                     | Content/seed data + marketing/web legal pages                      | French-first; the new repo's compiler-enforced fr/en parity fixes v1's 10% i18n.                                                                                          |
| Brevo templates, OpenRouter prompts                                 | Translate into the email seam (Resend) and AI seam                 | Prompt _intent_ is documented in §5.2; vendors change.                                                                                                                    |

### 9.2 Sequencing against the audit report

Audit section 2 items 1–6 (exposure, contact form, branch protection, drift, **test harness**,
**error tracking**) are untouched by this report — do them first. Then:

- **Audit item 7 (model the missing entities)** now has its real-world input: model v1's schema
  (§5.1) _plus_ the audit's CareRelationship/consent/audit/AI-generation entities _minus_ the
  §8 defects, in one pass. v1's consent flow (timestamp before signup) becomes a proper consent
  record; v1's `clinic_insights` becomes a document entity with history; `guardian_validation_result`
  becomes the AI-generation audit record the docs already require.
- **Audit item 8 (database vendor)** — v1 ran on Supabase and used its auth, storage, RLS, cron
  and edge functions, not just Postgres. That materially strengthens the Supabase side of the
  audit's D-2 (Neon vs Supabase): choosing Supabase makes the port a translation; choosing Neon
  means rebuilding storage/auth/cron elsewhere. Decide with this in hand.
- **Audit item 9 (auth)** — v1 used Supabase email+password with a custom Brevo reset; the new
  repo has decided magic links. Note for D-3: if D-2 lands on Supabase, its auth answers this
  too, and v1's anti-enumeration reset behaviour is worth keeping.
- **Then port features in dependency order**: (1) onboarding funnel + consent + psych scoring
  (pure logic first — it needs only auth + profiles); (2) profile + allergens model;
  (3) document upload/parse/extract/validate (needs storage + AI seam + admin);
  (4) supplement calendar; (5) week generation + guardian loop + crons (needs the
  Python-API decision); (6) program page + skip/regenerate + weekly feedback + badges +
  advice; (7) diary (only needed pre-plan — consider whether the discovery week survives
  product-wise); (8) admin console around all of it.

### 9.3 Decisions this report adds to the audit's list

- **D-v1-1 · What happens to the Python meal-plan API?** It is the product's brain and lives
  outside this repo. Is it Morgane's, is it running, is its code preserved? Options: keep it as
  a vendor behind the AI seam (fastest path to parity); absorb its logic into this repo against
  the audit's Anthropic decision (one stack, but the generation + guardian logic must be
  re-specified from §5.2's contract); or rebuild generation from scratch (the guardian schema in
  §5.2 is the safety spec either way). **Decide before deleting anything Python-side — this
  report only preserves the Supabase half of the contract.**
- **D-v1-2 · Patient-facing, practitioner-facing, or both?** v1 is direct-to-patient with a
  back-office operator; the new repo's docs and fixtures are practitioner-first with a
  practitioner↔person access model. These are different products sharing a domain. The Scope
  stage for the first ported feature has to answer which audience v1's screens serve now.
- **D-v1-3 · Do the v1 vendors survive?** Brevo vs the repo's Resend leaning; OpenRouter/Gemini
  vs Anthropic-via-gateway; LlamaParse for PDF extraction (no equivalent decided in the new
  repo — this one likely simply carries over). Fold into the audit's D-2/D-5 decision sitting.
- **D-v1-4 · Is there production data?** If the Lovable Supabase project ever held real users,
  patients or uploaded medical documents, it is special-category personal data under GDPR and
  needs an explicit migrate-or-erase decision (with the §7 privacy promises applying to it) —
  deleting the _code_ folder does not answer what happens to the _project_.

## 10 · Do not port (dead code and abandoned generations)

Verified dead in v1 — carrying any of it over would be porting noise: the unrouted
`ProfileQuestionnaire`/`ProfileResult` client-side scoring flow (superseded by the edge
function); `MealSuggestionDialog` and the `skippedMeals` set (replaced by regeneration);
`AIInsights` and `MealRecommendations` (hardcoded mock content, imported but never rendered);
the entire `components/recommendations/*` generation; `BloodworkSummary` (built, never wired);
`drMoutonKnowledge` and `habitAnalyzer` (simulated placeholders — §6.5); the legacy
`meal_plan_entries`/`meal_plan_structures`/`patient_recommendations` tables and the
`save-meal-plan`/`delete-week-recipe` functions; the duplicated `useSuperadminDocumentDetail`
hook; the non-functional Settings tabs (theme, notifications, password change, biometrics); the
no-op avatar upload; the commented-out language switcher; `SupplementCalendarTab` (legacy
variant). The one exception worth rescuing from the dead pile as _spec_: `AllowedFoodsSection`'s
70/50/25% phase-reduction rules (§6.5), which encode real product doctrine that never shipped.

## 11 · Could not check

- **The Python meal-plan API** — not in the folder; its behaviour is reconstructed here solely
  from the calling contract, payloads and result schemas on the Supabase side.
- **The live Lovable/Supabase project state** — whether it is deployed, holds real user or
  medical data (D-v1-4), which secrets are set, whether the crons run, and whether the remote
  schema matches the migrations (the final migration is an auto-generated remote sync,
  suggesting drift had already happened once).
- **The original FunMedDev genotype source table** — needed to resolve the duplicated-row bug
  in §6.3 before re-implementing.
- **Brevo account state** — the password-reset template referenced by id exists only there.
- **Whether the legal documents ever received the pending legal validation** they are stamped
  as awaiting.
