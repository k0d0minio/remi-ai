import { listOpenPatientChanges } from "@remi/services/server";
import type { PatientProfile } from "@remi/services/shared";
import { Badge } from "@remi/ui/server";
import { PATIENT_CHANGES_ANCHOR } from "@/components/patients/file/patient-changes";
import { requireActor } from "@/lib/auth/session";

type Props = {
  patient: Pick<PatientProfile, "id">;
};

/**
 * « n modifications à prendre en compte » in the header of the file (story 6,
 * REM-48): the count of the patient's open changes, with a link to the block
 * that lists them. No change, or a read that fails, shows nothing: a count
 * needs a fact in the data. The service scopes the read to the actor.
 */
export const PatientChangesCount = async ({ patient }: Props) => {
  const read = await listOpenPatientChanges(await requireActor(), patient.id);
  if (!read.ok || read.data.length === 0) {
    return null;
  }
  const count = read.data.length;
  return (
    <a
      href={`#${PATIENT_CHANGES_ANCHOR}`}
      className="focus-visible:ring-ring inline-flex min-h-11 items-center rounded-sm focus-visible:outline-none focus-visible:ring-[3px] sm:min-h-0"
    >
      <Badge variant="warning" tone="subtle" size="sm">
        {count === 1
          ? "1 modification à prendre en compte"
          : `${count} modifications à prendre en compte`}
      </Badge>
    </a>
  );
};
