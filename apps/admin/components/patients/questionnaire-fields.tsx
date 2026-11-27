"use client";

import type {
  PatientAllergen,
  PatientProfile,
  PatientQuestionnaire,
  QuestionnaireSection,
} from "@remi/services/shared";
import {
  activityLevelDetails,
  activityLevels,
  amy1aCategories,
  apoeGenotypes,
  dietLabels,
  diets,
  dio2Categories,
  geneticTestAnswerLabels,
  geneticTestAnswers,
  mandatoryQuestionnaireFieldLabels,
  sexesForCalculation,
  sexForCalculationLabels,
} from "@remi/services/shared";
import { Field, Input, Textarea, Typography } from "@remi/ui/server";
import { AllergenField } from "@/components/patients/allergen-field";
import {
  ChoiceCards,
  type ChoiceOption,
} from "@/components/patients/choice-cards";
import {
  FormGroup,
  MandatoryLabel,
} from "@/components/patients/form-groups";

/** `""` reads « Non renseigné » in an empty text field (story 6). */
export const EMPTY = "Non renseigné";

/**
 * A disabled field posts nothing, so the action leaves the stored value as it
 * is. The patient gives the care consent in REMI, never the console.
 */
const CARE_CONSENT_REQUIRED =
  "Consentement requis : enregistré une fois que la personne a donné son consentement aux soins dans REMI.";

type Props = {
  /** Present when editing. Absent on « Nouveau patient ». */
  patient?: PatientProfile;
  /** The stored answers. Absent on « Nouveau patient »: every field is empty. */
  answers?: PatientQuestionnaire;
  allergens?: readonly PatientAllergen[];
  /** The patient gave the genetic consent. Locked without it. */
  genotypeOpen: boolean;
  /**
   * The patient gave the care consent. The desired weight, the treatments and
   * the supplements stay locked without it (story 3): the service refuses them.
   */
  careConsentGiven: boolean;
  /** How many mandatory answers each section still misses, from the form. */
  missing: Readonly<Record<QuestionnaireSection, number>>;
};

const plain = (values: readonly string[]): ChoiceOption[] =>
  values.map((value) => ({ value, label: value }));

const mandatory = mandatoryQuestionnaireFieldLabels;

/**
 * The six groups of the preparatory questionnaire, in the patient's order
 * (story 4): Identité, Profil, Consultation, Alimentation, Santé, Génétique.
 * The sections, the keys and the options come from `shared/questionnaire.ts`,
 * so the console and the patient's pages ask the same questions (story 1:
 * « exactement comme si le patient s'était inscrit lui-même »). The labels are
 * the console's own, in a neutral tone.
 *
 * Nothing here is `required`: the file saves with missing answers, and each
 * group says how many mandatory ones it misses.
 */
