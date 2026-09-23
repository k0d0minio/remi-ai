import type { PatientChallenge } from "@remi/services/shared";
import { formatDate } from "@remi/services/shared";
import { Typography } from "@remi/ui/server";
import { ChallengeStatus } from "@/components/patients/challenge-status";

type Props = {
  challenge: PatientChallenge | null;
};

/**
 * The working view's answer to "où en est son challenge ?": the habit, what the
 * patient has said about it, and — when they are ready for the next — the one
 * line that asks her to act, worded like the meals awaiting a reply. Editing
 * stays in the Challenges section.
 */
export const WorkingChallenge = ({ challenge }: Props) => {
  if (!challenge) {
    return (
      <Typography size="sm" tone="muted">
        Aucun challenge en cours.
      </Typography>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {challenge.readyForNextAt ? (
        <Typography size="sm" tone="muted">
          Prêt(e) pour le prochain challenge depuis le{" "}
          {formatDate(challenge.readyForNextAt)}.
        </Typography>
      ) : null}
      <Typography size="sm" weight="medium">
        {challenge.text}
      </Typography>
      <Typography size="xs" tone="muted">
        Depuis le {formatDate(challenge.startedOn)}
      </Typography>
      <ChallengeStatus challenge={challenge} />
    </div>
  );
};
