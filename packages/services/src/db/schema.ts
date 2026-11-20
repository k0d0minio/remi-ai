import {
  boolean,
  check,
  date,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import {
  watchedPatientFields,
  type PatientChangeValue,
} from "../shared/patient-changes";
import type {
  FoodDirectiveKind,
  FoodLimitLevel,
} from "../shared/food-directives";
import type {
  MealFasting,
  MealOrientation,
  MealSlot,
} from "../shared/meal-configuration";
import type {
  DishRole,
  FoodRecordSource,
  FoodRecordStatus,
} from "../shared/food-record";
import type { FoodUnit } from "../shared/kitchen-units";
import type { ProtocolSnapshot } from "../shared/protocol-snapshot";
import type { StructuredRecipe } from "../shared/structured-recipe";

/**
 * The Drizzle schema — the single definition the checked-in migrations under
 * `./migrations` are generated from (`pnpm db:generate`).
 *
 * This is the phase-1 slice only (REMI-035): the profiles Morgane creates, the
 * recommendations she encodes into them, the notes she takes per consultation,
 * and the operator accounts she and Arnaud sign in with. The fuller V2 model
 * (care relationship, consent, AI-generation record) lands with REMI-014 and
 * must grow FROM these tables, not beside them.
 *
 * Identity is deliberately split: `pseudonym` is the working name and the only
 * name an AI provider may ever see; `full_name` is the real identity, optional,
 * and never leaves the operator/patient surfaces. Whichever way the open
 * AI-visibility question is decided, the answer is a read-site choice, not a
 * migration.
 */

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
};

export const patientProfiles = pgTable("patient_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  /**
   * The practitioner who holds the file (D-27). One per patient: the console
   * shows a practitioner their own files only. No cascade: an operator who
   * still holds files cannot be deleted, so no file is lost with an account.
   */
  practitionerId: uuid("practitioner_id")
    .notNull()
    .references(() => operators.id),
  /** The working name — the one an AI provider may later be allowed to see. */
  pseudonym: text("pseudonym").notNull(),
  /** Real identity. Optional, and never sent to an AI provider. */
  fullName: text("full_name"),
  /**
   * « Prénom » and « Nom » as the patient typed them at sign-up (story 2).
   * `full_name` holds the two joined, so every reader of it keeps working.
   * Null on a file the console created: the practitioner types one full name.
   */
  firstName: text("first_name"),
  lastName: text("last_name"),
  /** « Téléphone », digits and one leading `+`, spaces removed. Null until asked. */
  phone: text("phone"),
  email: text("email"),
  locale: text("locale").notNull().default("fr"),
  status: text("status").notNull().default("active"),
  /**
   * Where the file stands in the care (D-31): `to_complete`, `ready`,
   * `to_validate`, `active`. Text, with the values in `shared/file-status.ts`,
   * like `status`. A different fact from `status`, the retention lifecycle.
   */
  fileStatus: text("file_status").notNull().default("to_complete"),
  /**
   * Who opened the file: `practitioner` or `patient` (story 5). Text, with the
   * values in `shared/file-status.ts`. The list hides a patient's file until
   * it is `ready`. The audit trail holds the same fact, but the list would
   * need a second read per page to get it from there.
   */
  createdBy: text("created_by").notNull().default("practitioner"),
  /**
   * Birth date as a plain calendar date, not an instant: a birthday has no
   * timezone, and storing one is how an age drifts by a day across a border.
   * Age is derived at the read site and never stored.
   */
  birthDate: date("birth_date", { mode: "string" }),
  sex: text("sex").notNull().default("unspecified"),
  heightCm: integer("height_cm"),
  weightKg: doublePrecision("weight_kg"),
  /** What the accompaniment is working towards, in Morgane's words. */
  objective: text("objective").notNull().default(""),
  /**
   * A permanent filter on everything suggested — végétarien, sans gluten. Free
   * text on purpose: an enum here would freeze a vocabulary Morgane has not
   * finished inventing, and the console offers the common ones as suggestions.
   */
  dietaryRegime: text("dietary_regime").notNull().default(""),
  /**
   * Split from `constraints` because § A separates them and a recipe filter has
   * to: an allergy is a mandatory exclusion, an intolerance is comfort. Neither
   * should have to be recovered from prose.
   */
  allergies: text("allergies").notNull().default(""),
  intolerances: text("intolerances").notNull().default(""),
  /** What is left once allergies and intolerances have their own columns. */
  constraints: text("constraints").notNull().default(""),
  /** Likes, dislikes, habits, context worth cooking around. */
  preferences: text("preferences").notNull().default(""),
  /**
   * How simple a suggestion has to be, and how realistic. Nullable like the
   * consent channel: not asked yet is a different answer from "no".
   */
  likesCooking: text("likes_cooking"),
  /** « Temps disponible pour cuisiner » — three levels, nullable like the above. */
  cookingTime: text("cooking_time"),
  /**
   * Three levels since `patient-profile-edit`; free text before it. The
   * migration mapped what named a level and moved the rest into `preferences`
   * as « Budget : … », so nothing typed was lost. Nullable: not asked yet.
   */
  foodBudget: text("food_budget"),
  /**
   * Kept out of `constraints` on purpose — an interaction has to be legible at
   * a glance, not recovered from a paragraph of prose.
   */
  medications: text("medications").notNull().default(""),
  supplements: text("supplements").notNull().default(""),
  /** Who referred them, or the GP alongside the accompaniment. Free text. */
  referral: text("referral").notNull().default(""),
  /** The anamnesis-level notes behind the profile. */
  anamnesis: text("anamnesis").notNull().default(""),
  /**
   * What Morgane wants to remember to cover at the next consultation — set on
   * the working view, cleared or revised when the consultation happens
   * (`consultation-update` owns that step). Nullable: not set is the common
   * state, and the empty string is never used.
   */
  nextConsultationPrep: text("next_consultation_prep"),
  /**
   * When an operator last worked on this patient — a different fact from
   * `updated_at`, which the seam bumps on any row write including a patient
   * opening their own link. The roster sorts on this one, so a consultant
   * testing a link cannot reorder Morgane's list.
   */
  lastEditedAt: timestamp("last_edited_at", {
    withTimezone: true,
    mode: "date",
  })
    .notNull()
    .defaultNow(),
  /**
   * When the patient agreed to their record being held and to the share link
   * existing, and through which channel, as Morgane recorded it by hand. Both
   * nullable. Read-only since `consent-texts-and-records`: a consent is a row
   * of `patient_consents`, and migration 0028 copied each dated pair into one
   * `legacy` row. A later migration drops the two columns.
   *
   * The date is a plain calendar date for the same reason as `birth_date`:
   * the day someone agreed has no timezone.
   */
  consentDate: date("consent_date", { mode: "string" }),
  consentChannel: text("consent_channel"),
  /** The unguessable capability in the shareable patient link. */
  shareToken: text("share_token").notNull().unique(),
  /**
   * When the share link was last opened. Answers the only question Morgane
   * actually asks of it — did they look — without a page-view table behind it.
   */
  linkLastOpenedAt: timestamp("link_last_opened_at", {
    withTimezone: true,
    mode: "date",
  }),
  /**
   * When the patient last WROTE through the link, which is a different fact
   * from having opened it and one Morgane acts on differently: a page that was
   * read tells her nothing happened yet, a page that was written into is a
   * meal or a check-in waiting for her. Deliberately not `last_edited_at` —
   * that column means she worked on this patient and sorts her roster, and a
   * patient logging a meal must not push their own record above the one she
   * spent the morning encoding.
   */
  linkLastWroteAt: timestamp("link_last_wrote_at", {
    withTimezone: true,
    mode: "date",
  }),
  /**
   * When an owner set the retention hold on this file (`inactive-account-
   * deletion`, Morgane's question 6). Not null blocks the inactivity sweep:
   * no notice and no deletion while the hold stands. Null is no hold. The
   * audit trail records who set it and who cleared it.
   */
  retentionHoldAt: timestamp("retention_hold_at", {
    withTimezone: true,
    mode: "date",
  }),
  /**
   * Per patient-editable field, when the patient last changed it through
   * « Mon profil » — `{ allergies: "<iso>" }`. One small map rather than seven
   * timestamp columns: it only ever answers « modifié par la patiente le … »,
   * and Morgane changing a field removes its key rather than stamping a date of
   * her own. The audit trail keeps the full history; this is the current state.
   */
  patientEditedAt: jsonb("patient_edited_at")
    .$type<Record<string, string>>()
    .notNull()
    .default({}),
  /*
   * The preparatory questionnaire — story 4, `preparatory-questionnaire`. Every
   * column is nullable and has no default: null is « Non renseigné », and REMI
   * invents no answer (D-30). The keys are the constants of
   * `shared/questionnaire.ts`. Allergies and intolerances live in
   * `patient_allergens`. The free-text `allergies` and `intolerances` above
   * stay until every reader moves.
   */
  /** `female` or `male`. Never `sex`, which is an identity field. */
  sexForCalculation: text("sex_for_calculation"),
  /** One of the four NAP levels. */
  activityLevel: text("activity_level"),
  /** « Poids souhaité », optional. */
  desiredWeightKg: doublePrecision("desired_weight_kg"),
  /** « Motif de consultation », in the patient's words. */
  consultationReason: text("consultation_reason"),
  /**
   * « Date de consultation ». One date: the file shows this same one as the
   * appointment (story 4, question 5). A calendar day, like `birth_date`.
   */
  consultationDate: date("consultation_date", { mode: "string" }),
  /** One key of `diets`. */
  diet: text("diet"),
  /** The note behind the `other` diet. */
  dietNote: text("diet_note"),
  /** « Pathologies », free text (story 4, question 2). */
  pathologies: text("pathologies"),
  /**
   * « Maladie cœliaque », declared in the pathologies and never as an allergy.
   * `true` excludes gluten strictly, cross-contamination included.
   */
  celiacDisease: boolean("celiac_disease"),
  /** The gate answer: `yes` or `no_or_unknown`. Null: not answered. */
  geneticTest: text("genetic_test"),
  /**
   * The three results, in the laboratory's notation. Stored, never
   * interpreted, until Morgane validates the laboratory mapping (D-35).
   */
  apoe: text("apoe"),
  dio2: text("dio2"),
  amy1a: text("amy1a"),
  /** The answer to the practitioner's own free question. */
  practitionerQuestionAnswer: text("practitioner_question_answer"),
  /**
   * « Aucune allergie connue » / « Aucune intolérance connue ». `true` is the
   * declared absence, `false` means the patient declared rows, and null is no
   * answer. The story keeps the declared absence distinct from no answer.
   */
  noKnownAllergies: boolean("no_known_allergies"),
  noKnownIntolerances: boolean("no_known_intolerances"),
  /**
   * The practitioner's « situation particulière » (story 8): a key of
   * `specialSituations` in `shared/calculations.ts`. Null until entered: `none`
   * is an answer (D-30). `protein-needs` reads it.
   */
  specialSituation: text("special_situation"),
  /** The note behind the `other` situation. */
  specialSituationNote: text("special_situation_note"),
  ...timestamps,
});

