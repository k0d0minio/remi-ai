/**
 * @remi/services/server — the Node-only surface.
 *
 * This is the entrypoint apps import for anything that touches storage, secrets,
 * or an outbound provider. It is a barrel over /db, /email and /ai plus the
 * environment reader — importing it from a client component is a build error,
 * which is the point: the import path itself states where the code runs.
 *
 * ESLint blocks apps from importing the root "@remi/services" barrel so this
 * choice is always explicit at the call site.
 */

export {
  getDatabase,
  isDatabaseRegistered,
  registerDatabase,
} from "../db/client";
export type { Collection, DatabaseClient } from "../db/client";

export { createNeonDatabase } from "../db/adapters/neon";

export {
  createPatient,
  deletePatient,
  getPatient,
  getPatientByShareToken,
  listPatients,
  recordPatientLinkOpened,
  regenerateShareToken,
  updatePatient,
} from "../db/services/patients";
export type {
  PatientInput,
  PatientQuery,
  PatientSort,
} from "../db/services/patients";

export {
  addPatientRecommendation,
  archivePatientRecommendation,
  deletePatientRecommendation,
  listArchivedPatientRecommendations,
  listPatientRecommendations,
  movePatientRecommendation,
  updatePatientRecommendation,
} from "../db/services/patient-recommendations";
export type { RecommendationInput } from "../db/services/patient-recommendations";

export {
  addPantryEssential,
  archivePantryEssential,
  deletePantryEssential,
  listArchivedPantryEssentials,
  listPantryEssentials,
  movePantryEssential,
  updatePantryEssential,
} from "../db/services/pantry-essentials";
export type { PantryEssentialInput } from "../db/services/pantry-essentials";

export {
  addPatientNote,
  deletePatientNote,
  listPatientNotes,
  updatePatientNote,
} from "../db/services/patient-notes";
export type { NoteInput } from "../db/services/patient-notes";

export {
  listPatientAnamnesis,
  setPatientAnamnesis,
} from "../db/services/patient-anamnesis";

export {
  changeOperatorPassword,
  createOperator,
  deleteOperator,
  findOperatorByEmail,
  getOperator,
  hasOperator,
  listOperators,
  setOperatorRole,
  updateOperatorName,
  verifyOperator,
} from "../db/services/operators";
export type { OperatorInput } from "../db/services/operators";
export type { Operator, OperatorRole } from "../db/models/operator";

export {
  acceptInvitation,
  createInvitation,
  getInvitationByToken,
  listInvitations,
  listPendingInvitations,
  revokeInvitation,
} from "../db/services/operator-invitations";
export type {
  AcceptInput,
  InvitationInput,
  IssuedInvitation,
} from "../db/services/operator-invitations";
export type { OperatorInvitation } from "../db/models/operator-invitation";

export { listAuditEvents, recordAuditEvent } from "../db/services/audit";
export type { AuditActor, AuditQuery, AuditRecord } from "../db/services/audit";
export type { AuditAction, AuditEvent } from "../db/models/audit-event";

export { hashPassword, verifyPassword } from "../auth/password";
export {
  SESSION_TTL_SECONDS,
  createSessionToken,
  verifySessionToken,
} from "../auth/session-token";

export {
  consoleMailer,
  createResendMailer,
  getMailer,
  isMailerRegistered,
  operatorInvitationEmail,
  patientLinkEmail,
  registerMailer,
  sendEmail,
} from "../email";
export type { EmailMessage, Mailer, SendResult } from "../email";

export {
  DEFAULTS as AI_DEFAULTS,
  MODELS,
  getTextProvider,
  registerTextProvider,
  resolveModel,
} from "../ai";
export type { GenerateOptions, ModelRole, TextProvider } from "../ai";

export { env, requireEnv } from "./env";
export type { ServerEnv } from "./env";
