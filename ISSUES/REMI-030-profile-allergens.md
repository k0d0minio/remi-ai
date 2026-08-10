# REMI-030 · Patient profile: biology, allergens, intolerances, preferences

| | |
| --- | --- |
| **Type** | feature |
| **Priority** | P1 |
| **Size** | Days |
| **Depends on** | REMI-018/022 (models + db), REMI-023 (auth); REMI-029 shares the model |
| **Blocked by** | D-v1-2 (who edits — the person, the practitioner, or both) |
| **Sources** | v1-report §3 (`/app/profile`), §6.4; audit F-18 |

## Problem statement

v1 kept all biology in an untyped JSONB `metadata` blob (weight, height, allergens, intolerances,
preferences, goals) with dropped-column fallbacks littering the code. The port needs a properly
typed profile: the EU-14 allergen model with its splits and conditional detail fields, six
intolerances, diet types, cooking appetite, budget — plus the profile screen to view and edit it.
One v1 rule is load-bearing and must survive: **changing allergies re-validates the current and
all future plan weeks** (safety, not cosmetics — it becomes a REMI-034 hook).

## Required steps

1. Typed profile model fields (with REMI-018): the §6.4 vocabularies as union types — allergens
   (EU-14 + splits: fish requires species detail, exclusive "none", other + free text),
   intolerances (6 + other), diet types (10), cooking appetite (4), budget (4), personal goal.
2. Profile screen in `apps/web`: view/edit identity (DOB masked, email read-only from auth),
   measurements, preferences; allergens & intolerances editor with the exclusive-"none" and
   conditional-detail behaviours; the psychological-profile card (read-only, from REMI-027's
   computed outcome).
3. The re-validation hook: allergy/intolerance changes emit a domain event or call the
   plan-re-validation path once REMI-034 exists; until then, record the requirement where the
   plan feature will find it (interface + TODO wired to a no-op with a test asserting it fires).
4. The empty-allergies nag from v1 (both lists empty → prompt) — a safety nudge worth keeping.
5. Audit-trail entries for profile edits (health data changes are auditable).

## Acceptance criteria

- [ ] No biology lives in untyped JSON; every vocabulary is a typed union with FR/EN labels.
- [ ] The editor enforces exclusive-"none", required details, and server-side validation.
- [ ] An allergy change demonstrably triggers the re-validation hook (test-verified).
- [ ] Profile edits appear in the audit trail.

## Agent prompt

```text
Work in the remi-ai monorepo. Enter through the delivery pipeline per CLAUDE.md. Read
CONVENTIONS.md, then docs/v1-report.md §3's /app/profile row and §6.4 (the complete vocabulary),
plus audit F-18's primitive warnings.

Build the profile feature in apps/web on the shared models:
1. Ensure the profile model in packages/services carries §6.4's vocabularies as typed unions —
   allergens: dairy, eggs, fish (species detail required), all-fish, shellfish, tree-nuts,
   peanuts, wheat-gluten, soy, sesame, mustard, celery, lupin, mollusks, other (+free text);
   intolerances: lactose, gluten, fructose, histamine, fodmap, other; diet types: omnivore,
   vegetarian, vegan, pescatarian, flexitarian, ketogenic, paleo, mediterranean, halal, other;
   cooking appetite: dislike, a-bit, like, passionate; budget: limited, medium, comfortable,
   high. FR/EN labels as content, structured fields per audit F-18 (no free-text where a type
   fits).
2. Build the profile screen: view/edit personal info (DD/MM/YYYY DOB mask, weight/height, phone,
   email read-only from the session), preference radios, and the allergens/intolerances editor
   with exclusive "none" handling and conditional detail fields — server actions validating
   everything again server-side.
3. Show the psychological-profile card from the stored computed outcome (read-only here).
4. Implement the safety rule as a hook: on any allergen/intolerance change, invoke a
   revalidatePlansFrom(person, today) seam function — a typed no-op until the plan feature
   lands, with a test asserting it is called; leave a pointer comment for REMI-034.
5. Keep v1's nag: if both lists are empty, prompt once per session to confirm "no allergies" is
   deliberate. Write audit-trail entries for every profile mutation.
Tests for all validation and vocabulary logic. Run tests only; push and open a PR through the
pipeline gates.
```
