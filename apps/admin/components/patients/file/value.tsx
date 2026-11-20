import { BadgeCheck } from "lucide-react";
import { Typography } from "@remi/ui/server";

/**
 * The three states of a value on the patient file (story 6):
 * - absent: `AbsentValue`, muted, « Non renseigné ».
 * - entered: plain text, no mark.
 * - validated by the practitioner: the value, then `ValidatedMark`.
 *
 * A mark needs a fact in the data. The questionnaire fields do not record who
 * entered them yet, so they carry no mark (ticket: provenance markers).
 */
export const NOT_ENTERED = "Non renseigné";

export const AbsentValue = () => (
  <Typography size="sm" tone="muted">
    {NOT_ENTERED}
  </Typography>
);

type MarkProps = {
  /** The word beside the icon. The state never reads from the icon alone. */
  label?: string;
};

export const ValidatedMark = ({ label = "validé" }: MarkProps) => (
  <Typography
    as="span"
    size="xs"
    weight="medium"
    className="text-success-text inline-flex items-center gap-1"
  >
    <BadgeCheck aria-hidden="true" className="size-3.5 shrink-0" />
    {label}
  </Typography>
);
