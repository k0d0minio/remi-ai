"use client";

import { useState } from "react";
import { goalDirections } from "@remi/services/shared";
import { Field, Input, Typography } from "@remi/ui/server";
import { Button } from "@remi/ui";
import { logCheckInAction, type WriteState } from "@/lib/patient-link/actions";
import type { CheckInPromptSubject } from "@/lib/patient-link/check-in";
import type { Content } from "@/lib/content/types";

type Props = {
  /** The whole credential, straight from the route — never a patient id. */
  token: string;
  locale: string;
  /** Already ordered: least-recently-answered first. */
  rotation: readonly CheckInPromptSubject[];
  content: Content["patientLink"];
};

/**
 * « Comment ça se passe ? » — one question, one tap, once a day.
 *
 * Decision D-9's check-in, in the page rather than in an inbox: it appears on
 * the home when nothing has been answered today and goes when something has.
 * Which subject it asks about was decided on the server, from what was
 * answered when; this component's only state is where in that rotation the
 * patient has skipped to.
 *
 * « Passer » moves to the next subject and writes nothing. It is presentation
 * state deliberately: persisting a skip would mean a row that records a
 * non-answer, and a patient who skips everything would generate a trail of
 * them. A reload starts the rotation again, which is the right cost — the
 * question was not answered, so it is still owed.
 */
export const CheckInPrompt = ({ token, locale, rotation, content }: Props) => {
  const [index, setIndex] = useState(0);
  const [note, setNote] = useState("");
  const [state, setState] = useState<WriteState>({ error: null });
  // Held rather than read back from the server: the page revalidates after a
  // write, but the prompt should go the instant the answer lands rather than a
  // round trip later.
  const [answered, setAnswered] = useState(false);

  const subject = rotation[index];
  if (answered || !subject) {
    return null;
  }

  const question = subject.category
    ? content.checkIn.recommendationQuestions[subject.category].replace(
        "{subject}",
        subject.title,
      )
    : content.checkIn.goalQuestion.replace("{subject}", subject.title);

  return (
    <form
      action={async (formData: FormData) => {
        const result = await logCheckInAction({ error: null }, formData);
        setState(result);
        if (!result.error) {
          setAnswered(true);
        }
      }}
      className="flex flex-col gap-3"
    >
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="subjectId" value={subject.id} />
      <input type="hidden" name="kind" value={subject.kind} />

      <Typography as="p" size="sm" weight="medium">
        {question}
      </Typography>

      <div className="flex flex-wrap gap-2">
        {goalDirections.map((direction) => (
          <Button
            key={direction}
            type="submit"
            name="direction"
            value={direction}
            variant="outline"
            className="min-h-11 gap-2"
          >
            <span aria-hidden="true">{content.checkIn.faces[direction]}</span>
            {content.checkIn.directions[direction]}
          </Button>
        ))}
      </div>

      <Field
        id="check-in-note"
        label={content.checkIn.noteLabel}
        error={state.error ? content.checkIn.errors[state.error] : undefined}
      >
        <Input
          id="check-in-note"
          name="note"
          maxLength={2000}
          placeholder={content.checkIn.notePlaceholder}
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </Field>

      {/*
        Only offered when there is somewhere to skip to — a lone subject with a
        « Passer » that does nothing is a button that lies.
      */}
      {index + 1 < rotation.length ? (
        <div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setIndex(index + 1);
              setNote("");
              setState({ error: null });
            }}
          >
            {content.checkIn.skip}
          </Button>
        </div>
      ) : null}
    </form>
  );
};
