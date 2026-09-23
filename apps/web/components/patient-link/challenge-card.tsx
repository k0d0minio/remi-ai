import type { PatientChallenge } from "@remi/services/shared";
import { formatDate } from "@remi/services/shared";
import { Card, CardContent, Typography } from "@remi/ui/server";
import { ChallengeTaps } from "@/components/patient-link/challenge-taps";
import type { Content } from "@/lib/content/types";

type Props = {
  challenge: PatientChallenge | null;
  locale: string;
  /** The credential the taps post back with — never a patient id. */
  token: string;
  content: Content["patientLink"];
};

/**
 * The challenge she is running with the patient, first thing under
 * « Aujourd'hui » — her § 2: « Le challenge en cours doit être facilement
 * visible ».
 *
 * It always renders. With none running the slot says so, because a home whose
 * first block comes and goes reads as a page that forgot something.
 */
export const ChallengeCard = ({ challenge, locale, token, content }: Props) => (
  <Card variant={challenge ? "info" : "neutral"}>
    <CardContent className="flex flex-col gap-2">
      <Typography as="h3" size="sm" weight="semibold">
        {content.challenge.title}
      </Typography>
      {challenge ? (
        <>
          <Typography
            size="base"
            weight="medium"
            className="whitespace-pre-line"
          >
            {challenge.text}
          </Typography>
          {challenge.why.trim() !== "" ? (
            <Typography size="sm" tone="muted" className="whitespace-pre-line">
              {challenge.why}
            </Typography>
          ) : null}
          <Typography size="xs" tone="muted">
            {content.challenge.since} {formatDate(challenge.startedOn, locale)}
          </Typography>
          <ChallengeTaps
            challengeId={challenge.id}
            acquired={challenge.acquiredAt !== null}
            readyForNext={challenge.readyForNextAt !== null}
            token={token}
            locale={locale}
            content={content}
          />
        </>
      ) : (
        <Typography size="sm" tone="muted">
          {content.challenge.empty}
        </Typography>
      )}
    </CardContent>
  </Card>
);
