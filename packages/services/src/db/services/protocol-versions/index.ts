import { z } from "zod";
import {
  PROTOCOL_SNAPSHOT_SCHEMA_VERSION,
  isEmptyProtocolSnapshot,
  protocolSnapshotSchema,
  type ProtocolSnapshot,
} from "../../../shared/protocol-snapshot";
import { initialFileStatus } from "../../../shared/file-status";
import { err, ok, type Result } from "../../../shared/result";
import type { Id } from "../../../types";
import { getDatabase, type DatabaseClient } from "../../client";
import type { PatientProfile } from "../../models/patient-profile";
import type {
  ProtocolVersion,
  ValidatedProtocol,
} from "../../models/protocol-version";
import { byPatient, noSuchPatient, systemActor } from "../access";
import { recordAuditEvent, type OperatorActor } from "../audit";
import { listPatientCalculations } from "../patient-calculations";
import { listPatientGoals } from "../patient-goals";
import { getPatientInstruction } from "../patient-instructions";
import { listPatientRecommendations } from "../patient-recommendations";
import { listPatientSupplements } from "../patient-supplements";

/**
 * The validated versions of a protocol — story 20, D-30.
 *
 * The live tables (recommendations, goals, supplements, instruction,
 * calculations) are the practitioner's working copy. `validateProtocol` copies
 * them into the next row of `protocol_versions`. `getValidatedProtocol`
 * returns the latest row. A reader of validated content (the patient space,
 * the generation) calls only `getValidatedProtocol`: a change in the working
 * copy does not reach it before the next validation.
 *
 * A version is immutable. This module has one insert, and no update and no
 * delete.
 */

const versions = (db: DatabaseClient = getDatabase()) =>
  db.collection<ProtocolVersion>("protocol_versions");

const uuidSchema = z.uuid();

/** Every version of the patient, paged. A file has one for each validation. */
const rowsOf = async (
  patientId: Id,
  db?: DatabaseClient,
): Promise<ProtocolVersion[]> => {
  const rows: ProtocolVersion[] = [];
  let cursor: string | undefined;
  do {
    const page = await versions(db).findMany(
      { patientId },
      { limit: 500, cursor },
    );
    rows.push(...page.items);
    cursor = page.nextCursor ?? undefined;
  } while (cursor);
  return rows;
};

const latestOf = (rows: readonly ProtocolVersion[]): ProtocolVersion | null =>
  rows.reduce<ProtocolVersion | null>(
    (latest, row) =>
      latest === null || row.versionNumber > latest.versionNumber
        ? row
        : latest,
    null,
  );

/**
 * The live protocol as a snapshot: the rows in force, and the calculations
 * with a validated value that needs no revalidation (D-30). The services
 * return the recommendations in the order of the categories. The caller has
 * checked the actor, so the reads use the system actor.
 */
const snapshotOfLiveProtocol = async (patientId: Id): Promise<unknown> => {
  const [recommendations, goals, supplements, instruction, calculations] =
    await Promise.all([
      listPatientRecommendations(systemActor, patientId),
      listPatientGoals(systemActor, patientId),
      listPatientSupplements(systemActor, patientId),
      getPatientInstruction(systemActor, patientId),
      listPatientCalculations(systemActor, patientId),
    ]);
  return {
    schemaVersion: PROTOCOL_SNAPSHOT_SCHEMA_VERSION,
    recommendations: recommendations.map((row) => ({
      id: row.id,
      category: row.category,
      title: row.title,
      detail: row.detail,
      position: row.position,
    })),
    goals: [...goals]
      .sort((a, b) => a.position - b.position)
      .map((row) => ({
        id: row.id,
        title: row.title,
        baseline: row.baseline,
        position: row.position,
      })),
    supplements: [...supplements]
      .sort((a, b) => a.position - b.position)
      .map((row) => ({
        id: row.id,
        name: row.name,
        dose: row.dose,
        timing: row.timing,
        reason: row.reason,
        position: row.position,
      })),
    instruction: instruction
      ? {
          id: instruction.id,
          body: instruction.body,
          patientBody: instruction.patientBody ?? null,
        }
      : null,
    calculations: calculations.flatMap((row) =>
      row.validatedValue === null ||
      row.validatedValue === undefined ||
      !row.validatedAt ||
      row.needsRevalidation
        ? []
        : [
            {
              kind: row.kind,
              value: row.validatedValue,
              parameters: row.validationParameters ?? {},
              validatedAt: row.validatedAt.toISOString(),
            },
          ],
    ),
  };
};