/**
 * The patient's allergies and intolerances as story 4's checkbox lists — one row
 * per checked box, replacing the free text on the profile.
 *
 * `key` is one of `allergens` or `intolerances` (`shared/questionnaire.ts`),
 * by `kind`. `sub_key` is one of the category's sub-list, or `all` for
 * « Tous ». A category ticked with no sub-choice is written as `all`: no
 * precision excludes the whole category. A null `sub_key` written before that
 * rule reads the same as `all`. `other_text` holds the « Autre »
 * text and is null on every other row.
 *
 * The unique constraint treats nulls as equal, so one category cannot hold two
 * « whole category » rows.
 */
export const patientAllergens = pgTable(
  "patient_allergens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patientProfiles.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    key: text("key").notNull(),
    subKey: text("sub_key"),
    otherText: text("other_text"),
    ...timestamps,
  },
  (table) => [
    unique()
      .on(table.patientId, table.kind, table.key, table.subKey)
      .nullsNotDistinct(),
    check(
      "patient_allergens_kind",
      sql`${table.kind} in ('allergy', 'intolerance')`,
    ),
  ],
);

export const patientRecommendations = pgTable("patient_recommendations", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patientProfiles.id, { onDelete: "cascade" }),
  category: text("category").notNull(),
  title: text("title").notNull(),
  detail: text("detail").notNull().default(""),
  /** Rank within the category. Sparse by design — a reorder rewrites the run. */
  position: integer("position").notNull().default(0),
  /**
   * Archiving rather than deleting: a protocol that changed is history worth
   * keeping, and a patient asking "why did we stop the magnesium" is answered
   * by a row, not by a memory.
   */
  archivedAt: timestamp("archived_at", { withTimezone: true, mode: "date" }),
  ...timestamps,
});

/**
 * The prescribed supplement protocol — brainstorm § G. What Morgane prescribes,
 * as structured rows rather than the prose that lived in the profile's
 * `supplements` column (which is now "what the patient already takes, outside
 * the protocol") or, before this, in a `supplement`-category recommendation.
 *
 * One flat ordered list per patient — § G is not category-grouped the way the
 * recommendations are, so there is no `category` column, only `position`. The
 * four content columns are § G's: the supplement, the dose if one is needed,
 * the moment of intake if it matters, and why. Only `name` is required; the
 * other three default to empty, exactly as an unfilled recommendation `detail`.
 *
 * `archived_at` is the everyday exit, the recommendations' philosophy applied
 * here: a stopped supplement is history worth keeping — "pourquoi on a arrêté
 * le magnésium" is answered by a row, not by a memory. There is deliberately no
 * `started_on` column: created-at is enough, and a start date can arrive later
 * as a nullable column with no reshape if Morgane wants "depuis octobre".
 */
export const patientSupplements = pgTable("patient_supplements", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patientProfiles.id, { onDelete: "cascade" }),
  /** The supplement, as Morgane prescribes it — "Magnésium bisglycinate". */
  name: text("name").notNull(),
  /** The dose, if one is needed — "300 mg". */
  dose: text("dose").notNull().default(""),
  /** The moment of intake, if it matters — "le soir, au coucher". */
  timing: text("timing").notNull().default(""),
  /** Why it is prescribed — the § G justification. */
  reason: text("reason").notNull().default(""),
  /** Rank within the patient's protocol. Sparse — a reorder rewrites the run. */
  position: integer("position").notNull().default(0),
  archivedAt: timestamp("archived_at", { withTimezone: true, mode: "date" }),
  ...timestamps,
});

/**
 * One dated note per consultation — the history that accumulates before the
 * December launch. Never rendered on the patient link: this is Morgane's
 * working record, written in clinical shorthand for herself.
 */
export const patientNotes = pgTable("patient_notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patientProfiles.id, { onDelete: "cascade" }),
  /** The consultation's date, which is not the date the note was typed. */
  occurredAt: date("occurred_at", { mode: "string" }).notNull(),
  title: text("title").notNull().default(""),
  body: text("body").notNull().default(""),
  /**
   * Denormalised on purpose, like the audit trail's actor: the note outlives
   * the account that wrote it, and "who saw this patient" must survive an
   * operator being removed.
   */
  authorName: text("author_name").notNull().default(""),
  ...timestamps,
});

/**
 * One row per (patient, category) across § B's twelve areas of enquiry — the
 * anamnesis as twelve addressable slots rather than one paragraph.
 *
 * A category with nothing recorded has NO row: the service deletes rather than
 * storing an empty body, so "never explored" and "explored, nothing to note"
 * are the same cheap state, which is what Morgane means by leaving a category
 * blank. Never rendered on the patient link, under the same rule as
 * `patient_notes`.
 *
 * The category is stored as its key rather than modelled as twelve columns, so
 * trimming or renaming one is a constants edit and not a migration — and so the
 * later AI round can write a drafted body into the same row a correction
 * overwrites.
 */
export const patientAnamnesis = pgTable(
  "patient_anamnesis",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patientProfiles.id, { onDelete: "cascade" }),
    /** A key from `anamnesisCategories` in `shared/patient.ts`. */
    category: text("category").notNull(),
    body: text("body").notNull().default(""),
    ...timestamps,
  },
  (table) => [unique().on(table.patientId, table.category)],
);

/**
 * The two or three things this accompaniment is working on — brainstorm § D.
 *
 * A goal is her words plus an optional starting point, and its rank in her
 * priority order. `archived_at` is the everyday exit: § D's philosophy is the
 * recommendations' one, so "pourquoi on a arrêté celui-là" is answered by a
 * row rather than by a memory.
 *
 * The 2-3 active maximum § D states is enforced in the service, not by a
 * constraint here: it counts active rows per patient, which is a query, and a
 * rule Morgane may want relaxed should not need a migration to relax.
 */
