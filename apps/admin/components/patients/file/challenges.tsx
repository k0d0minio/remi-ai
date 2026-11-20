import type { ComponentProps } from "react";
import { ChallengeHistory } from "@/components/patients/challenge-history";
import { ChallengeSection } from "@/components/patients/challenge-section";
import { SectionFold } from "@/components/patients/section-fold";

type Props = {
  patientId: string;
  current: ComponentProps<typeof ChallengeSection>["current"];
  past: ComponentProps<typeof ChallengeHistory>["challenges"];
  today: string;
};

/** « Challenges »: the current one, then the past ones folded. */
export const ChallengesSection = ({
  patientId,
  current,
  past,
  today,
}: Props) => (
  <>
    <ChallengeSection patientId={patientId} current={current} today={today} />

    {past.length > 0 ? (
      <SectionFold
        id="past-challenges"
        label="Challenges passés"
        count={past.length}
      >
        <ChallengeHistory challenges={past} />
      </SectionFold>
    ) : null}
  </>
);
