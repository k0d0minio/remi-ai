import { ArrowLeft } from "lucide-react";
import NextLink from "next/link";
import {
  fileStatuses,
  fileStatusLabels,
  formatDate,
  type PatientProfile,
} from "@remi/services/shared";
import { Badge, StepPath, Typography } from "@remi/ui/server";
import { SafetyStrip } from "@/components/patients/file/safety-strip";
import { NOT_ENTERED } from "@/components/patients/file/value";
import type { QuestionnaireView } from "@/components/patients/questionnaire-answers";
import {
  patientStatusIntents,
  patientStatusLabels,
} from "@/components/patients/vocabulary";

type Props = {
  patient: Pick<
    PatientProfile,
    "pseudonym" | "fileStatus" | "status" | "medications"
  >;
  /** The name the page shows: the patient's, else the practitioner's, else the pseudonym. */
  name: string;
  questionnaire: QuestionnaireView;
  /** An admin's open of another practitioner's file. */
  readOnly: boolean;
  /** Where the link above the name goes back to. */
  back: { href: string; label: string };
};

const statusSteps = fileStatuses.map((status) => ({
  key: status,
  label: fileStatusLabels[status].fr,
}));

/**
 * The header of the patient file. It stays in view while the page scrolls and
 * answers « Où en est-on ? »: the name, the appointment, the four statuses as
 * a path with the present one marked, and the safety items in short form.
 * The way back is above it and does not stay in view.
 */
export const PatientHeader = ({
  patient,
  name,
  questionnaire,
  readOnly,
  back,
}: Props) => {
  const consultationDate = questionnaire.answers.consultationDate;
  return (
    <>
      <NextLink
        href={back.href}
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex min-h-11 w-fit items-center gap-1.5 rounded-sm text-sm transition-colors duration-[--duration-fast] focus-visible:outline-none focus-visible:ring-[3px] sm:min-h-0"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        {back.label}
      </NextLink>
      <header className="bg-background border-border z-20 -mt-4 [@media(min-height:720px)]:sticky [@media(min-height:720px)]:top-14 flex flex-col gap-2 border-b pb-3 pt-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <Typography
            as="h1"
            size="2xl"
            weight="semibold"
            className="max-sm:text-xl"
          >
            {name}
          </Typography>
          <Badge
            variant={patientStatusIntents[patient.status]}
            tone="subtle"
            size="sm"
          >
            {patientStatusLabels[patient.status]}
          </Badge>
          {readOnly ? (
            <Badge variant="warning" tone="subtle" size="sm">
              Lecture seule
            </Badge>
          ) : null}
        </div>
        <Typography size="sm" tone="muted">
          {`Rendez-vous : ${
            consultationDate ? formatDate(consultationDate) : NOT_ENTERED
          }`}
          <span className="max-sm:hidden">{` · Pseudonyme : ${patient.pseudonym}`}</span>
        </Typography>
        <StepPath
          steps={statusSteps}
          current={patient.fileStatus}
          label="Statut du dossier"
          stateLabels={{
            done: "étape passée",
            current: "statut actuel",
            upcoming: "étape à venir",
          }}
          compact
        />
        <SafetyStrip
          questionnaire={questionnaire}
          medications={patient.medications}
        />
      </header>
    </>
  );
};
