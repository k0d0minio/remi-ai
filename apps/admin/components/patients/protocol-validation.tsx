import { BadgeCheck } from "lucide-react";
import { getValidatedProtocol } from "@remi/services/server";
import { formatDate, type PatientProfile } from "@remi/services/shared";
import { Button } from "@remi/ui";
import { Typography } from "@remi/ui/server";
import { requireActor } from "@/lib/auth/session";
import { validateProtocolAction } from "@/lib/patients/protocol-validation";

type Props = {
  patient: Pick<PatientProfile, "id" | "fileStatus">;
  /** An admin's open of another practitioner's file: no button. */
  readOnly: boolean;
};

/**
 * The validation of the recommendations (story 20): the date of the validated
 * version, and the button « Valider les recommandations ». The button shows
 * from « Recommandations à valider » on, and the service refuses it before.
 * The component reads the validated version itself, so the page has one line.
 */
export const ProtocolValidation = async ({ patient, readOnly }: Props) => {
  const validated = await getValidatedProtocol(
    await requireActor(),
    patient.id,
  );
  const version = validated.ok ? validated.data : null;
  const canValidate =
    !readOnly &&
    (patient.fileStatus === "to_validate" || patient.fileStatus === "active");
  if (validated.ok && !version && !canValidate) {
    return null;
  }
  return (
    <form
      action={validateProtocolAction}
      className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
    >
      <input type="hidden" name="id" value={patient.id} />
      {validated.ok ? (
        <Typography size="sm" tone="muted">
          {version
            ? `Version ${version.versionNumber} validée le ${formatDate(version.validatedAt)}`
            : "Aucune version validée pour l'instant."}
        </Typography>
      ) : (
        <Typography size="sm" role="status" className="text-warning-text">
          La version validée ne peut pas être lue.
        </Typography>
      )}
      {canValidate ? (
        <Button type="submit" size="sm">
          <BadgeCheck aria-hidden="true" />
          Valider les recommandations
        </Button>
      ) : null}
    </form>
  );
};
