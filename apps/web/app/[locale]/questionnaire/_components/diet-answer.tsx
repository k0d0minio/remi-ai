"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@remi/ui";
import { Field, Input, RadioCard, Typography } from "@remi/ui/server";
import { saveDietAction } from "@/lib/questionnaire/actions";
import type { ChoiceOption } from "./choice-answer";
import {
  MandatoryLabel,
  refusalOf,
  SaveStatus,
  useAutosave,
  useQuestionnaire,
} from "./questionnaire-context";

/** « Aucun régime particulier »: the choice shown while no diet is saved. */
const PROPOSED = "none";

/** « Autre »: saved only with its note. */
const OTHER = "other";

/** The diet and its note as one autosave value. `""` is no saved diet. */
const encode = (diet: string, note: string) =>
  diet === OTHER ? `${OTHER}\n${note.trim()}` : diet;

type Props = {
  legend: ReactNode;
  options: readonly ChoiceOption[];
  /** The saved diet, `""` when the file holds none. */
  initialDiet: string;
  initialNote: string;
};

/**
 * The diet question (REM-162): one choice, as a radio group.
 *
 * While the file holds no diet, « Aucun régime particulier » is shown as the
 * proposed choice, with « Confirmer ce choix » under the list. Nothing is
 * saved until the patient taps that button or taps a choice (D-30). A patient
 * who continues without either leaves the diet « Non renseigné ».
 *
 * « Autre » opens « Précise ton type d'alimentation », which is mandatory:
 * « Autre » and its note save together, and « Autre » alone is never sent.
 * The choice can change at any time. A tap saves the new one.
 */
export const DietAnswer = ({
  legend,
  options,
  initialDiet,
  initialNote,
}: Props) => {
  const { text } = useQuestionnaire();
  const [selected, setSelected] = useState(initialDiet || PROPOSED);
  const [note, setNote] = useState(initialDiet === OTHER ? initialNote : "");
  // False while the proposed choice is on screen and the patient chose nothing.
  const [answered, setAnswered] = useState(initialDiet !== "");
  const [noteLeft, setNoteLeft] = useState(false);
  const { state, commit, schedule, retry } = useAutosave(
    (value) => {
      const [diet = "", ...rest] = value.split("\n");
      return saveDietAction(diet, rest.join("\n"));
    },
    initialDiet === "" ? "" : encode(initialDiet, initialNote),
  );

  const choose = async (value: string) => {
    setSelected(value);
    setAnswered(true);
    if (value !== OTHER) {
      // A note shown again starts empty: the server drops it with this save.
      setNote("");
      setNoteLeft(false);
      await commit(value);
      return;
    }
    if (note.trim() !== "") {
      await commit(encode(OTHER, note));
    }
  };
  const typeNote = (next: string) => {
    setNote(next);
    if (next.trim() !== "") {
      schedule(encode(OTHER, next));
    }
  };
  const leaveNote = () => {
    setNoteLeft(true);
    if (note.trim() !== "") {
      void commit(encode(OTHER, note));
    }
  };

  const name = "questionnaire-diet";
  const noteId = "questionnaire-dietNote";
  // « Autre » with no note: the screen shows a choice that is not saved.
  const noteMissing = answered && selected === OTHER && note.trim() === "";
  const refusal = refusalOf(state, text);

  return (
    <fieldset id={name} tabIndex={-1} className="flex flex-col gap-2">
      <Typography as="legend" size="sm" weight="medium" className="mb-2">
        {legend}
      </Typography>
      <div className="flex flex-col gap-2">
        {options.map((option) => (
          <RadioCard
            key={option.value}
            name={name}
            value={option.value}
            label={option.label}
            description={
              !answered && option.value === PROPOSED
                ? text.diet.proposed
                : undefined
            }
            checked={selected === option.value}
            onChange={() => void choose(option.value)}
            // The proposed choice is already checked, so a tap on it fires no
            // change: the click confirms it. The save never runs twice for
            // one value.
            onClick={() => void choose(option.value)}
          />
        ))}
      </div>
      {answered ? null : (
        <div>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => void choose(selected)}
          >
            {text.diet.confirm}
          </Button>
        </div>
      )}
      {answered && selected === OTHER ? (
        <Field
          id={noteId}
          label={<MandatoryLabel label={text.labels.dietNote} />}
          hint={noteMissing && !noteLeft ? text.diet.noteRequired : undefined}
          error={noteMissing && noteLeft ? text.diet.noteRequired : undefined}
        >
          <Input
            id={noteId}
            size="lg"
            maxLength={500}
            value={note}
            invalid={noteMissing && noteLeft}
            onChange={(event) => typeNote(event.target.value)}
            onBlur={leaveNote}
          />
        </Field>
      ) : null}
      {refusal && !noteMissing ? (
        <Typography as="p" size="sm" className="text-error-text">
          {refusal}
        </Typography>
      ) : null}
      {/* No « Enregistré » while « Autre » waits for its note. */}
      {noteMissing ? null : (
        <SaveStatus state={state} onRetry={() => void retry()} />
      )}
    </fieldset>
  );
};
