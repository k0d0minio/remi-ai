import type { PatientChallenge } from "@remi/services/shared";
import { formatDate } from "@remi/services/shared";
import { Badge, Typography } from "@remi/ui/server";
import { ChallengeStatus } from "@/components/patients/challenge-status";
import {
  challengeOutcomeIntents,
  challengeOutcomeLabels,
} from "@/components/patients/vocabulary";

type Props = {
  challenges: readonly PatientChallenge[];
};

/**
 * The closed challenges, most recently closed first: the habit, its dates, the
 * outcome she gave it and what the patient had said by then. Read-only — a
 * closed challenge is frozen, and this is the record « Ma progression » will
 * read from.
 */
export const ChallengeHistory = ({ challenges }: Props) => (
  <ol className="flex flex-col gap-2">
    {challenges.map((challenge) => (
      <li
        key={challenge.id}
        className="border-border flex flex-col gap-1 border-b pb-2 last:border-b-0"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Typography size="sm" weight="medium">
            {challenge.text}
          </Typography>
          {challenge.outcome ? (
            <Badge
              variant={challengeOutcomeIntents[challenge.outcome]}
              tone="subtle"
              size="sm"
            >
              {challengeOutcomeLabels[challenge.outcome]}
            </Badge>
          ) : null}
        </div>
        <Typography size="xs" tone="muted">
          Du {formatDate(challenge.startedOn)}
          {challenge.closedOn ? ` au ${formatDate(challenge.closedOn)}` : ""}
        </Typography>
        <ChallengeStatus challenge={challenge} />
      </li>
    ))}
  </ol>
);
