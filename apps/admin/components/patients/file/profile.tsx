import type { ComponentProps } from "react";
import { Typography } from "@remi/ui/server";
import { DeletePatient } from "@/components/patients/delete-patient";
import { ProfileSummary } from "@/components/patients/profile-summary";
import { RetentionHold } from "@/components/patients/retention-hold";
import { SectionFold } from "@/components/patients/section-fold";

type Props = {
  /** The read summary, with the form one click behind « Modifier ». */
  summary: ComponentProps<typeof ProfileSummary>;
  patientId: string;
  pseudonym: string;
  heldAt: ComponentProps<typeof RetentionHold>["heldAt"];
  /** The operator may manage the accounts: the retention hold shows. */
  canHold: boolean;
  /** An admin's open of another practitioner's file: no hold, no delete. */
  readOnly: boolean;
};

/** « Profil »: the summary, then the delete flow in its closed fold. */
export const ProfileSection = ({
  summary,
  patientId,
  pseudonym,
  heldAt,
  canHold,
  readOnly,
}: Props) => (
  <>
    <ProfileSummary {...summary} />

    <SectionFold id="danger-zone" label="Zone sensible" tone="error">
      <div className="flex flex-col gap-4">
        <Typography size="sm" tone="muted">
          La suppression retire le profil, ses recommandations, son protocole de
          compléments, ses essentiels, ses notes, son anamnèse, ses objectifs et
          leurs points d&apos;étape, ses consignes, ses recettes attribuées, son
          journal des repas, ses observations et le lien patient —
          définitivement. Les recettes elles-mêmes restent dans la bibliothèque.
        </Typography>
        {canHold && !readOnly ? (
          <RetentionHold patientId={patientId} heldAt={heldAt} />
        ) : null}
        {readOnly ? null : (
          <DeletePatient patientId={patientId} pseudonym={pseudonym} />
        )}
      </div>
    </SectionFold>
  </>
);
