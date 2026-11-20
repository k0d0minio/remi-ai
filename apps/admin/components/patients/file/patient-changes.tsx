import { ShieldAlert } from "lucide-react";
import { listOpenPatientChanges } from "@remi/services/server";
import {
  comparePatientChangesForReview,
  formatDate,
  isSafetyPatientField,
  patientChangeValueLabel,
  watchedPatientFieldLabels,
  type PatientChange,
  type PatientProfile,
} from "@remi/services/shared";
import { Badge, Typography } from "@remi/ui/server";
import { cn } from "@remi/ui/utils";
import { AcknowledgeChangesButton } from "@/components/patients/file/acknowledge-changes-button";
import { NOT_ENTERED } from "@/components/patients/file/value";
import { requireActor } from "@/lib/auth/session";

/** The anchor of the block. The patient list links to it. */
export const PATIENT_CHANGES_ANCHOR = "patient-changes";

type Props = {
  patient: Pick<PatientProfile, "id">;
  /** An admin's open of another practitioner's file: the list, no button. */
  readOnly: boolean;
  /**
   * Show one calm line when no change is open. The card of an active file
   * sets it. At another status the block shows only when a change is open.
   */
  showWhenEmpty: boolean;
};

/**
 * The empty state of a value. An empty list is not « none known »: the
 * safety strip of the header holds that answer (D-30).
 */
const emptyValue = (field: PatientChange["fieldKey"]) =>
  field === "allergies" || field === "intolerances"
    ? "Aucun élément déclaré"
    : NOT_ENTERED;

const ChangeValue = ({
  label,
  change,
  value,
}: {
  label: string;
  change: PatientChange;
  value: PatientChange["oldValue"];
}) => {
  const text = patientChangeValueLabel(change.fieldKey, value);
  return (
    <div className="flex min-w-0 flex-col">
      <dt>
        <Typography as="span" size="xs" tone="muted">
          {label}
        </Typography>
      </dt>
      <dd className="min-w-0">
        <Typography
          as="span"
          size="sm"
          weight={text === null ? "normal" : "medium"}
          tone={text === null ? "muted" : undefined}
          className="break-words"
        >
          {text ?? emptyValue(change.fieldKey)}
        </Typography>
      </dd>
    </div>
  );
};

const ChangeItem = ({
  change,
  patientId,
  readOnly,
}: {
  change: PatientChange;
  patientId: string;
  readOnly: boolean;
}) => {
  const safety = isSafetyPatientField(change.fieldKey);
  const field = watchedPatientFieldLabels[change.fieldKey].fr;
  return (
    <li
      className={cn(
        "flex flex-col gap-3 rounded-md border p-3",
        safety ? "border-warning-border bg-warning-subtle" : "border-border",
      )}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Typography as="h4" size="sm" weight="semibold">
          {field}
        </Typography>
        {safety ? (
          <Badge variant="warning" tone="solid" size="sm">
            <ShieldAlert aria-hidden="true" className="size-3.5" />
            Sécurité alimentaire
          </Badge>
        ) : null}
        <Typography as="span" size="xs" tone="muted" className="sm:ml-auto">
          {`Modifié par la personne le ${formatDate(change.changedAt)}`}
        </Typography>
      </div>
      <dl className="grid items-start gap-x-6 gap-y-2 sm:grid-cols-2">
        <ChangeValue label="Avant" change={change} value={change.oldValue} />
        <ChangeValue
          label="Maintenant"
          change={change}
          value={change.newValue}
        />
      </dl>
      {safety ? (
        <Typography size="xs" className="text-warning-text">
          Cette donnée touche la sécurité alimentaire. Relisez-la en priorité.
        </Typography>
      ) : null}
      {readOnly ? null : (
        <AcknowledgeChangesButton
          patientId={patientId}
          changeId={change.id}
          subject={field}
        />
      )}
    </li>
  );
};

/**
 * The patient's open changes in the action card (story 21): for each one the
 * field, the old value, the new value and the date, with « Pris en compte ».
 * A change of an allergy, of an intolerance or of the diet comes first and
 * stands out: it touches safety.
 *
 * The block reads its own data, so the page has no line for it. The service
 * scopes the read to the actor. An admin's read-only open gets the list and
 * no button. A change that is taken into account leaves the block and the
 * patient list. It stays in the data, and no validated recommendation changes.
 */
export const PatientChangesBlock = async ({
  patient,
  readOnly,
  showWhenEmpty,
}: Props) => {
  const read = await listOpenPatientChanges(await requireActor(), patient.id);
  if (!read.ok) {
    return (
      <Typography size="sm" role="status" className="text-warning-text">
        Les modifications de la personne ne peuvent pas être lues.
      </Typography>
    );
  }
  const changes = [...read.data].sort(comparePatientChangesForReview);
  if (changes.length === 0) {
    return showWhenEmpty ? (
      <Typography id={PATIENT_CHANGES_ANCHOR} size="sm" className="scroll-mt-60">
        Aucune modification de la personne en attente.
      </Typography>
    ) : null;
  }
  return (
    <div
      id={PATIENT_CHANGES_ANCHOR}
      role="group"
      aria-labelledby="patient-changes-title"
      className="border-border flex scroll-mt-60 flex-col gap-3 rounded-md border p-4"
    >
      <div className="flex flex-col gap-1">
        <Typography
          as="h3"
          id="patient-changes-title"
          size="sm"
          weight="semibold"
        >
          {changes.length === 1
            ? "1 modification de la personne à prendre en compte"
            : `${changes.length} modifications de la personne à prendre en compte`}
        </Typography>
        <Typography size="xs" tone="muted">
          Les recommandations validées restent inchangées. Pour les adapter,
          modifiez le protocole, puis validez une nouvelle version.
        </Typography>
      </div>
      <ul className="flex flex-col gap-2">
        {changes.map((change) => (
          <ChangeItem
            key={change.id}
            change={change}
            patientId={patient.id}
            readOnly={readOnly}
          />
        ))}
      </ul>
      {readOnly || changes.length < 2 ? null : (
        <AcknowledgeChangesButton patientId={patient.id} />
      )}
    </div>
  );
};
