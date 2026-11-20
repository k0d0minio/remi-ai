import type { ComponentProps } from "react";
import { Typography } from "@remi/ui/server";
import { SectionFold } from "@/components/patients/section-fold";
import { SupplementAddForm } from "@/components/patients/supplement-add-form";
import { SupplementProtocol } from "@/components/patients/supplement-protocol";
import { SupplementSection } from "@/components/patients/supplement-section";

type Rows = ComponentProps<typeof SupplementSection>["supplements"];

type Props = {
  patientId: string;
  pseudonym: string;
  supplements: Rows;
  archived: Rows;
};

/** « Protocole de compléments »: the prescribed ones, then the stopped ones. */
export const SupplementsSection = ({
  patientId,
  pseudonym,
  supplements,
  archived,
}: Props) => (
  <>
    <SupplementSection
      patientId={patientId}
      pseudonym={pseudonym}
      supplements={supplements}
    >
      {supplements.length === 0 ? (
        <Typography size="sm" tone="muted">
          Aucun complément prescrit pour le moment.
        </Typography>
      ) : (
        <SupplementProtocol supplements={supplements} />
      )}
      <SupplementAddForm patientId={patientId} />
    </SupplementSection>

    {archived.length > 0 ? (
      <SectionFold
        id="archived-supplements"
        label="Compléments arrêtés"
        count={archived.length}
      >
        <SupplementProtocol supplements={archived} />
      </SectionFold>
    ) : null}
  </>
);