export const patientGoals = pgTable("patient_goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patientProfiles.id, { onDelete: "cascade" }),
  /** The goal as she says it — "améliorer l'énergie". */
  title: text("title").notNull(),
  /**
   * The simple starting point to compare against later — "énergie 3/10", "3
   * réveils par nuit". Free text, not a number: § D's measure is whatever she
   * writes, and a numeric column would freeze a scale nobody has agreed.
   */
  baseline: text("baseline").notNull().default(""),
  /** Her priority order. Sparse by design — a reorder rewrites the run. */
  position: integer("position").notNull().default(0),
  archivedAt: timestamp("archived_at", { withTimezone: true, mode: "date" }),
  ...timestamps,
});

/**
 * One dated observation against one goal — the manual seed of § D's evolution
 * trail, and of the PROGRESS block the later AI round writes into.
 *
 * `checked_on` is a plain calendar date for the same reason as `birth_date`:
 * the day of a follow-up has no timezone, and storing one is how a check-in
 * drifts across a border.
 *
 * All three content columns are optional because § D gives the direction and
 * the measure as alternatives; that at least one is present is the service's
 * rule, since "a row that says nothing" is a validation question, not a shape.
 */
export const patientGoalCheckIns = pgTable(
  "patient_goal_check_ins",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    goalId: uuid("goal_id")
      .notNull()
      .references(() => patientGoals.id, { onDelete: "cascade" }),
    checkedOn: date("checked_on", { mode: "string" }).notNull(),
    /** A key from `goalDirections` in `shared/patient.ts`, or nothing. */
    direction: text("direction"),
    /** The simple measure on the day — "4/10", "presque plus de réveils". */
    measure: text("measure").notNull().default(""),
    note: text("note").notNull().default(""),
    /**
     * A key from `writtenByKinds`. Morgane's consultation check-in and the
     * patient's own in-page answer share this table, and the console needs to
     * tell them apart; the default is what every row predating the link's write
     * path was.
     */
    writtenBy: text("written_by").notNull().default("practitioner"),
    /**
     * The patient's weekly 0–5 — how the week went for this goal (her 14 Sept
     * § 1, decisions D-30 and D-31). Only the patient's own check-in writes
     * one; her consultation rows keep the free-text measure and leave it null.
     */
    score: integer("score"),
    /**
     * When she acknowledged a patient's lower score (D-33). Null on every row
     * she has not marked « vu », which only matters on a patient-written
     * `worse` row: that is the one kind that waits for her.
     */
    seenAt: timestamp("seen_at", { withTimezone: true, mode: "date" }),
    ...timestamps,
  },
  (table) => [
    check(
      "patient_goal_check_ins_score_range",
      sql`${table.score} is null or (${table.score} >= 0 and ${table.score} <= 5)`,
    ),
  ],
);

/**
 * The standing consigne Morgane steers by — brainstorm § E.
 *
 * Many rows per patient, exactly one of them active: replacing the instruction
 * archives the current row and inserts a new one, so "what was I steering by in
 * October" survives the November rewrite. That one-active rule lives in the
 * service rather than in a partial unique index, because § E's shape is the
 * open question — if she turns out to want several concurrent consignes, this
 * table already holds them.
 *
 * Today nothing reads it but the console. In the AI round it becomes the
 * generation prompt's practitioner line, which is a new reader of the same
 * column, not a new table.
 */
export const patientInstructions = pgTable("patient_instructions", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patientProfiles.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  /**
   * The same week's consigne written TO the patient, rendered on the link's
   * home. Null when she has written only the REMI-facing line above: the two
   * are independent, and the home shows nothing rather than falling back to
   * `body`, which is addressed to REMI and would read as a note about the
   * patient rather than to them.
   */
  patientBody: text("patient_body"),
  /** Set when a replacement supersedes it. Null on the one in force. */
  archivedAt: timestamp("archived_at", { withTimezone: true, mode: "date" }),
  ...timestamps,
});

/**
 * The one habit Morgane is running with a patient at a time — « Boire 1,5 L
 * d'eau par jour », « Manger plus lentement » (her 14 Sept document, § 2).
 *
 * A challenge is written to the patient, not to REMI, and it has a lifecycle
 * the standing instruction does not: it opens, the patient says when it is
 * acquired and when they are ready for the next, and she closes it with an
 * outcome. So it is a table of its own rather than a column on
 * `patient_instructions` — the consigne stays what it is.
 *
 * At most one open row per patient, and here the rule IS a partial unique
 * index, unlike the instruction's: she settled one-at-a-time (decision D-25),
 * and a replacement that closes the current row and opens the next inside one
 * transaction must never leave two open under a concurrent double submit.
 *
 * `acquired_at` and `ready_for_next_at` are the patient's two taps, written
 * through the link. They need no `written_by`: only the patient ever sets
 * them, and the audit trail carries the `patient` actor on every change.
 */
export const patientChallenges = pgTable(
  "patient_challenges",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patientProfiles.id, { onDelete: "cascade" }),
    /** One sentence, as she says it to the patient. */
    text: text("text").notNull(),
    /** Why this habit, for the patient. Empty when she gives none. */
    why: text("why").notNull().default(""),
    /** A day, not an instant — the same reasoning as `checked_on`. */
    startedOn: date("started_on", { mode: "string" }).notNull(),
    /** Null while the challenge is the current one. */
    closedOn: date("closed_on", { mode: "string" }),
    /** A key from `challengeOutcomes`; null while open, set on close. */
    outcome: text("outcome"),
    /** « Challenge acquis » — the patient's first tap. */
    acquiredAt: timestamp("acquired_at", { withTimezone: true, mode: "date" }),
    /** « Prêt(e) pour le prochain » — only ever set after `acquired_at`. */
    readyForNextAt: timestamp("ready_for_next_at", {
      withTimezone: true,
      mode: "date",
    }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("patient_challenges_one_open")
      .on(table.patientId)
      .where(sql`${table.closedOn} is null`),
  ],
);

/**
 * The one general thread between a patient and Morgane — her 14 Sept document,
 * § 6: « un endroit très simple où le consultant peut laisser un commentaire
 * général ». One thread per patient, so there is no thread table: every row
 * belongs to its patient's only conversation, newest first.
 *
 * Append-only. Neither side edits or deletes a message; the thread goes with
 * the patient (cascade), and RETENTION says so.
 *
 * `read_at` is only ever set on the patient's rows — it is what the console's
 * « N messages attendent une réponse » counts, and a reply or « Marquer comme
 * lu » is what sets it (decision D-37). Her own replies carry the operator who
 * wrote them, because the link names the practitioner under each reply and
 * nothing else on the patient's page knows her name; `set null` keeps the
 * reply readable if that account is ever removed.
 */
export const patientMessages = pgTable(
  "patient_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patientProfiles.id, { onDelete: "cascade" }),
    /** A key from `writtenByKinds` — the patient, or her reply. */
    author: text("author").notNull(),
    /** Plain text, as typed. */
    body: text("body").notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    /** Null on a patient message she has not yet read; always null on hers. */
    readAt: timestamp("read_at", { withTimezone: true, mode: "date" }),
    /** Who replied — null on the patient's rows. */
    operatorId: uuid("operator_id").references(() => operators.id, {
      onDelete: "set null",
    }),
    ...timestamps,
  },
  (table) => [index().on(table.patientId)],
);

/**
 * The automatic calculations of a patient — stories 7, 8 and 9. One row per
 * patient and kind (`bmi`, `protein`, `energy`, the keys of
 * `calculationKinds`). The estimate REMI computes and the value the
 * practitioner validates are separate columns, each with the parameters it
 * came from (D-30). A validation writes `calculation.validated` to the audit
 * trail (D-32). The rows go with the patient (`on delete cascade`).
 */
export const patientCalculations = pgTable(
  "patient_calculations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patientProfiles.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    estimatedValue: doublePrecision("estimated_value"),
    estimateParameters: jsonb("estimate_parameters").$type<
      Record<string, unknown>
    >(),
    estimatedAt: timestamp("estimated_at", {
      withTimezone: true,
      mode: "date",
    }),
    validatedValue: doublePrecision("validated_value"),
    validationParameters: jsonb("validation_parameters").$type<
      Record<string, unknown>
    >(),
    validatedAt: timestamp("validated_at", {
      withTimezone: true,
      mode: "date",
    }),
    /** The operator who validated. No foreign key, like `audit_events`. */
    validatedBy: uuid("validated_by"),
    needsRevalidation: boolean("needs_revalidation").notNull().default(false),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("patient_calculations_patient_kind_idx").on(
      table.patientId,
      table.kind,
    ),
    check(
      "patient_calculations_kind_check",
      sql`${table.kind} in ('bmi', 'protein', 'energy')`,
    ),
  ],
);

