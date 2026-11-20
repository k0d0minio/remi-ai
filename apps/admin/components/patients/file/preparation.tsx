import { formatDate } from "@remi/services/shared";
import { Typography } from "@remi/ui/server";
import { ConsultationDate } from "@/components/patients/consultation-date";
import { PrepNote } from "@/components/patients/prep-note";

type Props = {
  patientId: string;
  pseudonym: string;
  /** The appointment, as the questionnaire holds it. */
  consultationDate: string | null;
  /** The preparation note. Null when none is written. */
  prepNote: string | null;
};

/**
 * The preparation of the consultation: the appointment date and the note « à
 * préparer ». At « Prêt pour consultation » it is in the action card. At each
 * other status it is the row « Préparation ». The page shows it one time, so
 * two forms never hold the same value.
 */
export const PreparationSection = ({
  patientId,
  pseudonym,
  consultationDate,
  prepNote,
}: Props) => (
  <>
    <div className="flex flex-col gap-2">
      <Typography as="h3" size="sm" weight="semibold">
        Date de consultation
      </Typography>
      <Typography size="sm" tone="muted">
        Le rendez-vous de la personne. Le questionnaire écrit la même date.
      </Typography>
      <ConsultationDate
        patientId={patientId}
        value={consultationDate}
        formatted={consultationDate ? formatDate(consultationDate) : null}
      />
    </div>

    <div className="flex flex-col gap-2">
      <Typography as="h3" size="sm" weight="semibold">
        À préparer pour la prochaine consultation
      </Typography>
      <Typography size="sm" tone="muted">
        Ce que vous voulez avoir en tête quand vous la revoyez, écrit et revu
        entre deux consultations.
      </Typography>
      <PrepNote patientId={patientId} pseudonym={pseudonym} value={prepNote} />
    </div>
  </>
);
