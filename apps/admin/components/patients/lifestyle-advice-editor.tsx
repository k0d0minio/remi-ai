"use client";

import { Plus } from "lucide-react";
import { useState, useTransition } from "react";
import {
  formatDate,
  lifestyleAdviceKeys,
  type LifestyleAdvice,
  type LifestyleAdviceKey,
} from "@remi/services/shared";
import { Button } from "@remi/ui";
import {
  Alert,
  AlertDescription,
  Field,
  Textarea,
  Typography,
} from "@remi/ui/server";
import { lifestyleAdviceLabels } from "@/components/patients/lifestyle-advice-labels";
import {
  deleteLifestyleAdviceAction,
  saveLifestyleAdviceAction,
  setLifestyleAdviceDisabledAction,
  type LifestyleAdviceState,
} from "@/lib/patients/lifestyle-advice";

const DETAILS_LABEL = "Fréquence, moment de la journée, durée";

type Fields = { text: string; details: string };

type FieldsProps = {
  id: string;
  /** The names of the two form fields: a new line or an edited line. */
  names: { text: string; details: string };
  value: Fields;
  onChange: (value: Fields) => void;
};

/** The text, and the optional details under a fold. */
const AdviceFields = ({ id, names, value, onChange }: FieldsProps) => {
  // Open at first when the advice has details. After that the fold is hers.
  const [open] = useState(value.details !== "");
  return (
    <div className="flex flex-col gap-2">
      <Field id={`${id}-text`} label="Conseil">
        <Textarea
          id={`${id}-text`}
          name={names.text}
          rows={2}
          value={value.text}
          onChange={(event) => onChange({ ...value, text: event.target.value })}
        />
      </Field>
      <details open={open ? true : undefined}>
        <summary className="text-muted-foreground hover:text-foreground cursor-pointer text-sm">
          {`${DETAILS_LABEL} (facultatif)`}
        </summary>
        <div className="pt-2">
          <Textarea
            aria-label={DETAILS_LABEL}
            name={names.details}
            rows={2}
            value={value.details}
            onChange={(event) =>
              onChange({ ...value, details: event.target.value })
            }
          />
        </div>
      </details>
    </div>
  );
};

type ActionsProps = {
  patientId: string;
  advice: LifestyleAdvice;
  /** « Modifier », for an active advice only. */
  onEdit?: () => void;
  onError: (error: string | null) => void;
};

/**
 * « Modifier », « Désactiver » or « Réactiver », and « Supprimer » of one
 * advice. The delete asks one more click, because it cannot be undone.
 */
const AdviceActions = ({ patientId, advice, onEdit, onError }: ActionsProps) => {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const run = (act: () => Promise<LifestyleAdviceState>) => {
    startTransition(async () => {
      const result = await act();
      onError(result.error);
      setConfirming(false);
    });
  };
  const disabled = advice.disabledAt !== null;

  if (confirming) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Typography as="span" size="sm">
          Supprimer ce conseil ? Il ne sera plus dans le dossier.
        </Typography>
        <Button
          type="button"
          size="sm"
          variant="error"
          disabled={pending}
          onClick={() =>
            run(() => deleteLifestyleAdviceAction(patientId, advice.id))
          }
        >
          Confirmer la suppression
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={pending}
          onClick={() => setConfirming(false)}
        >
          Annuler
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      {onEdit ? (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={pending}
          onClick={onEdit}
        >
          Modifier
        </Button>
      ) : null}
      <Button
        type="button"
        size="sm"
        variant="ghost"
        disabled={pending}
        onClick={() =>
          run(() =>
            setLifestyleAdviceDisabledAction(patientId, advice.id, !disabled),
          )
        }
      >
        {disabled ? "Réactiver" : "Désactiver"}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        disabled={pending}
        onClick={() => setConfirming(true)}
      >
        Supprimer
      </Button>
    </div>
  );
};

type AdviceTextProps = { advice: LifestyleAdvice };

/** The advice as written: the text, then the details when there are some. */
const AdviceText = ({ advice }: AdviceTextProps) => (
  <div className="flex min-w-0 flex-col gap-1">
    <Typography size="sm" className="whitespace-pre-line break-words">
      {advice.text}
    </Typography>
    {advice.details.trim() !== "" ? (
      <Typography
        size="sm"
        tone="muted"
        className="whitespace-pre-line break-words"
      >
        {advice.details}
      </Typography>
    ) : null}
  </div>
);

type Draft = Fields & { key: string; category: LifestyleAdviceKey };

type Props = {
  patientId: string;
  /** The advice in force, in the order of the service. */
  advices: readonly LifestyleAdvice[];
};

/**
 * « Hygiène de vie » (REM-65, story 17): the six categories, each with its
 * advice in force and « Ajouter un conseil ».
 *
 * She can add several lines, in several categories, and open several advices
 * with « Modifier ». One save writes all of them. A save that the server
 * refuses keeps what she typed. « Désactiver » and « Supprimer » act on one
 * advice at once, without the save.
 */