/**
 * The living summary — brainstorm § C's PATIENT_SUMMARY, written by Morgane
 * now and drafted by the AI later.
 *
 * One row per patient, revised in place: § C's synthesis is the current state
 * of the file, and the consultation notes already carry its history, so there
 * is no archive here (owner decision, `.icm/intake/patient-record/breakdown.md`
 * § Decisions #7). The `patient_id` unique constraint is that "one living
 * summary per patient" rule expressed in the schema — a second write updates
 * the row rather than adding one.
 *
 * It is the first record block patient-visible by design (§ J), but nothing
 * renders it at the link this round — that is the `patient-surface` epic's. The
 * AI round wants draft-vs-validated state on this content; that lands as columns
 * beside `body`, not a re-model, which is why the summary has its own row rather
 * than a column on `patient_profiles`.
 */
export const patientSummaries = pgTable("patient_summaries", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id")
    .notNull()
    .unique()
    .references(() => patientProfiles.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  ...timestamps,
});

/**
 * The account a patient signs in with — story 2, D-26, D-28. One row per
 * patient file: the account is made once and kept after activation, which only
 * sets `activated_at` (story 19).
 *
 * `auth_subject` is the auth adapter's user id, kept as text and not as a
 * foreign key: the identity store is the adapter's, and nothing here names it.
 * `email` is unique across the whole table, not per practitioner, because the
 * identity store holds one user per address (Jamie, 2026-11-01). The service
 * lower-cases it before every write and read.
 */
export const patientAccounts = pgTable("patient_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientProfileId: uuid("patient_profile_id")
    .notNull()
    .unique()
    .references(() => patientProfiles.id, { onDelete: "cascade" }),
  email: text("email").notNull().unique(),
  authSubject: text("auth_subject").notNull().unique(),
  activatedAt: timestamp("activated_at", { withTimezone: true, mode: "date" }),
  /**
   * When the patient last signed in, or last opened the app with a live
   * session (`inactive-account-deletion`). The sign-in writes it every time.
   * A session writes it at most once a day. With the patient's latest write in
   * `audit_events`, it is the start of the inactivity clock.
   */
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true, mode: "date" }),
  /**
   * When the inactivity sweep sent the notice of deletion. Null when no notice
   * is in force: the sweep clears it when the patient comes back after it.
   * It is also what stops a second notice on a second run.
   */
  inactivityNoticeSentAt: timestamp("inactivity_notice_sent_at", {
    withTimezone: true,
    mode: "date",
  }),
  ...timestamps,
});

/**
 * A one-time link that lets a patient take over a file their practitioner
 * created (`patient-takes-over-file`, story 1). `activation` goes out in the
 * activation e-mail. `claim` answers a sign-up with the e-mail of such a file.
 *
 * The token is stored hashed, as `operator_invitations` does: it is a
 * credential that mints an account, so a dump of this table must not be a set
 * of working links. `used_at` set or `expires_at` past: the link is spent.
 */
export const patientFileClaims = pgTable("patient_file_claims", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientProfileId: uuid("patient_profile_id")
    .notNull()
    .references(() => patientProfiles.id, { onDelete: "cascade" }),
  /** `activation` or `claim`: values in `shared/file-claim.ts`. */
  purpose: text("purpose").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true, mode: "date" }),
  ...timestamps,
});

/**
 * Each consent decision of a patient — story 3, D-32. Append-only: no service
 * updates or deletes a row, and the latest row per key is the answer.
 *
 * The text is named three ways: its version, the language shown, and the
 * SHA-256 of the file the patient read (`src/consent/texts/`). The hash proves
 * the wording even if a file were ever edited by mistake.
 *
 * Migration 0028 wrote one `legacy` row per profile with a `consent_date`,
 * from the two hand-filled columns of `patient_profiles`. Those rows have no
 * locale and no hash. `channel` keeps the channel Morgane recorded.
 *
 * The rows go with the patient (`on delete cascade`), as `RETENTION.md` says.
 */
export const patientConsents = pgTable(
  "patient_consents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    patientProfileId: uuid("patient_profile_id")
      .notNull()
      .references(() => patientProfiles.id, { onDelete: "cascade" }),
    /** A key of `consentKeys`. */
    consentKey: text("consent_key").notNull(),
    /** `1`, `2`, … or `legacy`. */
    textVersion: text("text_version").notNull(),
    textLocale: text("text_locale"),
    textHash: text("text_hash"),
    decision: text("decision").notNull(),
    /** `app`, or the hand-recorded channel of a `legacy` row. */
    channel: text("channel"),
    decidedAt: timestamp("decided_at", {
      withTimezone: true,
      mode: "date",
    }).notNull(),
    /** A key of `auditActorKinds`: who took the decision. */
    actorKind: text("actor_kind").notNull(),
    ...timestamps,
  },
  (table) => [
    index("patient_consents_patient_key_idx").on(
      table.patientProfileId,
      table.consentKey,
      table.decidedAt,
    ),
    check(
      "patient_consents_decision_check",
      sql`${table.decision} in ('given', 'refused', 'withdrawn')`,
    ),
  ],
);

/**
 * The short list of foods worth keeping in the placard and the frigo, chosen
 * for this patient — brainstorm § H. An item is a name and a why, and that is
 * the whole design: § H warns explicitly against per-item quantity, season or
 * nutrient fields, so their absence here is the rule, not an omission.
 *
 * Placard vs frigo is § H's framing, not its data. The list is flat until
 * Morgane says she thinks in sections; if she does, that is one optional label
 * column, never a taxonomy.
 */
export const patientPantryEssentials = pgTable("patient_pantry_essentials", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patientProfiles.id, { onDelete: "cascade" }),
  /** The food, as Morgane writes it — "sardines", not a catalogue entry. */
  item: text("item").notNull(),
  /** Why it is on *this* patient's list — "oméga-3, et tu aimes ça". */
  why: text("why").notNull().default(""),
  /** Her order for the list. Sparse by design — a reorder rewrites the run. */
  position: integer("position").notNull().default(0),
  /**
   * A list refresh archives what dropped off rather than deleting it: the
   * trail of what changed between consultations is part of the record, the
   * same reasoning as the recommendations above.
   */
  archivedAt: timestamp("archived_at", { withTimezone: true, mode: "date" }),
  ...timestamps,
});

/**
 * The shared recipe library — brainstorm § I.
 *
 * The one table in the estate that belongs to no patient, and that is the
 * decision of record (#5): Morgane reuses the same dish across her 10-15
 * patients and personalises the *giving*, not the dish. Per-patient rows would
 * have her retyping the same recipe five times and leave five versions of it to
 * fix when one changes.
 *
 * `body` is prose, one field: the form of the recipes of before REM-90. Since
 * REM-90 (stories 24 and 25) a recipe also has `content`, the structured
 * recipe that the recipe page, the shopping list and the weekly plan read. A
 * recipe of the old form keeps its body and has `content` null.
 *
 * The library is the template base of the generation (D-34). Only a row with
 * `verified_at` set feeds the generation.
 */
export const recipes = pgTable("recipes", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  /** Ingredients and steps as she writes them — prose, not a structure. */
  body: text("body").notNull().default(""),
  /**
   * Free text, and deliberately no taxonomy. § I mentions season and régime as
   * things she filters on, but which tags she actually uses is hers to answer,
   * so the library filters on whatever exists rather than on an enum invented
   * here. A stable set can be promoted to a closed vocabulary later.
   */
  tags: text("tags").array().notNull().default([]),
  /**
   * A recipe patients hold cannot be removed from the record, so the library
   * archives and never deletes — the restrict below is what enforces it.
   */
  archivedAt: timestamp("archived_at", { withTimezone: true, mode: "date" }),
  /**
   * Where a variant came from. Null for a recipe written from scratch, and for
   * every row that predates the column — provenance is not reconstructible, so
   * a blank here means "unknown", never "original".
   *
   * `restrict` for the same reason the assignment's recipe FK is: the library
   * never deletes, and a row that other rows point back to is exactly the kind
   * the rule exists for. The self-reference needs the `AnyPgColumn` annotation
   * because the table is still being defined at this point.
   */
  variantOfId: uuid("variant_of_id").references((): AnyPgColumn => recipes.id, {
    onDelete: "restrict",
  }),
  /**
   * The structured recipe (`shared/structured-recipe.ts`), or null for a
   * recipe of the old prose form. The zod schema is the one definition of the
   * shape: a reader parses the value and never trusts it.
   */
  content: jsonb("content").$type<StructuredRecipe>(),
  /**
   * When a practitioner marked the recipe « vérifiée », or null. Only an
   * explicit act sets it, and an edit of the recipe sets it back to null.
   */
  verifiedAt: timestamp("verified_at", { withTimezone: true, mode: "date" }),
  /**
   * Who verified. No foreign key, as on `app_settings`: the record of who
   * verified stays when the account is removed. The name is beside it for the
   * same reason.
   */
  verifiedById: uuid("verified_by_id"),
  verifiedByName: text("verified_by_name").notNull().default(""),
  ...timestamps,
});

