"use client";

import { useActionState } from "react";
import type { Locale, PatientProfile } from "@remi/services/shared";
import {
  consentChannels,
  cookingAffinities,
  formatDate,
  locales,
  patientSexes,
  patientStatuses,
} from "@remi/services/shared";
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@remi/ui";
import {
  Badge,
  Field,
  Input,
  Separator,
  Textarea,
  Typography,
} from "@remi/ui/server";
import {
  savePatientAction,
  type PatientFormState,
} from "@/lib/patients/actions";
import {
  consentChannelLabels,
  cookingAffinityLabels,
  dietaryRegimeSuggestions,
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

  // Both halves or neither: a date with no channel says nothing about what the
  // patient actually agreed through, so it still reads as not recorded.
  const consent =
    patient?.consentDate && patient.consentChannel
      ? { date: patient.consentDate, channel: patient.consentChannel }
      : null;

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
        <div className="flex flex-wrap items-center gap-2">
          <Typography as="h3" variant="eyebrow" tone="muted">
            Consentement
          </Typography>
          {consent ? (
            <Badge variant="success" tone="subtle" size="sm">
              {`Recueilli le ${formatDate(consent.date)} · ${consentChannelLabels[consent.channel]}`}
            </Badge>
          ) : (
            <Badge variant="warning" tone="subtle" size="sm">
              Pas encore enregistré
            </Badge>
          )}
        </div>

        <Typography size="sm" tone="muted">
          Quand et comment la personne a accepté que REMI conserve son dossier
          et que le lien patient existe. C&apos;est un fait consigné : rien
          n&apos;est bloqué tant qu&apos;il manque.
        </Typography>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="consentDate"
            label="Date du consentement"
            optional
            hint="Le jour où la personne a accepté."
          >
            <Input
              id="consentDate"
              name="consentDate"
              type="date"
              defaultValue={patient?.consentDate ?? ""}
            />
          </Field>

          <Field
            id="consentChannel"
            label="Canal"
            optional
            hint="Par quel biais l'accord a été donné."
          >
            <Select
              name="consentChannel"
              defaultValue={patient?.consentChannel ?? ""}
            >
              <SelectTrigger id="consentChannel">
                <SelectValue placeholder="Non renseigné" />
              </SelectTrigger>
              <SelectContent>
                {consentChannels.map((channel) => (
                  <SelectItem key={channel} value={channel}>
                    {consentChannelLabels[channel]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
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

          <Field
            id="supplements"
            label="Compléments déjà pris, hors protocole"
            optional
            hint="Ce que la personne prend déjà d'elle-même — le protocole prescrit se tient plus haut."
          >
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
          id="dietaryRegime"
          label="Régime alimentaire"
          optional
          hint="Végétarien, sans gluten… Écrivez librement ; les propositions ne sont qu'une aide à la saisie."
        >
          <Input
            id="dietaryRegime"
            name="dietaryRegime"
            list="dietaryRegimeSuggestions"
            defaultValue={patient?.dietaryRegime ?? ""}
          />
        </Field>

        {/*
         * Outside the Field: it clones a single child to wire aria-describedby,
         * and a second element would leave the hint unannounced.
         */}
        <datalist id="dietaryRegimeSuggestions">
          {dietaryRegimeSuggestions.map((regime) => (
            <option key={regime} value={regime} />
          ))}
        </datalist>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="allergies"
            label="Allergies"
            optional
            hint="Exclusions absolues. Séparées des intolérances : ce ne sont pas les mêmes conséquences."
          >
            <Textarea
              id="allergies"
              name="allergies"
              rows={3}
              defaultValue={patient?.allergies ?? ""}
            />
          </Field>

          <Field
            id="intolerances"
            label="Intolérances"
            optional
            hint="Ce qui passe mal sans être dangereux."
          >
            <Textarea
              id="intolerances"
              name="intolerances"
              rows={3}
              defaultValue={patient?.intolerances ?? ""}
            />
          </Field>
        </div>

        <Field
          id="constraints"
          label="Contraintes médicales"
          optional
          hint="Ce qui n'est ni une allergie ni une intolérance. Visible sur le lien patient."
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

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="likesCooking"
            label="Aime cuisiner"
            optional
            hint="Détermine à quel point une suggestion doit rester simple."
          >
            <Select
              name="likesCooking"
              defaultValue={patient?.likesCooking ?? ""}
            >
              <SelectTrigger id="likesCooking">
                <SelectValue placeholder="Non renseigné" />
              </SelectTrigger>
              <SelectContent>
                {cookingAffinities.map((affinity) => (
                  <SelectItem key={affinity} value={affinity}>
                    {cookingAffinityLabels[affinity]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field
            id="foodBudget"
            label="Budget alimentaire"
            optional
            hint="Ce qui garde les suggestions réalistes. Texte libre."
          >
            <Input
              id="foodBudget"
              name="foodBudget"
              defaultValue={patient?.foodBudget ?? ""}
            />
          </Field>
        </div>

        <Field
          id="anamnesis"
          label="Anamnèse"
          optional
          hint="L'ancien bloc unique. À redistribuer dans les catégories d'anamnèse de la fiche, puis à vider. Ne s'affiche pas sur le lien patient."
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
