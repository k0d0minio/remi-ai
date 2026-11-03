import { ShieldCheck } from "lucide-react";
import { formatDate } from "@remi/services/shared";
import { Button } from "@remi/ui";
import { Typography } from "@remi/ui/server";
import { setRetentionHoldAction } from "@/lib/patients/retention-hold";

type Props = {
  patientId: string;
  /** When an owner set the hold. Null: no hold. */
  heldAt: Date | null;
};

/**
 * The retention hold (`inactive-account-deletion`). REMI deletes an account
 * after twelve months without activity, after a notice. The hold stops both
 * on this file. The page renders it for an owner only.
 */
export const RetentionHold = ({ patientId, heldAt }: Props) => (
  <form
    action={setRetentionHoldAction}
    className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
  >
    <input type="hidden" name="id" value={patientId} />
    <input type="hidden" name="held" value={heldAt ? "0" : "1"} />
    <Typography size="sm" tone="muted">
      {heldAt
        ? `Conservation posée le ${formatDate(heldAt)} : REMI ne supprime pas ce dossier pour inactivité et n'envoie pas d'avis.`
        : "Sans connexion ni écriture pendant douze mois, REMI supprime ce dossier, un mois après un avis par e-mail. Une conservation bloque la suppression."}
    </Typography>
    <Button type="submit" size="sm" variant="outline">
      <ShieldCheck aria-hidden="true" />
      {heldAt ? "Lever la conservation" : "Poser une conservation"}
    </Button>
  </form>
);