/**
 * One recipe that REMI generated for one patient — REM-90, story 24.
 *
 * The row is patient data: it goes with the patient. It names the verified
 * template of the library that it started from (D-34). The template cannot be
 * deleted: the library archives.
 *
 * The day and the meal are the weekly plan. A patient has one recipe at most
 * for one day and one meal, and there is no separate plan table (Jamie,
 * 2026-11-20).
 */
export const patientRecipes = pgTable(
  "patient_recipes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patientProfiles.id, { onDelete: "cascade" }),
    templateId: uuid("template_id")
      .notNull()
      .references(() => recipes.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    content: jsonb("content").$type<StructuredRecipe>().notNull(),
    /** The day in Europe/Brussels, as a calendar date. */
    plannedOn: date("planned_on", { mode: "string" }).notNull(),
    /** `breakfast`, `lunch`, `snack` or `dinner`. */
    meal: text("meal").$type<MealSlot>().notNull(),
    generatedAt: timestamp("generated_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("patient_recipes_patient_day_meal_idx").on(
      table.patientId,
      table.plannedOn,
      table.meal,
    ),
    check(
      "patient_recipes_meal_check",
      sql`${table.meal} in ('breakfast', 'lunch', 'snack', 'dinner')`,
    ),
  ],
);

/**
 * One recipe given to one patient — the half of § I that is personal.
 *
 * The weekly refresh is this table: each week Morgane assigns the new
 * inspirations and archives what rotates out, and the dated trail *is* the
 * WEEKLY_ADAPTATION record (§ 8) the AI round will later learn from. So the
 * same recipe may be assigned to the same patient many times over the months —
 * that repetition is the history, not a duplicate — and no unique constraint
 * stands in its way. What the service refuses is a second *active* assignment
 * of one recipe to one patient.
 *
 * The two foreign keys differ on purpose: deleting a patient takes their
 * assignments with them, while a recipe cannot be deleted at all while anyone
 * holds it.
 */
export const patientRecipeAssignments = pgTable("patient_recipe_assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patientProfiles.id, { onDelete: "cascade" }),
  recipeId: uuid("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "restrict" }),
  /** « Pourquoi pour toi » — § H's justification logic, applied to recipes. */
  note: text("note").notNull().default(""),
  /**
   * The day she gave it, as a calendar date rather than an instant: "the week
   * of the 8th" is the unit here, and a timestamp would drift across a border.
   */
  assignedOn: date("assigned_on", { mode: "string" }).notNull(),
  /** Set when the recipe rotates out, which is the refresh, not a deletion. */
  archivedAt: timestamp("archived_at", { withTimezone: true, mode: "date" }),
  ...timestamps,
});

/**
 * A document Morgane put on a patient's page — her recipe PDFs, the
 * personalised list of fifteen foods, a meal feedback — or a link to one
 * (her 14 Sept document, § 3 option 2 and § 4; decision D-18).
 *
 * A file row holds the key of a private object in the file store, never a URL:
 * the patient reads it through a five-minute signed link the web app issues
 * after checking the token. A link row holds the URL and nothing of the store.
 * The check below keeps the two shapes apart, so no row is half of each.
 *
 * It attaches to at most one parent — one of the patient's goals, or one of
 * their recipe assignments (the assignment, not the library recipe, so it
 * stays this patient's) — and `set null` on both is decision D-26: deleting
 * the goal or the assignment leaves the document on the patient, unattached.
 * The patient cascade removes the rows; the files themselves are removed from
 * the store by `deletePatient` before the row goes, because a cascade cannot
 * reach outside the database.
 *
 * `added_by_email` is text rather than a key, the same reasoning as the
 * invitation's `invited_by_email`: who added it should outlive the account.
 */
export const patientDocuments = pgTable(
  "patient_documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patientProfiles.id, { onDelete: "cascade" }),
    /** A key from `documentKinds` — `file` or `link`. */
    kind: text("kind").notNull(),
    /** A key from `documentTags` — `document` or `recipe`. */
    tag: text("tag").notNull().default("document"),
    title: text("title").notNull(),
    /** Links only. */
    url: text("url"),
    /** Files only — the object's key in the store, under the patient's prefix. */
    blobKey: text("blob_key"),
    /** Files only — one of `documentFileTypes`. */
    mime: text("mime"),
    /** Files only — bytes, as the store measured them. */
    size: integer("size"),
    goalId: uuid("goal_id").references(() => patientGoals.id, {
      onDelete: "set null",
    }),
    recipeAssignmentId: uuid("recipe_assignment_id").references(
      () => patientRecipeAssignments.id,
      { onDelete: "set null" },
    ),
    addedByEmail: text("added_by_email").notNull().default(""),
    /** A day at the practice — what the patient sees beside the title. */
    addedOn: date("added_on", { mode: "string" }).notNull(),
    ...timestamps,
  },
  (table) => [
    index("patient_documents_patient").on(table.patientId),
    check(
      "patient_documents_shape",
      sql`(${table.kind} = 'file' and ${table.blobKey} is not null and ${table.url} is null) or (${table.kind} = 'link' and ${table.url} is not null and ${table.blobKey} is null)`,
    ),
    check(
      "patient_documents_one_parent",
      sql`${table.goalId} is null or ${table.recipeAssignmentId} is null`,
    ),
  ],
);

/**
 * One meal, transcribed — the § 5 loop, with both halves of the exchange on one
 * row.
 *
 * Text only, and that is decision #6 rather than a gap: photos stay in WhatsApp
 * until a blob-storage vendor is chosen, which is an owner decision and creates
 * a files seam when it is made. There is deliberately no `photo_url` here
 * waiting to be filled — a column nothing writes is a promise the schema cannot
 * keep. When the vendor exists, a nullable reference is an additive migration.
 *
 * The feedback lives here rather than in a table of its own because it is 1:1
 * with the meal and always Morgane's. A second table would buy a draft/published
 * split that nothing needs yet; when the AI round drafts feedback it adds a
 * column or a drafts table beside this one, which is additive either way.
 */
export const patientMealEntries = pgTable("patient_meal_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patientProfiles.id, { onDelete: "cascade" }),
  /**
   * The day of the meal, not of the transcription: she logs Tuesday's lunch on
   * Thursday evening, and it is Tuesday the entry belongs to. A calendar date
   * rather than an instant, the same reasoning as `assigned_on` above.
   */
  eatenOn: date("eaten_on", { mode: "string" }).notNull(),
  /**
   * Nullable, and null is a first-class state rather than missing data — an
   * entry with no slot renders and sorts like any other. The four keys are
   * stable; their French labels live in the console's `vocabulary.ts`, so
   * changing Morgane's words is an edit there, never a migration.
   */
  slot: text("slot"),
  /** What was eaten, her transcription of the photo or the message. */
  description: text("description").notNull(),
  /** The patient's own words when there were any — their voice, not hers. */
  patientComment: text("patient_comment").notNull().default(""),
  /** § 5 step 3: what is already good, plus one or two priorities. Short. */
  feedback: text("feedback").notNull().default(""),
  /**
   * Set when feedback is first written, cleared when it is emptied. It is what
   * marks the week's backlog in the console, and what `patient-link-segments`
   * will read to decide whether an unanswered meal appears on the link.
   */
  feedbackWrittenAt: timestamp("feedback_written_at", {
    withTimezone: true,
    mode: "date",
  }),
  /** § 5 step 4's « mémorisation utile », noticed on this meal. */
  learning: text("learning").notNull().default(""),
  /** Archive, never delete: a meal she answered stays in the record. */
  archivedAt: timestamp("archived_at", { withTimezone: true, mode: "date" }),
  /**
   * A key from `writtenByKinds` — her transcription, or the patient's own
   * entry through the link. `description` is prose either way, so without this
   * column nothing downstream can tell whose words they are, and the AI round
   * has to.
   */
  writtenBy: text("written_by").notNull().default("practitioner"),
  /**
   * A key from `mealIntents` — « Je vais manger » or « J'ai mangé » (§ 8).
   * Defaults to `eaten` because that is what every row written before the
   * patient could enter one actually was: a meal Morgane transcribed after
   * the fact. A planned row is updated in place when the meal happens.
   */
  intent: text("intent").notNull().default("eaten"),
  ...timestamps,
});

