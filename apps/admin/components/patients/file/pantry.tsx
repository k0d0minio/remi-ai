import type { ComponentProps } from "react";
import { Typography } from "@remi/ui/server";
import { PantryAddForm } from "@/components/patients/pantry-add-form";
import { PantryList } from "@/components/patients/pantry-list";
import { PantrySection } from "@/components/patients/pantry-section";
import { SectionFold } from "@/components/patients/section-fold";

type Rows = ComponentProps<typeof PantrySection>["essentials"];

type Props = {
  patientId: string;
  pseudonym: string;
  essentials: Rows;
  archived: Rows;
};

/** « Essentiels placard / frigo »: the short list, then the archived ones. */
export const PantryEssentialsSection = ({
  patientId,
  pseudonym,
  essentials,
  archived,
}: Props) => (
  <>
    <PantrySection
      patientId={patientId}
      pseudonym={pseudonym}
      essentials={essentials}
    >
      {essentials.length === 0 ? (
        <Typography size="sm" tone="muted">
          Aucun essentiel pour le moment.
        </Typography>
      ) : (
        <PantryList essentials={essentials} />
      )}
      <PantryAddForm patientId={patientId} />
    </PantrySection>

    {archived.length > 0 ? (
      <SectionFold
        id="archived-pantry"
        label="Essentiels archivés"
        count={archived.length}
      >
        <PantryList essentials={archived} />
      </SectionFold>
    ) : null}
  </>
);
