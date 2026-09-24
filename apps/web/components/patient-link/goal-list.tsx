import type {
  Locale,
  PatientDocument,
  PatientGoal,
} from "@remi/services/shared";
import { Card, CardContent, Typography } from "@remi/ui/server";
import { DocumentList } from "@/components/patient-link/document-list";
import type { Content } from "@/lib/content/types";

type Props = {
  goals: readonly PatientGoal[];
  content: Content["patientLink"];
  /** Every document of the patient — each goal shows those attached to it. */
  documents: readonly PatientDocument[];
  locale: Locale;
  token: string;
};

/**
 * The priority goals in Morgane's order, each with the starting point she
 * wrote where there is one — § D's structured replacement for the profile's
 * free-text objective. The check-ins stay in the console: her record of how a
 * goal is moving is not the patient's page. A document she attached to a goal
 * sits under it (D-26).
 */
export const GoalList = ({
  goals,
  content,
  documents,
  locale,
  token,
}: Props) => (
  <ul className="flex flex-col gap-3">
    {goals.map((goal) => {
      const attached = documents.filter(
        (document) => document.goalId === goal.id,
      );
      return (
        <li key={goal.id}>
          <Card>
            <CardContent className="flex flex-col gap-2">
              <Typography as="h3" size="sm" weight="medium">
                {goal.title}
              </Typography>
              {goal.baseline.trim() !== "" ? (
                <Typography size="sm" tone="muted">
                  {content.baselineLabel} : {goal.baseline}
                </Typography>
              ) : null}
              {attached.length > 0 ? (
                <div className="flex flex-col gap-1">
                  <Typography size="xs" tone="muted" weight="medium">
                    {content.attachedDocumentsLabel}
                  </Typography>
                  <DocumentList
                    documents={attached}
                    locale={locale}
                    token={token}
                    content={content}
                    inline
                  />
                </div>
              ) : null}
            </CardContent>
          </Card>
        </li>
      );
    })}
  </ul>
);