export const QuestionnaireFields = ({
  patient,
  answers,
  allergens = [],
  genotypeOpen,
  careConsentGiven,
  missing,
}: Props) => (
  <>
    <FormGroup group="identite" missing={null}>
      <div className="@xl:grid-cols-2 grid gap-4">
        <Field
          id="firstName"
          label="Prénom"
          hint={
            patient?.fullName && !patient.firstName && !patient.lastName
              ? `Nom actuel : ${patient.fullName}. Vide, il reste tel quel.`
              : "Identité réelle — ne quitte jamais cette console et le lien patient."
          }
        >
          <Input
            id="firstName"
            name="firstName"
            placeholder={EMPTY}
            defaultValue={patient?.firstName ?? ""}
          />
        </Field>

        <Field id="lastName" label="Nom">
          <Input
            id="lastName"
            name="lastName"
            placeholder={EMPTY}
            defaultValue={patient?.lastName ?? ""}
          />
        </Field>

        <Field
          id="birthDate"
          label="Date de naissance"
          hint="L'âge en est déduit ; il n'est jamais stocké."
        >
          <Input
            id="birthDate"
            name="birthDate"
            type="date"
            defaultValue={patient?.birthDate ?? ""}
          />
        </Field>

        <Field
          id="email"
          label="Adresse email"
          hint="Aucun email ne part à la création. Une adresse déjà sur un de vos dossiers ouvre ce dossier."
        >
          <Input
            id="email"
            name="email"
            type="email"
            placeholder={EMPTY}
            defaultValue={patient?.email ?? ""}
          />
        </Field>

        <Field id="phone" label="Téléphone">
          <Input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            placeholder={EMPTY}
            defaultValue={patient?.phone ?? ""}
          />
        </Field>
      </div>
    </FormGroup>

    <FormGroup group="profil" missing={missing.profil}>
      <ChoiceCards
        name="sexForCalculation"
        legend={
          <MandatoryLabel>{mandatory.sexForCalculation.fr}</MandatoryLabel>
        }
        initial={answers?.sexForCalculation}
        options={sexesForCalculation.map((sex) => ({
          value: sex,
          label: sexForCalculationLabels[sex].fr,
        }))}
      />

      <div className="@xl:grid-cols-2 grid gap-4">
        <Field
          id="heightCm"
          label={<MandatoryLabel>Taille (cm)</MandatoryLabel>}
        >
          <Input
            id="heightCm"
            name="heightCm"
            type="number"
            inputMode="numeric"
            min={1}
            max={280}
            placeholder={EMPTY}
            defaultValue={patient?.heightCm ?? ""}
          />
        </Field>

        <Field
          id="weightKg"
          label={<MandatoryLabel>Poids actuel (kg)</MandatoryLabel>}
        >
          <Input
            id="weightKg"
            name="weightKg"
            type="number"
            inputMode="decimal"
            step="0.1"
            min={1}
            max={500}
            placeholder={EMPTY}
            defaultValue={patient?.weightKg ?? ""}
          />
        </Field>
      </div>

      <ChoiceCards
        name="activityLevel"
        legend={<MandatoryLabel>{mandatory.activityLevel.fr}</MandatoryLabel>}
        layout="two"
        initial={answers?.activityLevel}
        options={activityLevels.map((level) => ({
          value: level,
          label: activityLevelDetails[level].label.fr,
          description: activityLevelDetails[level].description.fr,
        }))}
      />

      {/* Disabled posts nothing, so the stored value stays as it is. */}
      <Field
        id="desiredWeightKg"
        label="Poids souhaité (kg)"
        hint={
          careConsentGiven
            ? undefined
            : "Verrouillé jusqu'au consentement aux soins du patient."
        }
        className="@xl:max-w-[calc(50%-0.5rem)]"
      >
        <Input
          id="desiredWeightKg"
          name="desiredWeightKg"
          type="number"
          inputMode="decimal"
          step="0.1"
          min={1}
          max={500}
          placeholder={careConsentGiven ? EMPTY : undefined}
          disabled={!careConsentGiven}
          defaultValue={answers?.desiredWeightKg ?? ""}
        />
      </Field>
    </FormGroup>

    <FormGroup group="consultation" missing={missing.consultation}>
      <Field
        id="consultationReason"
        label={
          <MandatoryLabel>{mandatory.consultationReason.fr}</MandatoryLabel>
        }
      >
        <Textarea
          id="consultationReason"
          name="consultationReason"
          rows={3}
          placeholder={EMPTY}
          defaultValue={answers?.consultationReason ?? ""}
        />
      </Field>

      <Field
        id="consultationDate"
        label={
          <MandatoryLabel>{mandatory.consultationDate.fr}</MandatoryLabel>
        }
        className="@xl:max-w-[calc(50%-0.5rem)]"
      >
        <Input
          id="consultationDate"
          name="consultationDate"
          type="date"
          defaultValue={answers?.consultationDate ?? ""}
        />
      </Field>
    </FormGroup>

    <FormGroup group="alimentation" missing={missing.alimentation}>
      <ChoiceCards
        name="diet"
        legend="Régime alimentaire"
        initial={answers?.diet}
        options={diets.map((diet) => ({
          value: diet,
          label: dietLabels[diet].fr,
        }))}
      />

      <Field
        id="dietNote"
        label="Précision sur le régime"
        hint="Pour « Autre », ou une nuance du régime choisi."
      >
        <Input
          id="dietNote"
          name="dietNote"
          placeholder={EMPTY}
          defaultValue={answers?.dietNote ?? ""}
        />
      </Field>

      <AllergenField
        kind="allergy"
        legend={mandatory.allergies.fr}
        noneKnown={answers?.noKnownAllergies ?? null}
        rows={allergens.filter((row) => row.kind === "allergy")}
      />
      <AllergenField
        kind="intolerance"
        legend={mandatory.intolerances.fr}
        noneKnown={answers?.noKnownIntolerances ?? null}
        rows={allergens.filter((row) => row.kind === "intolerance")}
      />
      <Typography size="sm" tone="muted">
        Les deux listes sont obligatoires pour « Prêt pour consultation » : une
        réponse explicite par liste, « Aucune … connue » ou au moins une case.
      </Typography>
    </FormGroup>

    <FormGroup group="sante" missing={null}>
      {/* The patient has no box for it (REM-165): they name it in their
          pathologies, and the practitioner confirms it here. */}
      <ChoiceCards
        name="celiacDisease"
        legend="Maladie cœliaque confirmée"
        hint="La personne ne coche plus cette case : elle cite ses pathologies en texte libre. Confirmez ici un diagnostic. « Oui » exclut strictement le gluten, contaminations croisées comprises."
        initial={
          answers?.celiacDisease === true
            ? "yes"
            : answers?.celiacDisease === false
              ? "no"
              : null
        }
        options={[
          { value: "yes", label: "Oui" },
          { value: "no", label: "Non" },
        ]}
      />

      <Field
        id="pathologies"
        label="Problèmes de santé et pathologies diagnostiquées"
      >
        <Textarea
          id="pathologies"
          name="pathologies"
          rows={3}
          placeholder={EMPTY}
          defaultValue={answers?.pathologies ?? ""}
        />
      </Field>

      <div className="@xl:grid-cols-2 grid gap-4">
        <Field
          id="medications"
          label="Traitements en cours"
          hint={
            careConsentGiven
              ? "Séparés des contraintes pour rester lisibles d'un coup d'œil."
              : CARE_CONSENT_REQUIRED
          }
        >
          <Textarea
            id="medications"
            name="medications"
            rows={3}
            placeholder={careConsentGiven ? EMPTY : undefined}
            disabled={!careConsentGiven}
            defaultValue={patient?.medications ?? ""}
          />
        </Field>

        <Field
          id="supplements"
          label="Compléments déjà pris, hors protocole"
          hint={
            careConsentGiven
              ? "Ce que la personne prend déjà d'elle-même — le protocole prescrit se tient plus haut."
              : CARE_CONSENT_REQUIRED
          }
        >
          <Textarea
            id="supplements"
            name="supplements"
            rows={3}
            placeholder={careConsentGiven ? EMPTY : undefined}
            disabled={!careConsentGiven}
            defaultValue={patient?.supplements ?? ""}
          />
        </Field>
      </div>
    </FormGroup>

    <FormGroup group="genetique" missing={null}>
      <ChoiceCards
        name="geneticTest"
        legend="Test génétique APOE, DIO2 et AMY1A réalisé"
        initial={answers?.geneticTest}
        options={geneticTestAnswers.map((answer) => ({
          value: answer,
          label: geneticTestAnswerLabels[answer].fr,
        }))}
      />

      {genotypeOpen && answers?.geneticTest === "yes" ? (
        <>
          <ChoiceCards
            name="apoe"
            legend="APOE"
            initial={answers.apoe}
            options={plain(apoeGenotypes)}
          />
          <ChoiceCards
            name="dio2"
            legend="DIO2"
            initial={answers.dio2}
            options={plain(dio2Categories)}
          />
          <ChoiceCards
            name="amy1a"
            legend="AMY1A"
            initial={answers.amy1a}
            options={plain(amy1aCategories)}
          />
        </>
      ) : genotypeOpen ? (
        // Not rendered until the stored answer is « Oui »: the service hides
        // the stored values under any other answer, and an empty group would
        // post a clear.
        <Typography size="sm" tone="muted">
          Le génotype s&apos;affiche quand le test génétique est « Oui » et
          enregistré.
        </Typography>
      ) : (
        // Not rendered at all: a group that renders posts its name, and the
        // action refuses a genotype without the consent.
        <Typography size="sm" tone="muted">
          APOE, DIO2 et AMY1A restent verrouillés jusqu&apos;au consentement
          génétique du patient.
        </Typography>
      )}
    </FormGroup>
  </>
);