/**
 * What Morgane notices about a patient that belongs to no single meal.
 *
 * Reviewing a week produces both kinds — "elle prend toujours des yaourts
 * sucrés le matin" attaches to nothing in particular — and forcing those onto
 * an arbitrary entry would falsify where they came from. So the learnings view
 * reads two tables, and the only difference visible in it is whether a learning
 * carries its meal.
 */
export const patientObservations = pgTable("patient_observations", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patientProfiles.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  /** The day she noticed it — backdatable, like a meal. */
  observedOn: date("observed_on", { mode: "string" }).notNull(),
  archivedAt: timestamp("archived_at", { withTimezone: true, mode: "date" }),
  ...timestamps,
});

export const operators = pgTable("operators", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  /**
   * `admin` manages accounts and may open any file with a reason, read-only.
   * `practitioner` holds its own files only (D-27). The column defaults to the
   * lesser role so an invite cannot accidentally mint an admin. Migration 0036
   * renamed `owner` to `admin` and `operator` to `practitioner`.
   */
  role: text("role").notNull().default("practitioner"),
  /**
   * The practitioner's permanent sign-up link (story 1). A patient who signs
   * up through `/inscription/<token>` is attached to this practitioner.
   *
   * Stored in plaintext, unlike an invitation token: the console shows the
   * link again on every visit, and a hash cannot. The token grants no access.
   * It only names a practitioner. Nothing rewrites it: a password change or a
   * sign-out leaves it as it is.
   *
   * The default is the migration's backfill, and it also covers an insert by
   * a deployment that predates the column. It draws 24 random bytes from two
   * `gen_random_uuid()` calls (no extension needed) and writes them as 32
   * base64url characters, the shape `createOperator` generates.
   */
  signupLinkToken: text("signup_link_token")
    .notNull()
    .unique()
    .default(
      sql`translate(encode(decode(substr(replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''), 1, 48), 'hex'), 'base64'), '+/', '-_')`,
    ),
  /**
   * The order of the practitioner's patient list (story 5): `appointment` or
   * `name`, from `patientListSorts`. Text with the set in code, like `role`.
   * The default is Morgane's first sort and covers the existing operators.
   */
  patientListSort: text("patient_list_sort").notNull().default("appointment"),
  ...timestamps,
});

/**
 * A pending operator invitation. The token is stored **hashed**: it is a
 * credential that mints an account, so a database dump must not be a set of
 * working invite links. The plaintext exists once, in the email and the link
 * shown to the inviter, and is never persisted.
 */
export const operatorInvitations = pgTable("operator_invitations", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  name: text("name").notNull().default(""),
  role: text("role").notNull().default("practitioner"),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
  acceptedAt: timestamp("accepted_at", { withTimezone: true, mode: "date" }),
  /** Kept as text, not a foreign key — the trail survives the inviter leaving. */
  invitedByEmail: text("invited_by_email").notNull().default(""),
  ...timestamps,
});

/**
 * A named set of protocol rows an operator saves once and inserts into any
 * patient — « Base anti-inflammatoire », « Compléments fatigue ».
 *
 * The one table `reuse-and-duplicate` adds, and deliberately the *only* one:
 * brainstorm § 7 rules out an exhaustive practitioner base, so the rows are a
 * JSON blob rather than a normalised catalogue nothing else points at. They are
 * read back tolerantly (`shared/protocol-reuse.ts`) — a field a stored row does
 * not carry comes back empty, exactly as the columns themselves default — so a
 * change to a row shape needs neither a migration nor a version in the blob.
 *
 * `operator_id` is the key because a template is personal until she says
 * otherwise: `shared` flips it to visible for every operator, and only the
 * owner renames, overwrites, deletes or un-shares it. The cascade is right
 * here in a way it is not for the audit trail — a departed operator's private
 * sets are hers, and nothing else references them.
 *
 * Recipes are absent on purpose. A named set of library recipes is a patient
 * group in disguise, and groups are parked in `beyond-december/patient-groups`.
 */
export const protocolTemplates = pgTable("protocol_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  operatorId: uuid("operator_id")
    .notNull()
    .references(() => operators.id, { onDelete: "cascade" }),
  /** A key from `protocolTemplateKinds` — recommendation, supplement, pantry. */
  kind: text("kind").notNull(),
  /**
   * How she named the set. Uniqueness per operator per kind is the service's
   * rule, not a constraint here — `saveProtocolTemplate` looks the name up and
   * overwrites. A database-level unique index would be the stronger answer and
   * is parked as `triage/protocol-template-name-unique-index`.
   */
  name: text("name").notNull(),
  /** The rows as she adapted them, each a `ProtocolRow`. Read tolerantly. */
  rows: jsonb("rows").notNull(),
  /** Private until she shares it; shared sets are listed for every operator. */
  shared: boolean("shared").notNull().default(false),
  ...timestamps,
});

/**
 * The audit trail. `apps/admin/AGENTS.md` requires that destructive operations
 * record who did what; this is that record, and it covers every write worth
 * explaining, not only the destructive ones.
 *
 * The actor is denormalised to an email and a name because the whole point of
 * a trail is that it still reads after the account is gone. Nothing here is a
 * foreign key for the same reason — a cascade delete would erase the evidence
 * of the deletion.
 */
export const auditEvents = pgTable("audit_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  /**
   * A key from `auditActorKinds`. Explicit rather than inferred: a patient
   * writing through their link has no account and so no email, and an empty
   * email is exactly what a system write leaves too. The default is what every
   * row written before the link accepted writes was.
   */
  actorKind: text("actor_kind").notNull().default("operator"),
  actorId: uuid("actor_id"),
  actorEmail: text("actor_email").notNull().default(""),
  actorName: text("actor_name").notNull().default(""),
  action: text("action").notNull(),
  targetType: text("target_type").notNull().default(""),
  targetId: text("target_id"),
  /** How the target read at the time — a pseudonym, an email, a title. */
  targetLabel: text("target_label").notNull().default(""),
  detail: text("detail").notNull().default(""),
  ...timestamps,
});

/**
 * CIQUAL — ANSES's food-composition table, imported as reference data.
 *
 * Not patient data: no care-relationship scoping, no audit trail, no cascade.
 * It is a public dataset (Etalab 2.0) that the recipe step queries, and the
 * three tables below are shaped by the one constraint the storage seam imposes:
 * `Collection.findMany` takes an exact-match filter and nothing else, so there
 * is no join to lean on. Group and component names are therefore denormalised
 * onto the rows that display them. That is the seam's shape, not a shortcut.
 */
export const foods = pgTable("foods", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** CIQUAL's own `alim_code` — the natural key the import upserts on. */
  code: text("code").notNull().unique(),
  nameFr: text("name_fr").notNull(),
  nameEn: text("name_en").notNull().default(""),
  /**
   * `name_fr` lowercased with its accents stripped. Search matches on this
   * rather than on a Postgres collation or the `unaccent` extension, so the
   * in-memory client the service tests run against behaves identically to Neon
   * — the seam is only honest if both sides answer the same question.
   */
  searchName: text("search_name").notNull(),
  groupCode: text("group_code").notNull(),
  groupNameFr: text("group_name_fr").notNull(),
  subGroupCode: text("sub_group_code").notNull().default(""),
  subGroupNameFr: text("sub_group_name_fr").notNull().default(""),
  ...timestamps,
});

/**
 * One food's value for one component, per 100 g.
 *
 * CIQUAL's `teneur` is not always a number: 83 246 cells read `-` (not
 * determined), 2 514 read `traces`, and some seventeen thousand read `< x`
 * (below the limit of quantification). Coercing those to 0 would silently rank
 * an unmeasured food alongside a measured one, so the marker is stored beside
 * the value and `raw_value` keeps the publisher's own string.
 */
export const foodNutrients = pgTable(
  "food_nutrients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** CIQUAL's `alim_code`, not our uuid — the importer works in CIQUAL's keys. */
    foodCode: text("food_code").notNull(),
    componentCode: text("component_code").notNull(),
    componentNameFr: text("component_name_fr").notNull(),
    unit: text("unit").notNull().default(""),
    /** Null when the marker is `not_determined` — absent, not zero. */
    value: doublePrecision("value"),
    /** `exact` | `traces` | `less_than` | `not_determined`. */
    marker: text("marker").notNull().default("exact"),
    rawValue: text("raw_value").notNull().default(""),
    /** CIQUAL's confidence code: A, B, C or D. */
    confidence: text("confidence").notNull().default(""),
    ...timestamps,
  },
  (table) => [
    unique().on(table.foodCode, table.componentCode),
    // A rank reads one component's column across every food — 3 484 rows out
    // of 257 816. Without this it is a sequential scan per ranked component.
    index().on(table.componentCode),
  ],
);

