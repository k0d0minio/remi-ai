import {
  date,
  doublePrecision,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

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
  /** The working name — the one an AI provider may later be allowed to see. */
  pseudonym: text("pseudonym").notNull(),
  /** Real identity. Optional, and never sent to an AI provider. */
  fullName: text("full_name"),
  email: text("email"),
  locale: text("locale").notNull().default("fr"),
  status: text("status").notNull().default("active"),
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
  foodBudget: text("food_budget").notNull().default(""),
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
   * existing, and through which channel. Both nullable: consent is a recorded
   * fact, not a gate, and a profile without it renders and saves exactly as
   * one with it. A stored wording or version, if it is ever wanted, is one
   * more nullable column here — not a reshape of this table.
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
  ...timestamps,
});

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
export const patientGoalCheckIns = pgTable("patient_goal_check_ins", {
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
  ...timestamps,
});

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
  /** Set when a replacement supersedes it. Null on the one in force. */
  archivedAt: timestamp("archived_at", { withTimezone: true, mode: "date" }),
  ...timestamps,
});

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
 * `body` is prose, one field, no structure imposed: she writes ingredients and
 * steps as a paragraph in chat today, and § 7 bans the dozen-field form that
 * would replace it. There is no `minutes`, `servings`, `ingredients[]` or
 * `method[]` here — those were v1's fields, and their absence is the spec.
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
  ...timestamps,
});

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

export const operators = pgTable("operators", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  /**
   * `owner` manages accounts; `operator` manages patients only. The column
   * defaults to the lesser role so an invite cannot accidentally mint an
   * owner — the accounts that predate this column are promoted by the
   * migration instead.
   */
  role: text("role").notNull().default("operator"),
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
  role: text("role").notNull().default("operator"),
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
