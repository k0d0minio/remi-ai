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