/**
 * One row per run of the import script: which edition landed, how much of it,
 * and the checksums of the files it came from.
 *
 * The console reads the newest row to say « N aliments importés », and the
 * checksums are what tells a later operator whether the database holds the
 * export they have in their hands.
 */
export const ciqualImports = pgTable("ciqual_imports", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** The publisher's edition label, e.g. "Ciqual 2025". */
  edition: text("edition").notNull(),
  foodCount: integer("food_count").notNull().default(0),
  nutrientCount: integer("nutrient_count").notNull().default(0),
  /** `<file>:<sha256>` per source file, newline-separated. */
  sourceChecksums: text("source_checksums").notNull().default(""),
  ...timestamps,
});

/**
 * The record of one CIQUAL food — REM-189 and REM-190. One row for each food
 * that REMI proposed or that a person entered. A food with no row has no
 * record.
 *
 * Reference data as the three CIQUAL tables are: no patient data. The key is
 * CIQUAL's `alim_code`. It has no foreign key to `foods.code`, as
 * `food_nutrients.food_code` has none: the importer works in CIQUAL's keys.
 *
 * Two parts, each with its own status and its own confirmation: the record
 * (« cuisinable », allergen tags, role) and the kitchen units (density, own
 * units). `confirmed_by_id` is a plain id with no foreign key, as
 * `audit_events.actor_id` is: the fact stays when the account is removed.
 */
export const foodRecords = pgTable(
  "food_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    foodCode: text("food_code").notNull(),
    cookable: boolean("cookable").notNull().default(false),
    /** Tags of the compatibility gate: `milk`, `gluten:wheat`, `meat:pork`. */
    containsTags: text("contains_tags").array().notNull().default([]),
    mayContainTags: text("may_contain_tags").array().notNull().default([]),
    role: text("role").$type<DishRole>(),
    status: text("status").$type<FoodRecordStatus>().notNull(),
    source: text("source").$type<FoodRecordSource>().notNull(),
    proposedModel: text("proposed_model").notNull().default(""),
    /** The id of the lexicon row of the gate that names this food. */
    lexiconId: text("lexicon_id"),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true, mode: "date" }),
    confirmedById: uuid("confirmed_by_id"),
    confirmedByName: text("confirmed_by_name").notNull().default(""),
    /** Grams for one millilitre. Null: the food has no generic unit. */
    densityGPerMl: doublePrecision("density_g_per_ml"),
    /** `[{ one, many, grams }]`: the food's own units with a weight. */
    units: jsonb("units").$type<FoodUnit[]>().notNull().default([]),
    unitsStatus: text("units_status").$type<FoodRecordStatus>(),
    unitsConfirmedAt: timestamp("units_confirmed_at", {
      withTimezone: true,
      mode: "date",
    }),
    unitsConfirmedById: uuid("units_confirmed_by_id"),
    unitsConfirmedByName: text("units_confirmed_by_name").notNull().default(""),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("food_records_food_code_idx").on(table.foodCode),
    // The queue « À confirmer » and the list of the confirmed foods.
    index("food_records_status_idx").on(table.status),
    check(
      "food_records_status_check",
      sql`${table.status} in ('proposed', 'confirmed')`,
    ),
    check(
      "food_records_units_status_check",
      sql`${table.unitsStatus} is null or ${table.unitsStatus} in ('proposed', 'confirmed')`,
    ),
    check(
      "food_records_source_check",
      sql`${table.source} in ('remi', 'person')`,
    ),
    check(
      "food_records_role_check",
      sql`${table.role} is null or ${table.role} in ('protein', 'starch', 'vegetable', 'fat', 'acid', 'aromatic', 'herb_spice', 'liquid')`,
    ),
    // A confirmed part names its date. A proposed part names none.
    check(
      "food_records_confirmed_check",
      sql`(${table.status} = 'confirmed') = (${table.confirmedAt} is not null)`,
    ),
    check(
      "food_records_units_confirmed_check",
      sql`(${table.unitsStatus} is not distinct from 'confirmed') = (${table.unitsConfirmedAt} is not null)`,
    ),
    check(
      "food_records_density_check",
      sql`${table.densityGPerMl} is null or ${table.densityGPerMl} > 0`,
    ),
  ],
);

/**
 * One row per write accepted through a patient link — the ledger the per-token
 * rate limit counts.
 *
 * A ledger rather than a counter column because the limit is a ROLLING window:
 * a counter with a window start resets at a boundary, so ten writes at 10:59
 * and ten more at 11:00 pass a "ten per hour" rule that means nothing. Counting
 * rows inside the window has no such edge, and the table stays small because
 * every accepted write prunes what has fallen out of the longest window — the
 * day ceiling is also the row ceiling, about a hundred per patient.
 *
 * It holds when, and nothing else: no body, no action, no address. What was
 * written is the row the write created, and who did it is the audit trail —
 * duplicating either here would be a second copy of health data whose only job
 * is arithmetic.
 */
export const patientLinkWrites = pgTable("patient_link_writes", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patientProfiles.id, { onDelete: "cascade" }),
  ...timestamps,
});

/**
 * The changes a patient made to a watched field after activation — story 21,
 * `patient-change-signals`. One row is one signal: the field, the value before
 * the patient's first change, the value now, and when the patient last
 * changed it. The practitioner acknowledges it on the file
 * (`change-signals-in-console`), which sets the two `acknowledged_*` columns.
 *
 * A field has at most one open signal: a second change before the
 * acknowledgement moves `new_value` and `changed_at` on the open row, and a
 * change back to `old_value` deletes it. The audit trail keeps every write
 * (`patient.changed`, D-32).
 *
 * The values are the stored values, never a label: the reader formats them.
 * The field keys are `watchedPatientFields` in `shared/patient-changes.ts`.
 */
export const patientChanges = pgTable(
  "patient_changes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patientProfiles.id, { onDelete: "cascade" }),
    fieldKey: text("field_key").notNull(),
    oldValue: jsonb("old_value").$type<PatientChangeValue>(),
    newValue: jsonb("new_value").$type<PatientChangeValue>(),
    changedAt: timestamp("changed_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    acknowledgedAt: timestamp("acknowledged_at", {
      withTimezone: true,
      mode: "date",
    }),
    /** The operator who acknowledged. No foreign key, like `audit_events`. */
    acknowledgedBy: uuid("acknowledged_by"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("patient_changes_open_patient_field_idx")
      .on(table.patientId, table.fieldKey)
      .where(sql`${table.acknowledgedAt} is null`),
    index("patient_changes_patient_changed_at_idx").on(
      table.patientId,
      table.changedAt,
    ),
    check(
      "patient_changes_field_key_check",
      sql`${table.fieldKey} in (${sql.raw(
        watchedPatientFields.map((field) => `'${field}'`).join(", "),
      )})`,
    ),
  ],
);

/**
 * Morgane's own nutrition knowledge, as text — decision #7's second half, and
 * the answer to the last line of her covering message: « remplir la base de
 * donnée de REMI avec les informations importantes et que l'IA puisse aller
 * les rechercher facilement ».
 *
 * Like `recipes`, this table belongs to no patient. Unlike `recipes`, it also
 * belongs to no practitioner: there is no `practitioner_id` column, because
 * whether the corpus is house-wide or per-practitioner is Morgane's question
 * to answer and a nullable column added later answers it without a reshape.
 *
 * `status` is the load-bearing column. Retrieval reads `validated` rows only —
 * brainstorm § 6's « puis de les valider avant intégration » made structural,
 * so a rule that nobody has agreed to cannot reach a prompt by accident.
 */
export const nutritionRules = pgTable("nutrition_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  /** Markdown, stored raw: it is what a prompt will paste verbatim. */
  body: text("body").notNull().default(""),
  /**
   * Free text and deliberately no taxonomy, exactly as `recipes.tags` is. The
   * recommendation categories are five words about a protocol; the words a
   * nutrition rule is found by are hers, and the console's filter lists
   * whatever the corpus actually carries.
   */
  tags: text("tags").array().notNull().default([]),
  /** `principle` | `food-list` | `seasonality` | `safety` | `house-rule`. */
  kind: text("kind").notNull().default("principle"),
  /** `draft` | `validated`. Never defaults to validated — that is the point. */
  status: text("status").notNull().default("draft"),
  version: integer("version").notNull().default(1),
  /**
   * Who agreed to this wording, denormalised to nothing: a plain id with no
   * foreign key, for the same reason `audit_events.actor_id` has none — the
   * record of who validated must survive the account being removed.
   */
  validatedBy: uuid("validated_by"),
  validatedAt: timestamp("validated_at", { withTimezone: true, mode: "date" }),
  /**
   * The revision that replaced this row. A same-table pointer rather than a
   * foreign key because nothing here is ever deleted — there is no hard delete
   * in the service or on the page — so it cannot dangle.
   */
  supersededBy: uuid("superseded_by"),
  /** Withdrawn with no replacement. The counterpart to the library's archive. */
  archivedAt: timestamp("archived_at", { withTimezone: true, mode: "date" }),
  ...timestamps,
});

