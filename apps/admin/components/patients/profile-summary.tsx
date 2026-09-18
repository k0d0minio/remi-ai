"use client";

import { Pencil, X } from "lucide-react";
import { useState } from "react";
import type { PatientProfile } from "@remi/services/shared";
import { ageInYears } from "@remi/services/shared";
import { Button } from "@remi/ui";
import { Badge, Separator, Typography } from "@remi/ui/server";
import { PatientForm } from "@/components/patients/patient-form";
import {
  cookingAffinityLabels,
  localeLabels,
  patientSexLabels,
  patientStatusLabels,
} from "@/components/patients/vocabulary";

type Props = {
  patient: PatientProfile;
  /**
   * Both dates arrive formatted. `Intl` resolves against the runtime's
   * timezone, so formatting here would render one day in Brussels and another
   * in the browser of anyone east or west of it — and disagree with the server
   * markup on hydration. The server is the one clock.
   */
  lastEditedAt: string;
  /** « Recueilli le … · WhatsApp », or `null` when it is not recorded. */
  consent: string | null;
};

/** One line of the read summary. `null` reads as an em dash. */
type Row = {
  label: string;
  value: string | null;
};

/**
 * The profile as something to read, with the form one click behind it.
 *
 * Reading a consent date used to mean opening a five-hundred-line form and
 * scrolling past every field to find two. The summary answers the questions she
 * asks between consultations; « Modifier » swaps in the form itself, whole and
 * unchanged, for the times she is actually encoding.
 *
 * The form is not closed for her on save: it owns its own « Enregistré. » and
 * saying so where she is looking is worth more than collapsing under her.
 */
export const ProfileSummary = ({ patient, lastEditedAt, consent }: Props) => {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setEditing(false)}
          >
            <X aria-hidden="true" />
            Fermer
          </Button>
        </div>
        <PatientForm patient={patient} />
      </div>
    );
  }

  const age = ageInYears(patient.birthDate);

  const identity: Row[] = [
    { label: "Pseudonyme", value: patient.pseudonym },
    { label: "Nom complet", value: patient.fullName },
    { label: "Adresse email", value: patient.email },
    { label: "Langue", value: localeLabels[patient.locale] },
    { label: "Statut", value: patientStatusLabels[patient.status] },
  ];

  const measures: Row[] = [
    { label: "Âge", value: age === null ? null : `${age} ans` },
    {
      label: "Sexe",
      value:
        patient.sex === "unspecified" ? null : patientSexLabels[patient.sex],
    },
    {
      label: "Taille",
      value: patient.heightCm === null ? null : `${patient.heightCm} cm`,
    },
    {
      label: "Poids",
      value: patient.weightKg === null ? null : `${patient.weightKg} kg`,
    },
  ];

  const food: Row[] = [
    { label: "Régime alimentaire", value: patient.dietaryRegime },
    { label: "Allergies", value: patient.allergies },
    { label: "Intolérances", value: patient.intolerances },
    { label: "Budget alimentaire", value: patient.foodBudget },
    {
      label: "Aime cuisiner",
      value:
        patient.likesCooking === null
          ? null
          : cookingAffinityLabels[patient.likesCooking],
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Typography size="sm" tone="muted">
          {`Modifié le ${lastEditedAt}`}
        </Typography>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setEditing(true)}
        >
          <Pencil aria-hidden="true" />
          Modifier
        </Button>
      </div>

      <SummaryGroup title="Identité" rows={identity} />
      <Separator tone="subtle" />
      <SummaryGroup title="Mesures" rows={measures} />
      <Separator tone="subtle" />
      <SummaryGroup title="Alimentation" rows={food} />
      <Separator tone="subtle" />

      <div className="flex flex-col gap-2">
        <Typography as="h3" variant="eyebrow" tone="muted">
          Consentement
        </Typography>
        <div className="flex flex-wrap gap-2">
          {consent ? (
            <Badge variant="success" tone="subtle" size="sm">
              {consent}
            </Badge>
          ) : (
            <Badge variant="warning" tone="subtle" size="sm">
              Pas encore enregistré
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

type GroupProps = {
  title: string;
  rows: readonly Row[];
};

const hasValue = (row: Row) => row.value !== null && row.value.trim() !== "";

const SummaryGroup = ({ title, rows }: GroupProps) => (
  <div className="flex flex-col gap-2">
    <Typography as="h3" variant="eyebrow" tone="muted">
      {title}
    </Typography>
    {rows.some(hasValue) ? (
      <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-0.5">
            <dt>
              <Typography size="xs" tone="muted">
                {row.label}
              </Typography>
            </dt>
            <dd>
              <Typography size="sm" className="whitespace-pre-line">
                {hasValue(row) ? row.value : "—"}
              </Typography>
            </dd>
          </div>
        ))}
      </dl>
    ) : (
      <Typography size="sm" tone="muted">
        Rien d&apos;encodé.
      </Typography>
    )}
  </div>
);
