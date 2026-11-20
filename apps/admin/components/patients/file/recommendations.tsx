import type { ComponentProps } from "react";
import { lifestyleKeyOf } from "@remi/services/shared";
import { Typography } from "@remi/ui/server";
import { RecommendationAddForm } from "@/components/patients/recommendation-add-form";
import { RecommendationGroups } from "@/components/patients/recommendation-groups";
import { RecommendationSection } from "@/components/patients/recommendation-section";
import { SectionFold } from "@/components/patients/section-fold";

type Rows = ComponentProps<typeof RecommendationSection>["recommendations"];

type Props = {
  patientId: string;
  pseudonym: string;
  recommendations: Rows;
  archived: Rows;
};

/** A row of the old categories `habit` and `activity` is not shown here. */
const notLifestyle = (rows: Rows): Rows =>
  rows.filter((row) => lifestyleKeyOf(row.category) === null);

const RecommendationsBody = ({
  patientId,
  pseudonym,
  recommendations,
  archived,
}: Props) => (
  <>
    <RecommendationSection
      patientId={patientId}
      pseudonym={pseudonym}
      recommendations={recommendations}
    >
      {recommendations.length === 0 ? (
        <Typography size="sm" tone="muted">
          Rien d&apos;encodé pour le moment.
        </Typography>
      ) : (
        <RecommendationGroups recommendations={recommendations} />
      )}
      <RecommendationAddForm patientId={patientId} />
    </RecommendationSection>

    {archived.length > 0 ? (
      <SectionFold
        id="archived-recommendations"
        label="Recommandations archivées"
        count={archived.length}
      >
        <div className="flex flex-col gap-3">
          <Typography size="sm" tone="muted">
            Ce qui a été suivi puis arrêté. Invisible sur le lien patient, gardé
            pour la suite du dossier.
          </Typography>
          <RecommendationGroups recommendations={archived} />
        </div>
      </SectionFold>
    ) : null}
  </>
);

/**
 * « Recommandations »: the protocol entry by entry, then the archived ones.
 *
 * « Hygiène de vie » shows the rows of the old categories `habit` and
 * `activity` (REM-65), so this section leaves them out. Its whole-section save
 * archives only a row that the editor showed, so it does not touch them.
 */
export const RecommendationsSection = (props: Props) => (
  <RecommendationsBody
    {...props}
    recommendations={notLifestyle(props.recommendations)}
    archived={notLifestyle(props.archived)}
  />
);
