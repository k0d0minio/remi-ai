"use client";

import { useActionState } from "react";
import type { Locale, PatientProfile } from "@remi/services/shared";
import { locales, patientSexes, patientStatuses } from "@remi/services/shared";
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@remi/ui";
import { Field, Input, Separator, Textarea, Typography } from "@remi/ui/server";
import {
  savePatientAction,
  type PatientFormState,
} from "@/lib/patients/actions";
import {
  patientSexLabels,
  patientStatusLabels,
} from "@/components/patients/vocabulary";

const initial: PatientFormState = { error: null, saved: false };

const localeLabels: Record<Locale, string> = {
  fr: "français",
  en: "anglais",
};

type Props = {
  /** Present when editing; absent on `/patients/new`. */
  patient?: PatientProfile;
};

/**
 * One form for creating and editing — the hidden `id` decides which, so the
 * two paths cannot drift apart field by field. Status appears only once the
 * profile exists: a patient is created active or not at all.
 *
 * The clinical fields sit in their own block rather than mixed into identity.
 * They are the ones a protocol is actually written against, and separating
 * them is what lets Morgane scan for a medication without reading a paragraph.
 */
export const PatientForm = ({ patient }: Props) => {
  const [state, action, pending] = useActionState(savePatientAction, initial);

  return (
    <form action={action} className="flex flex-col gap-6">
      {patient ? <input type="hidden" name="id" value={patient.id} /> : null}

      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="pseudonym"
            label="Pseudonyme"
            hint="Le nom de travail — le seul que l'IA de REMI pourra un jour voir."
          >
            <Input
              id="pseudonym"
              name="pseudonym"
              required
              defaultValue={patient?.pseudonym ?? ""}
            />
          </Field>

          <Field
            id="fullName"
            label="Nom complet"
            optional
            hint="Identité réelle — ne quitte jamais cette console et le lien patient."
          >
            <Input
              id="fullName"
              name="fullName"
              defaultValue={patient?.fullName ?? ""}
            />
          </Field>

          <Field
            id="email"
            label="Adresse email"
            optional
            hint="Nécessaire pour envoyer le lien patient par email."
          >
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={patient?.email ?? ""}
            />
          </Field>

          <Field
            id="locale"
            label="Langue"
            hint="La langue dans laquelle s'affiche le lien patient."
          >
            <Select name="locale" defaultValue={patient?.locale ?? "fr"}>
              <SelectTrigger id="locale">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {locales.map((locale) => (
                  <SelectItem key={locale} value={locale}>
                    {localeLabels[locale]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {patient ? (
            <Field id="status" label="Statut">
              <Select name="status" defaultValue={patient.status}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {patientStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {patientStatusLabels[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          ) : null}
        </div>
      </div>

      <Separator tone="subtle" />

      <div className="flex flex-col gap-4">
        <Typography as="h3" variant="eyebrow" tone="muted">
          Données cliniques
        </Typography>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field
            id="birthDate"
            label="Date de naissance"
            optional
            hint="L'âge en est déduit ; il n'est jamais stocké."
          >
            <Input
              id="birthDate"
              name="birthDate"
              type="date"
              defaultValue={patient?.birthDate ?? ""}
            />
          </Field>

          <Field id="sex" label="Sexe">
            <Select name="sex" defaultValue={patient?.sex ?? "unspecified"}>
              <SelectTrigger id="sex">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {patientSexes.map((sex) => (
                  <SelectItem key={sex} value={sex}>
                    {patientSexLabels[sex]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field id="heightCm" label="Taille (cm)" optional>
            <Input
              id="heightCm"
              name="heightCm"
              type="number"
              inputMode="numeric"
              min={1}
              max={280}
              defaultValue={patient?.heightCm ?? ""}
            />
          </Field>

          <Field id="weightKg" label="Poids (kg)" optional>
            <Input
              id="weightKg"
              name="weightKg"
              type="number"
              inputMode="decimal"
              step="0.1"
              min={1}
              max={500}
              defaultValue={patient?.weightKg ?? ""}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="medications"
            label="Traitements en cours"
            optional
            hint="Séparés des contraintes pour rester lisibles d'un coup d'œil."
          >
            <Textarea
              id="medications"
              name="medications"
              rows={3}
              defaultValue={patient?.medications ?? ""}
            />
          </Field>

          <Field id="supplements" label="Compléments" optional>
            <Textarea
              id="supplements"
              name="supplements"
              rows={3}
              defaultValue={patient?.supplements ?? ""}
            />
          </Field>
        </div>

        <Field
          id="referral"
          label="Orientation"
          optional
          hint="Qui a orienté la personne, ou le médecin qui suit en parallèle."
        >
          <Input
            id="referral"
            name="referral"
            defaultValue={patient?.referral ?? ""}
          />
        </Field>
      </div>

      <Separator tone="subtle" />

      <div className="flex flex-col gap-4">
        <Typography as="h3" variant="eyebrow" tone="muted">
          Accompagnement
        </Typography>

        <Field
          id="objective"
          label="Objectif"
          optional
          hint="Ce que l'accompagnement vise. Visible sur le lien patient."
        >
          <Textarea
            id="objective"
            name="objective"
            rows={2}
            defaultValue={patient?.objective ?? ""}
          />
        </Field>

        <Field
          id="constraints"
          label="Contraintes"
          optional
          hint="Allergies, intolérances, contraintes médicales. Visible sur le lien patient."
        >
          <Textarea
            id="constraints"
            name="constraints"
            rows={3}
            defaultValue={patient?.constraints ?? ""}
          />
        </Field>

        <Field
          id="preferences"
          label="Préférences"
          optional
          hint="Goûts, habitudes, contexte de vie. Visible sur le lien patient."
        >
          <Textarea
            id="preferences"
            name="preferences"
            rows={3}
            defaultValue={patient?.preferences ?? ""}
          />
        </Field>

        <Field
          id="anamnesis"
          label="Anamnèse"
          optional
          hint="Vos notes de fond. Ne s'affiche pas sur le lien patient."
        >
          <Textarea
            id="anamnesis"
            name="anamnesis"
            rows={6}
            defaultValue={patient?.anamnesis ?? ""}
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending
            ? "Enregistrement…"
            : patient
              ? "Enregistrer les modifications"
              : "Créer le profil"}
        </Button>
        {state.error ? (
          <Typography size="sm" className="text-error-text" role="alert">
            {state.error}
          </Typography>
        ) : null}
        {state.saved && !state.error && !pending ? (
          <Typography size="sm" tone="muted" role="status">
            Enregistré.
          </Typography>
        ) : null}
      </div>
    </form>
  );
};