export const LifestyleAdviceEditor = ({ patientId, advices }: Props) => {
  const [drafts, setDrafts] = useState<readonly Draft[]>([]);
  const [edits, setEdits] = useState<Readonly<Record<string, Fields>>>({});
  const [nextKey, setNextKey] = useState(0);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // An advice that left the active list while it was open is not edited.
  const editedIds = Object.keys(edits).filter((id) =>
    advices.some((advice) => advice.id === id),
  );
  const dirty = drafts.length > 0 || editedIds.length > 0;

  const addDraft = (category: LifestyleAdviceKey) => {
    setDrafts((current) => [
      ...current,
      { key: `new-${nextKey}`, category, text: "", details: "" },
    ]);
    setNextKey((current) => current + 1);
  };

  const closeEdit = (id: string) =>
    setEdits((current) =>
      Object.fromEntries(Object.entries(current).filter(([key]) => key !== id)),
    );

  const cancel = () => {
    setDrafts([]);
    setEdits({});
    setError(null);
  };

  const save = (formData: FormData) => {
    startTransition(async () => {
      const result = await saveLifestyleAdviceAction(formData);
      setError(result.error);
      if (result.saved) {
        setDrafts([]);
        setEdits({});
      }
    });
  };

  return (
    <form action={save} className="flex flex-col gap-5">
      <input type="hidden" name="patientId" value={patientId} />

      {lifestyleAdviceKeys.map((category) => {
        const rows = advices.filter((advice) => advice.category === category);
        const lines = drafts.filter((draft) => draft.category === category);
        return (
          <div key={category} className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Typography as="h3" size="sm" weight="medium">
                {lifestyleAdviceLabels[category]}
              </Typography>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addDraft(category)}
              >
                <Plus aria-hidden="true" />
                Ajouter un conseil
              </Button>
            </div>

            {rows.length > 0 ? (
              <ul className="divide-border flex flex-col divide-y">
                {rows.map((advice) => {
                  const edit = edits[advice.id];
                  return (
                    <li key={advice.id} className="flex flex-col gap-2 py-2">
                      {edit ? (
                        <>
                          <input
                            type="hidden"
                            name="edit-id"
                            value={advice.id}
                          />
                          <AdviceFields
                            id={`advice-${advice.id}`}
                            names={{ text: "edit-text", details: "edit-details" }}
                            value={edit}
                            onChange={(value) =>
                              setEdits((current) => ({
                                ...current,
                                [advice.id]: value,
                              }))
                            }
                          />
                          <div>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => closeEdit(advice.id)}
                            >
                              Ne pas modifier
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <AdviceText advice={advice} />
                          <AdviceActions
                            patientId={patientId}
                            advice={advice}
                            onError={setError}
                            onEdit={() =>
                              setEdits((current) => ({
                                ...current,
                                [advice.id]: {
                                  text: advice.text,
                                  details: advice.details,
                                },
                              }))
                            }
                          />
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : null}

            {lines.map((draft, index) => (
              <div
                key={draft.key}
                className="border-border flex flex-col gap-2 border-l-2 pl-3"
              >
                <input type="hidden" name="new-category" value={category} />
                <Typography size="xs" tone="muted">
                  {`Nouveau conseil n° ${index + 1}`}
                </Typography>
                <AdviceFields
                  id={draft.key}
                  names={{ text: "new-text", details: "new-details" }}
                  value={draft}
                  onChange={(value) =>
                    setDrafts((current) =>
                      current.map((row) =>
                        row.key === draft.key ? { ...row, ...value } : row,
                      ),
                    )
                  }
                />
                <div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setDrafts((current) =>
                        current.filter((row) => row.key !== draft.key),
                      )
                    }
                  >
                    Retirer cette ligne
                  </Button>
                </div>
              </div>
            ))}
          </div>
        );
      })}

      {error ? (
        <Alert variant="error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {dirty ? (
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Enregistrement…" : "Enregistrer la section"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={cancel}
            disabled={pending}
          >
            Annuler
          </Button>
          <Typography size="sm" tone="muted">
            Un seul enregistrement pour toute la section.
          </Typography>
        </div>
      ) : null}
    </form>
  );
};

type DisabledProps = {
  patientId: string;
  /** The disabled advice, the latest disabled first. */
  advices: readonly LifestyleAdvice[];
};

/** The disabled advice of the fold, each with « Réactiver » and « Supprimer ». */
export const DisabledLifestyleAdvices = ({
  patientId,
  advices,
}: DisabledProps) => {
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-3">
      <Typography size="sm" tone="muted">
        Ces conseils ne sont plus dans la prochaine version validée. Ils
        restent dans le dossier.
      </Typography>
      <ul className="divide-border flex flex-col divide-y">
        {advices.map((advice) => (
          <li key={advice.id} className="flex flex-col gap-2 py-2">
            <AdviceText advice={advice} />
            <Typography size="xs" tone="muted">
              {`${lifestyleAdviceLabels[advice.category]}${
                advice.disabledAt
                  ? ` · désactivé le ${formatDate(advice.disabledAt)}`
                  : ""
              }`}
            </Typography>
            <AdviceActions
              patientId={patientId}
              advice={advice}
              onError={setError}
            />
          </li>
        ))}
      </ul>
      {error ? (
        <Alert variant="error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
};
