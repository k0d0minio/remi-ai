"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import type { ChallengeOutcome, PatientChallenge } from "@remi/services/shared";
import { challengeOutcomes, formatDate } from "@remi/services/shared";
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@remi/ui";
import { Field, Input, Textarea, Typography } from "@remi/ui/server";
import { ChallengeStatus } from "@/components/patients/challenge-status";
import { challengeOutcomeLabels } from "@/components/patients/vocabulary";
import {
  closeChallengeAction,
  startChallengeAction,
  updateChallengeAction,
  type ChallengeFormState,
} from "@/lib/patients/actions";

type Props = {
  patientId: string;
  current: PatientChallenge | null;
  /** Today at the practice, resolved server-side — the start date's default and ceiling. */
  today: string;
};

type Mode = "view" | "edit" | "close" | "new";

const initial: ChallengeFormState = { error: null, saved: false };

/**
 * The outcome she most likely means: the patient said « acquis », so Acquis;
 * otherwise Non acquis. A pre-selection, never a decision — she changes it.
 */
const suggestedOutcome = (challenge: PatientChallenge): ChallengeOutcome =>
  challenge.acquiredAt ? "acquired" : "not_acquired";

type OutcomeFieldProps = {
  id: string;
  name: string;
  label: string;
  defaultValue: ChallengeOutcome;
};

const OutcomeField = ({ id, name, label, defaultValue }: OutcomeFieldProps) => (
  <Field id={id} label={label}>
    <Select name={name} defaultValue={defaultValue}>
      <SelectTrigger id={id}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {challengeOutcomes.map((outcome) => (
          <SelectItem key={outcome} value={outcome}>
            {challengeOutcomeLabels[outcome]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </Field>
);

type ChallengeFieldsProps = {
  idPrefix: string;
  today: string;
  challenge?: PatientChallenge;
};

const ChallengeFields = ({
  idPrefix,
  today,
  challenge,
}: ChallengeFieldsProps) => (
  <>
    <div className="grid gap-4 sm:grid-cols-[1fr_11rem]">
      <Field
        id={`${idPrefix}-text`}
        label="Challenge"
        hint="Une phrase, adressée à la personne — elle la lit en haut de son lien."
      >
        <Input
          id={`${idPrefix}-text`}
          name="text"
          required
          maxLength={200}
          defaultValue={challenge?.text ?? ""}
          placeholder="ex. Boire 1,5 L d'eau par jour"
        />
      </Field>
      <Field id={`${idPrefix}-started`} label="Début">
        <Input
          id={`${idPrefix}-started`}
          name="startedOn"
          type="date"
          required
          max={today}
          defaultValue={challenge?.startedOn ?? today}
        />
      </Field>
    </div>
    <Field id={`${idPrefix}-why`} label="Pourquoi" optional>
      <Textarea
        id={`${idPrefix}-why`}
        name="why"
        rows={2}
        maxLength={2000}
        defaultValue={challenge?.why ?? ""}
      />
    </Field>
  </>
);

/**
 * Her challenge with this patient — her 14 Sept § 2: « créer un nouveau
 * challenge ; modifier le challenge ; voir si le consultant l'a validé ; voir
 * s'il indique qu'il est prêt pour le suivant ».
 *
 * One mode at a time (edit, close, new), because each is a form over the same
 * row and two open at once would post against each other. Starting a new one
 * while one runs asks how the running one ends, in the same form: the service
 * closes it and opens the next in one transaction (D-25).
 */
export const ChallengeSection = ({ patientId, current, today }: Props) => {
  const [mode, setMode] = useState<Mode>("view");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit =
    (
      action: (
        previous: ChallengeFormState,
        formData: FormData,
      ) => Promise<ChallengeFormState>,
    ) =>
    async (formData: FormData) => {
      setPending(true);
      const result = await action(initial, formData);
      setPending(false);
      setError(result.error);
      if (!result.error) {
        setMode("view");
      }
    };

  const open = (next: Mode) => {
    setError(null);
    setMode(next);
  };

  const actions = (label: string) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Enregistrement…" : label}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => open("view")}
      >
        Annuler
      </Button>
      {error ? (
        <Typography size="sm" className="text-error-text" role="alert">
          {error}
        </Typography>
      ) : null}
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {current && mode !== "edit" ? (
        <div className="flex flex-col gap-2">
          <Typography size="base" weight="medium">
            {current.text}
          </Typography>
          {current.why.trim() !== "" ? (
            <Typography size="sm" tone="muted" className="whitespace-pre-line">
              {current.why}
            </Typography>
          ) : null}
          <Typography size="xs" tone="muted">
            Depuis le {formatDate(current.startedOn)}
          </Typography>
          <ChallengeStatus challenge={current} />
        </div>
      ) : null}

      {!current && mode !== "new" ? (
        <Typography size="sm" tone="muted">
          Aucun challenge en cours.
        </Typography>
      ) : null}

      {mode === "view" ? (
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={() => open("new")}>
            <Plus aria-hidden="true" />
            Nouveau challenge
          </Button>
          {current ? (
            <>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => open("edit")}
              >
                Modifier
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => open("close")}
              >
                Clore
              </Button>
            </>
          ) : null}
        </div>
      ) : null}

      {mode === "edit" && current ? (
        <form
          action={submit(updateChallengeAction)}
          className="flex flex-col gap-4"
        >
          <input type="hidden" name="id" value={current.id} />
          <input type="hidden" name="patientId" value={patientId} />
          <ChallengeFields
            idPrefix="edit-challenge"
            today={today}
            challenge={current}
          />
          {actions("Enregistrer")}
        </form>
      ) : null}

      {mode === "close" && current ? (
        <form
          action={submit(closeChallengeAction)}
          className="flex flex-col gap-4"
        >
          <input type="hidden" name="id" value={current.id} />
          <input type="hidden" name="patientId" value={patientId} />
          <div className="sm:max-w-60">
            <OutcomeField
              id="close-challenge-outcome"
              name="outcome"
              label="Issue"
              defaultValue={suggestedOutcome(current)}
            />
          </div>
          {actions("Clore le challenge")}
        </form>
      ) : null}

      {mode === "new" ? (
        <form
          action={submit(startChallengeAction)}
          className="flex flex-col gap-4"
        >
          <input type="hidden" name="patientId" value={patientId} />
          {current ? (
            <div className="border-border flex flex-col gap-2 rounded-md border p-3">
              <Typography size="sm">
                Le challenge en cours — « {current.text} » — sera clos.
              </Typography>
              <div className="sm:max-w-60">
                <OutcomeField
                  id="new-challenge-close-outcome"
                  name="closeCurrentWith"
                  label="Issue du challenge en cours"
                  defaultValue={suggestedOutcome(current)}
                />
              </div>
            </div>
          ) : null}
          <ChallengeFields idPrefix="new-challenge" today={today} />
          {actions("Lancer le challenge")}
        </form>
      ) : null}
    </div>
  );
};
