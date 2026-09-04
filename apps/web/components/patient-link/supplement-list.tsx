import type { PatientSupplement } from "@remi/services/shared";
import { Card, CardContent, Typography } from "@remi/ui/server";
import type { Content } from "@/lib/content/types";

type Props = {
  supplements: readonly PatientSupplement[];
  content: Content["patientLink"];
};

/**
 * § J's "compléments validés": what Morgane validated, how it is taken, and
 * her reason where she wrote one. Nothing here comes from the profile's
 * free-text `supplements` field — the protocol replaced it.
 */
export const SupplementList = ({ supplements, content }: Props) => (
  <ul className="flex flex-col gap-3">
    {supplements.map((supplement) => {
      const details = [
        supplement.dose.trim() !== ""
          ? `${content.doseLabel} : ${supplement.dose}`
          : null,
        supplement.timing.trim() !== ""
          ? `${content.timingLabel} : ${supplement.timing}`
          : null,
      ].filter((entry) => entry !== null);

      return (
        <li key={supplement.id}>
          <Card>
            <CardContent className="flex flex-col gap-2">
              <Typography as="h3" size="sm" weight="medium">
                {supplement.name}
              </Typography>
              {details.length > 0 ? (
                <Typography size="sm" tone="muted">
                  {details.join(" · ")}
                </Typography>
              ) : null}
              {supplement.reason.trim() !== "" ? (
                <Typography
                  size="sm"
                  tone="muted"
                  className="whitespace-pre-line"
                >
                  {content.reasonLabel} : {supplement.reason}
                </Typography>
              ) : null}
            </CardContent>
          </Card>
        </li>
      );
    })}
  </ul>
);
