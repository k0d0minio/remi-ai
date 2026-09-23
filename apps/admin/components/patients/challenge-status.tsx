import type { PatientChallenge } from "@remi/services/shared";
import { formatDate } from "@remi/services/shared";
import { Badge } from "@remi/ui/server";

type Props = {
  challenge: PatientChallenge;
};

/**
 * What the patient has said about a challenge, as two dated badges — the two
 * signals her § 7 asks to see without opening WhatsApp. One component for the
 * section, the working view and the past list, so the three can never word
 * the same tap differently.
 */
export const ChallengeStatus = ({ challenge }: Props) => {
  const { acquiredAt, readyForNextAt } = challenge;
  if (!acquiredAt && !readyForNextAt) {
    return challenge.closedOn === null ? (
      <Badge variant="neutral" tone="subtle" size="sm">
        En cours
      </Badge>
    ) : null;
  }

  return (
    <span className="flex flex-wrap gap-2">
      {acquiredAt ? (
        <Badge variant="success" tone="subtle" size="sm">
          Challenge acquis le {formatDate(acquiredAt)}
        </Badge>
      ) : null}
      {readyForNextAt ? (
        <Badge variant="info" tone="subtle" size="sm">
          Prêt(e) pour le prochain depuis le {formatDate(readyForNextAt)}
        </Badge>
      ) : null}
    </span>
  );
};
