import { formatDate } from "@remi/services/shared";
import type { PatientCheckIns } from "@remi/services/shared";
import { CheckInStrip, Typography, type CheckInMark } from "@remi/ui/server";
import { Button } from "@remi/ui";
import { acknowledgeCheckInAction } from "@/lib/patients/actions";
import { goalDirectionLabels } from "@/components/patients/vocabulary";

type Props = {
  patientId: string;
  checkIns: PatientCheckIns;
};

/**
 * The same strip the patient sees, in the console's goals slot — decision
 * D-9's « une vue de progression simple des deux côtés ».
 *
 * Her consultation check-ins and the patient's own answers sit on one
 * timeline, because the question she is asking is "how has this gone", not
 * "who typed it". `written_by` is what tells them apart, and it is drawn as a
 * ring rather than a second row: two timelines would make her reconcile them
 * herself.
 *
 * A « moins bien » the patient wrote carries « Vu » until she presses it. That
 * is what the awaiting-attention count reads, so the control belongs on the
 * mark rather than on the card — the count is per answer, and so is clearing it.
 */
export const CheckInStrips = ({ patientId, checkIns }: Props) => {
  const recommendations = checkIns.recommendations.filter(
    (trail) => trail.checkIns.length > 0,
  );

  if (checkIns.goals.length === 0 && recommendations.length === 0) {
    return (
      <Typography size="sm" tone="muted">
        Aucun point d&apos;étape pour le moment.
      </Typography>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {checkIns.goals.map((trail) => (
        <Subject
          key={trail.goal.id}
          title={trail.goal.title}
          marks={[...trail.checkIns].reverse().flatMap((entry) =>
            entry.direction === null
              ? []
              : [
                  mark({
                    id: entry.id,
                    checkedOn: entry.checkedOn,
                    direction: entry.direction,
                    note: entry.note,
                    fromPatient: entry.writtenBy === "patient",
                    acknowledged: entry.acknowledgedAt !== null,
                    kind: "goal",
                    patientId,
                    title: trail.goal.title,
                  }),
                ],
          )}
        />
      ))}

      {recommendations.map((trail) => (
        <Subject
          key={trail.recommendation.id}
          title={trail.recommendation.title}
          marks={[...trail.checkIns].reverse().map((entry) =>
            mark({
              id: entry.id,
              checkedOn: entry.checkedOn,
              direction: entry.direction,
              note: entry.note,
              fromPatient: true,
              acknowledged: entry.acknowledgedAt !== null,
              kind: "recommendation",
              patientId,
              title: trail.recommendation.title,
            }),
          )}
        />
      ))}
    </div>
  );
};

const Subject = ({
  title,
  marks,
}: {
  title: string;
  marks: readonly CheckInMark[];
}) => (
  <div className="flex flex-col gap-2">
    <Typography as="h3" size="sm" weight="medium">
      {title}
    </Typography>
    <CheckInStrip
      marks={marks}
      label={`Points d'étape — ${title}`}
      empty="Pas encore de point d'étape."
      directionLabels={goalDirectionLabels}
      formatDate={(value) => formatDate(value)}
    />
  </div>
);

type MarkInput = {
  id: string;
  checkedOn: string;
  direction: CheckInMark["direction"];
  note: string;
  fromPatient: boolean;
  acknowledged: boolean;
  kind: "goal" | "recommendation";
  patientId: string;
  title: string;
};

/**
 * One mark, with « Vu » attached only where it means something: the patient's
 * own worsening, not yet seen. Hers never wait on her, and a « mieux » is not
 * something to acknowledge.
 */
const mark = (input: MarkInput): CheckInMark => ({
  id: input.id,
  checkedOn: input.checkedOn,
  direction: input.direction,
  note: input.note,
  fromPatient: input.fromPatient,
  action:
    input.fromPatient && input.direction === "worse" && !input.acknowledged ? (
      <form action={acknowledgeCheckInAction}>
        <input type="hidden" name="id" value={input.id} />
        <input type="hidden" name="kind" value={input.kind} />
        <input type="hidden" name="patientId" value={input.patientId} />
        <input type="hidden" name="title" value={input.title} />
        <Button type="submit" size="sm" variant="ghost">
          Vu
        </Button>
      </form>
    ) : undefined,
});
