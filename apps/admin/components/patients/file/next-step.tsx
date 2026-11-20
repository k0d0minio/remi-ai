import NextLink from "next/link";
import type { ReactNode } from "react";
import type {
  MandatoryQuestionnaireField,
  OptionalQuestionnaireField,
  PatientFileAction,
  PatientProfile,
} from "@remi/services/shared";
import { Button } from "@remi/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Typography,
} from "@remi/ui/server";
import {
  ActivationEmail,
  ActivationRecapBlock,
  CareActivated,
} from "@/components/patients/file/activation";
import { countLabel } from "@/components/patients/file/count-label";
import { MissingInformation } from "@/components/patients/file/missing-information";
import { ProtocolValidation } from "@/components/patients/protocol-validation";

/** What the validation will hold, one line for each topic. */
export type ProtocolCounts = {
  goals: number;
  recommendations: number;
  supplements: number;
  /** An instruction is in force. */
  instruction: boolean;
  /** The calculations that carry a value the practitioner validated. */
  validatedCalculations: number;
};

type Props = {
  /** From `patientFileLayout`: what the card shows at the present status. */
  action: PatientFileAction;
  patient: Pick<PatientProfile, "id" | "fileStatus">;
  /** An admin's open of another practitioner's file. */
  readOnly: boolean;
  missingMandatory: readonly MandatoryQuestionnaireField[];
  missingOptional: readonly OptionalQuestionnaireField[];
  /** The appointment and the preparation note. Shown for `prepare` only. */
  preparation: ReactNode;
  protocol: ProtocolCounts;
  /** The patient's open changes. Null when the page did not count them. */
  openChanges: number | null;
  /** The quick actions, under the content of the card. */
  shortcuts: ReactNode;
};

const titles: Record<
  PatientFileAction,
  { title: string; description: string }
> = {
    complete: {
      title: "À faire : compléter le dossier",
      description: "Ce qui manque au dossier avant la consultation.",
    },
    prepare: {
      title: "À faire : préparer la consultation",
      description:
        "Le dossier est prêt. Le rendez-vous, votre note de préparation, puis la consultation.",
    },
    validate: {
      title: "À faire : valider, puis activer l'accompagnement",
      description:
        "Relisez le protocole ci-dessous et validez-le : la validation enregistre une version. Relisez ensuite le récapitulatif, puis activez l'accompagnement.",
    },
    follow: {
      title: "Accompagnement actif",
      description:
        "La version validée et ce que la personne a changé depuis.",
    },
};

/** « Objectifs : 2 objectifs »: one line for each topic of the protocol. */
const ProtocolLines = ({ protocol }: { protocol: ProtocolCounts }) => {
  const lines = [
    {
      key: "goals",
      label: "Objectifs",
      value: countLabel(protocol.goals, {
        none: "Aucun objectif",
        one: "objectif",
        many: "objectifs",
      }),
    },
    {
      key: "recommendations",
      label: "Recommandations",
      value: countLabel(protocol.recommendations, {
        none: "Aucune recommandation",
        one: "recommandation",
        many: "recommandations",
      }),
    },
    {
      key: "supplements",
      label: "Compléments",
      value: countLabel(protocol.supplements, {
        none: "Aucun complément",
        one: "complément",
        many: "compléments",
      }),
    },
    {
      key: "instruction",
      label: "Consigne",
      value: protocol.instruction ? "Rédigée" : "Aucune consigne",
    },
    {
      key: "calculations",
      label: "Calculs",
      value: countLabel(protocol.validatedCalculations, {
        none: "Aucun calcul validé",
        one: "calcul validé",
        many: "calculs validés",
      }),
    },
  ];
  return (
    <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
      {lines.map((line) => (
        <div key={line.key} className="flex items-baseline gap-2">
          <dt>
            <Typography as="span" size="sm" tone="muted">
              {`${line.label} :`}
            </Typography>
          </dt>
          <dd>
            <Typography as="span" size="sm" weight="medium">
              {line.value}
            </Typography>
          </dd>
        </div>
      ))}
    </dl>
  );
};

const changesLine = (count: number) =>
  count === 0
    ? "Aucune modification de la personne en attente."
    : count === 1
      ? "1 modification de la personne à prendre en compte."
      : `${count} modifications de la personne à prendre en compte.`;

/**
 * The action card: the one thing to do at the present status, directly under
 * the header. It answers « Que dois-je faire maintenant ? ». It is the only
 * place of the page with a dominant button (charter, section 8).
 *
 * `ProtocolValidation` renders at each status, as before this layout: it
 * shows nothing until a version exists or the file can be validated. At
 * « Recommandations à valider » the recap of the activation follows it, with
 * « Activer l'accompagnement » (story 19). An active file shows its date,
 * and the state of the e-mail « Votre espace REMI est prêt ».
 */
export const NextStepCard = ({
  action,
  patient,
  readOnly,
  missingMandatory,
  missingOptional,
  preparation,
  protocol,
  openChanges,
  shortcuts,
}: Props) => {
  const { title, description } = titles[action];
  const missingCount = missingMandatory.length + missingOptional.length;
  return (
    <section id="next-step" data-segment="suivi" className="scroll-mt-60">
      <Card variant="info" className="rounded-3xl">
        <CardHeader>
          <CardTitle>
            <Typography as="h2" size="lg" weight="semibold">
              {title}
            </Typography>
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {action === "complete" ? (
            <>
              <MissingInformation
                mandatory={missingMandatory}
                optional={missingOptional}
              />
              <Button asChild className="w-full sm:w-fit">
                <a href="#profile">Compléter le dossier</a>
              </Button>
            </>
          ) : null}

          {action === "prepare" ? (
            <>
              {preparation}
              <Button asChild className="w-full sm:w-fit">
                <NextLink href={`/patients/${patient.id}/consultation`}>
                  Nouvelle consultation
                </NextLink>
              </Button>
            </>
          ) : null}

          {action === "validate" ? <ProtocolLines protocol={protocol} /> : null}

          {action === "follow" ? <CareActivated patient={patient} /> : null}

          {/*
            « Votre espace REMI est prêt » (story 19): the date of the e-mail,
            or why it did not go out, with « Renvoyer l'e-mail ».
          */}
          {action === "follow" ? (
            <ActivationEmail patient={patient} readOnly={readOnly} />
          ) : null}

          {action === "follow" && openChanges !== null ? (
            <Typography size="sm" weight={openChanges > 0 ? "medium" : "normal"}>
              {changesLine(openChanges)}
            </Typography>
          ) : null}

          <ProtocolValidation patient={patient} readOnly={readOnly} />

          {/*
            Activation (story 19): the recap of the validated version, the
            blockers and « Activer l'accompagnement ». It comes after the
            validation: the practitioner validates, then activates.
          */}
          {action === "validate" ? (
            <ActivationRecapBlock patient={patient} readOnly={readOnly} />
          ) : null}

          {/*
            Patient changes (story 21). The list of the open changes (field,
            old value, new value, date) and the acknowledge action go here,
            for `follow`. Another ticket builds them.
          */}

          {action !== "complete" && missingCount > 0 ? (
            <MissingInformation
              mandatory={missingMandatory}
              optional={missingOptional}
            />
          ) : null}

          <div className="border-border border-t pt-4">{shortcuts}</div>
        </CardContent>
      </Card>
    </section>
  );
};