/**
 * A waiting-list lead from the public site (triage/morgane-transmission): a
 * patient pilot, an information request or a practitioner pilot. The site
 * writes the row, the console reads it, and Morgane gets one email per row.
 *
 * `email` is stored lower-cased, which is what makes (type, email) unique:
 * the same person may be on two lists, and the same address on one list is
 * one row. The site treats a second submit as a success, so the visitor
 * learns nothing about who is already on a list.
 */
export const leads = pgTable(
  "leads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: text("type").notNull(),
    email: text("email").notNull(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    phone: text("phone"),
    offerInterest: text("offer_interest"),
    profession: text("profession"),
    message: text("message"),
    /** The consent text the person ticked, by its version. */
    consentTextVersion: text("consent_text_version").notNull(),
    /** Set by Morgane in the console once she has written back. */
    contactedAt: timestamp("contacted_at", {
      withTimezone: true,
      mode: "date",
    }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("leads_type_email_idx").on(table.type, table.email),
    check(
      "leads_type_check",
      sql`${table.type} in ('patient_pilot', 'info_request', 'practitioner_pilot')`,
    ),
    check(
      "leads_offer_interest_check",
      sql`${table.offerInterest} is null or ${table.offerInterest} in ('genetic', 'consultation', 'undecided')`,
    ),
  ],
);

/**
 * The validated versions of a patient's protocol — story 20. One row for each
 * validation: the number, the date, the operator and a snapshot of the live
 * protocol (`shared/protocol-snapshot.ts`). A row is immutable: the service
 * has no update and no delete. The rows go with the patient.
 */
export const protocolVersions = pgTable(
  "protocol_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patientProfiles.id, { onDelete: "cascade" }),
    versionNumber: integer("version_number").notNull(),
    validatedAt: timestamp("validated_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    /** The operator who validated. No foreign key, like `audit_events`. */
    validatedBy: uuid("validated_by").notNull(),
    snapshot: jsonb("snapshot").$type<ProtocolSnapshot>().notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("protocol_versions_patient_version_idx").on(
      table.patientId,
      table.versionNumber,
    ),
    check(
      "protocol_versions_version_number_check",
      sql`${table.versionNumber} >= 1`,
    ),
  ],
);

/**
 * The food directives of a patient file — REM-54, story 13. One row for each
 * term of « À favoriser », « À limiter » and « Éviction totale ». The term is
 * stored as typed: REMI has no term base yet.
 *
 * A total eviction (`exclude`) is safety data (story 14, D-30): the check
 * `patient_food_directives_eviction_period_check` refuses one with no end date
 * and no durable status, and one with the two. A row that leaves the list is
 * disabled (`disabled_at`), never deleted. The rows go with the patient.
 */
export const patientFoodDirectives = pgTable(
  "patient_food_directives",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patientProfiles.id, { onDelete: "cascade" }),
    /** `favour`, `limit` or `exclude`. */
    kind: text("kind").$type<FoodDirectiveKind>().notNull(),
    /** The term as the practitioner typed it. */
    term: text("term").notNull(),
    /** For `limit` only: `reduce` or `rare`. Null when no level is chosen. */
    limitLevel: text("limit_level").$type<FoodLimitLevel>(),
    /** For `exclude` only. Null: the eviction applies from the save. */
    startsOn: date("starts_on", { mode: "string" }),
    /** For `exclude` only. Null for a durable eviction. */
    endsOn: date("ends_on", { mode: "string" }),
    /** For `exclude` only. The durable medical exclusion. */
    durable: boolean("durable").notNull().default(false),
    /** Rank in the field of its kind. */
    position: integer("position").notNull().default(0),
    /** Null for a directive in force. */
    disabledAt: timestamp("disabled_at", { withTimezone: true, mode: "date" }),
    ...timestamps,
  },
  (table) => [
    index("patient_food_directives_patient_idx").on(table.patientId),
    check(
      "patient_food_directives_kind_check",
      sql`${table.kind} in ('favour', 'limit', 'exclude')`,
    ),
    check(
      "patient_food_directives_limit_level_check",
      sql`${table.limitLevel} is null or (${table.kind} = 'limit' and ${table.limitLevel} in ('reduce', 'rare'))`,
    ),
    check(
      "patient_food_directives_eviction_period_check",
      sql`(${table.kind} = 'exclude' and ${table.durable} <> (${table.endsOn} is not null)) or (${table.kind} <> 'exclude' and not ${table.durable} and ${table.startsOn} is null and ${table.endsOn} is null)`,
    ),
    check(
      "patient_food_directives_period_order_check",
      sql`${table.startsOn} is null or ${table.endsOn} is null or ${table.endsOn} >= ${table.startsOn}`,
    ),
  ],
);

/**
 * The meal configuration of a patient file — REM-68 and REM-70, stories 11
 * and 12. One row for each patient: for each of the four meals, whether the
 * patient eats it and its orientation, then the intermittent fasting option.
 *
 * The fasting option is one fact for each patient, so the table has one row
 * for each patient and not one row for each meal. Each value is nullable:
 * null means that the practitioner has not entered it. REMI enters no value.
 * The row goes with the patient.
 */
export const patientMealConfigurations = pgTable(
  "patient_meal_configurations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patientProfiles.id, { onDelete: "cascade" }),
    breakfastEnabled: boolean("breakfast_enabled"),
    breakfastOrientation: text("breakfast_orientation").$type<MealOrientation>(),
    lunchEnabled: boolean("lunch_enabled"),
    lunchOrientation: text("lunch_orientation").$type<MealOrientation>(),
    snackEnabled: boolean("snack_enabled"),
    snackOrientation: text("snack_orientation").$type<MealOrientation>(),
    dinnerEnabled: boolean("dinner_enabled"),
    dinnerOrientation: text("dinner_orientation").$type<MealOrientation>(),
    /** `none`, `skip_breakfast` or `skip_dinner`. */
    fasting: text("fasting").$type<MealFasting>(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("patient_meal_configurations_patient_idx").on(table.patientId),
    check(
      "patient_meal_configurations_breakfast_orientation_check",
      sql`${table.breakfastOrientation} is null or ${table.breakfastOrientation} in ('protein_fat', 'complete_balanced', 'light_plant', 'carb_leaning', 'free')`,
    ),
    check(
      "patient_meal_configurations_lunch_orientation_check",
      sql`${table.lunchOrientation} is null or ${table.lunchOrientation} in ('protein_fat', 'complete_balanced', 'light_plant', 'carb_leaning', 'free')`,
    ),
    check(
      "patient_meal_configurations_snack_orientation_check",
      sql`${table.snackOrientation} is null or ${table.snackOrientation} in ('protein_fat', 'complete_balanced', 'light_plant', 'carb_leaning', 'free')`,
    ),
    check(
      "patient_meal_configurations_dinner_orientation_check",
      sql`${table.dinnerOrientation} is null or ${table.dinnerOrientation} in ('protein_fat', 'complete_balanced', 'light_plant', 'carb_leaning', 'free')`,
    ),
    check(
      "patient_meal_configurations_fasting_check",
      sql`${table.fasting} is null or ${table.fasting} in ('none', 'skip_breakfast', 'skip_dinner')`,
    ),
  ],
);

/**
 * Settings of the application that an admin changes in the console. One row
 * for each key. The first keys are the model of each AI role (`ai.model.fast`,
 * `ai.model.balanced`, `ai.model.deep`): with no row, the code default applies.
 *
 * It holds no secret and no patient data. A key of a vendor stays an
 * environment variable.
 *
 * `updated_by_id` is a plain id with no foreign key, as `audit_events.actor_id`
 * is: the record of who set a value must stay when the account is removed. The
 * name is kept beside it for the same reason.
 */
export const appSettings = pgTable(
  "app_settings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: text("key").notNull(),
    value: text("value").notNull(),
    updatedById: uuid("updated_by_id"),
    updatedByName: text("updated_by_name").notNull().default(""),
    ...timestamps,
  },
  (table) => [uniqueIndex("app_settings_key_idx").on(table.key)],
);