/** The counts of one snapshot, for the audit event. No patient text. */
const auditDetailOf = (versionNumber: number, snapshot: ProtocolSnapshot) =>
  JSON.stringify({
    version: versionNumber,
    recommendations: snapshot.recommendations.length,
    goals: snapshot.goals.length,
    supplements: snapshot.supplements.length,
    instruction: snapshot.instruction !== null,
    calculations: snapshot.calculations.map((row) => row.kind),
  });

/**
 * Validate the live protocol into the next version (story 20).
 *
 * 1. The file must be at « Recommandations à valider » or at « Accompagnement
 *    actif ». Another status is a `conflict`.
 * 2. An empty protocol is a `conflict`: there is nothing to validate.
 * 3. A snapshot that fails the schema is refused as `invalid_input`, and
 *    nothing is written.
 * 4. The version number is the latest number plus 1, from 1.
 * 5. One `protocol.validated` event names the version and the counts (D-32).
 *
 * The validation changes no status and deletes no row: the activation
 * (`care-activation/activation-action`) calls it and then moves the status.
 */
const unscopedValidateProtocol = async (
  patientId: Id,
  actor: OperatorActor,
  db?: DatabaseClient,
): Promise<Result<ProtocolVersion>> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return noSuchPatient();
  }
  const file = await (db ?? getDatabase())
    .collection<PatientProfile>("patient_profiles")
    .findById(patientId);
  if (!file) {
    return noSuchPatient();
  }
  const status = file.fileStatus ?? initialFileStatus;
  if (status !== "to_validate" && status !== "active") {
    return err(
      "conflict",
      `a file at ${status} has no recommendations to validate`,
    );
  }
  const parsed = protocolSnapshotSchema.safeParse(
    await snapshotOfLiveProtocol(patientId),
  );
  if (!parsed.success) {
    console.error("[protocol-versions] the live protocol is not a snapshot", {
      patient: patientId,
      issues: parsed.error.issues.map((issue) => issue.path.join(".")),
    });
    return err("invalid_input", "the protocol is not valid for a version");
  }
  if (isEmptyProtocolSnapshot(parsed.data)) {
    return err("conflict", "the protocol is empty");
  }
  const latest = latestOf(await rowsOf(patientId, db));
  const versionNumber = (latest?.versionNumber ?? 0) + 1;
  let created: ProtocolVersion;
  try {
    created = await versions(db).insert({
      patientId,
      versionNumber,
      validatedAt: new Date(),
      validatedBy: actor.id,
      snapshot: parsed.data,
    });
  } catch (cause) {
    // Two validations at the same time ask for the same number. The unique
    // index refuses the second one.
    console.error("[protocol-versions] the version was not written", cause);
    return err("conflict", "another validation ran at the same time");
  }
  await recordAuditEvent({
    actor,
    action: "protocol.validated",
    targetType: "patient",
    targetId: patientId,
    targetLabel: file.pseudonym,
    detail: auditDetailOf(versionNumber, parsed.data),
  });
  return ok(created);
};

/**
 * The validated protocol of the patient: the latest version, or `null` when
 * the file has none. Only validated content comes back (D-30): nothing here
 * reads the live tables.
 *
 * A stored snapshot that fails the schema is `upstream_failed`. The reader
 * must not show it, and must not fall back to the live tables.
 */
const unscopedGetValidatedProtocol = async (
  patientId: Id,
  db?: DatabaseClient,
): Promise<Result<ValidatedProtocol | null>> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return noSuchPatient();
  }
  const latest = latestOf(await rowsOf(patientId, db));
  if (!latest) {
    return ok(null);
  }
  const parsed = protocolSnapshotSchema.safeParse(latest.snapshot);
  if (!parsed.success) {
    console.error("[protocol-versions] a stored snapshot is not valid", {
      patient: patientId,
      version: latest.versionNumber,
      issues: parsed.error.issues.map((issue) => issue.path.join(".")),
    });
    return err("upstream_failed", "the validated protocol cannot be read");
  }
  return ok({
    versionNumber: latest.versionNumber,
    validatedAt: latest.validatedAt,
    validatedBy: latest.validatedBy,
    snapshot: parsed.data,
  });
};

/**
 * The scoped surface (story 3, D-27). The actor comes first, and
 * `db/services/access` checks it before the body runs. A refused call answers
 * as a missing file. A patient reads only its own validated protocol.
 */
export const validateProtocol = byPatient(
  "write",
  unscopedValidateProtocol,
  noSuchPatient,
);
export const getValidatedProtocol = byPatient(
  "read",
  unscopedGetValidatedProtocol,
  noSuchPatient,
);
