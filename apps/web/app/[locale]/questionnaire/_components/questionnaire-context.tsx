"use client";

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Locale } from "@remi/services/shared";
import { Button } from "@remi/ui";
import { Typography, VisuallyHidden } from "@remi/ui/server";
import type { Content } from "@/lib/content/types";
import type { SaveError, SaveResult } from "@/lib/questionnaire/state";

/** What one autosaved answer gives the flow, so the end screen can wait for it. */
export type Saver = {
  /** Sends what typing left unsent, and ends when no save is in flight. */
  flush: () => Promise<void>;
  /** Sends the value of a failed save again. */
  retry: () => Promise<void>;
  /** True while the last save of this answer did not reach the server. */
  failed: () => boolean;
};

type QuestionnaireContextValue = {
  locale: Locale;
  text: Content["questionnaire"];
  /** Every save reports here, so the flow follows the missing fields. */
  onSettled: (result: SaveResult) => void;
  /** Each mounted answer registers its saver. The return value removes it. */
  register: (id: string, saver: Saver) => () => void;
};

const QuestionnaireContext = createContext<QuestionnaireContextValue | null>(
  null,
);

export const QuestionnaireProvider = ({
  value,
  children,
}: {
  value: QuestionnaireContextValue;
  children: ReactNode;
}) => (
  <QuestionnaireContext.Provider value={value}>
    {children}
  </QuestionnaireContext.Provider>
);

export const useQuestionnaire = () => {
  const value = useContext(QuestionnaireContext);
  if (!value) {
    throw new Error("useQuestionnaire needs a QuestionnaireProvider");
  }
  return value;
};

export type SaveState =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved" }
  | { kind: "error"; error: SaveError };

/**
 * The errors that are not about the value: the save did not reach the server,
 * or the session ended. The value stays on screen and the patient can send it
 * again. Every other error refuses the value itself.
 */
const isDeliveryError = (error: SaveError) =>
  error === "unavailable" || error === "signed_out";

/** How long typing must pause before a text answer saves. */
const TYPING_PAUSE_MS = 800;

/**
 * Saves one answer on each change, never twice for the same value. `commit`
 * saves now (a choice, a blur). `schedule` saves once typing pauses. `retry`
 * sends a failed value again. The state is `saved` only after the server
 * answered that it wrote the value (REM-167).
 *
 * A failed save changes nothing on screen: the value lives in the answer's own
 * state, and this hook never resets it.
 *
 * No cleanup clears the timer: a pending save still runs after the step or
 * the page changes, which is what keeps the last keystrokes.
 */
export const useAutosave = (
  save: (value: string) => Promise<SaveResult>,
  saved: string,
) => {
  const { onSettled, register } = useQuestionnaire();
  const id = useId();
  const [state, setState] = useState<SaveState>({ kind: "idle" });
  const lastSent = useRef<string | null>(saved);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduled = useRef<string | null>(null);
  const undelivered = useRef<string | null>(null);
  const inFlight = useRef<Promise<void> | null>(null);
  const latestRun = useRef(0);

  const send = async (value: string) => {
    lastSent.current = value;
    undelivered.current = null;
    latestRun.current += 1;
    const run = latestRun.current;
    setState({ kind: "saving" });
    let result: SaveResult;
    try {
      result = await save(value);
    } catch {
      result = { ok: false, error: "unavailable" };
    }
    onSettled(result);
    // An older save that ends late does not overwrite the newer one's state.
    if (run !== latestRun.current) {
      return;
    }
    if (result.ok) {
      setState({ kind: "saved" });
      return;
    }
    lastSent.current = null;
    if (isDeliveryError(result.error)) {
      undelivered.current = value;
    }
    setState({ kind: "error", error: result.error });
  };

  const commit = async (value: string) => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    scheduled.current = null;
    if (value === lastSent.current) {
      return;
    }
    const sending = send(value);
    inFlight.current = sending;
    await sending;
  };

  const schedule = (value: string) => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    scheduled.current = value;
    timer.current = setTimeout(() => {
      timer.current = null;
      void commit(value);
    }, TYPING_PAUSE_MS);
  };

  const retry = async () => {
    if (undelivered.current !== null) {
      await commit(undelivered.current);
    }
  };

  const flush = async () => {
    if (scheduled.current !== null) {
      await commit(scheduled.current);
      return;
    }
    if (inFlight.current) {
      await inFlight.current;
    }
  };

  // Registered again after each render, so the flow always calls the closures
  // of the latest one. The functions read refs only when the flow calls them.
  useEffect(() =>
    register(id, {
      flush,
      retry,
      failed: () => undelivered.current !== null,
    }),
  );

  return { state, commit, schedule, retry };
};

/**
 * The text of an error that refuses the value itself (a range, a consent).
 * Undefined for a save that did not reach the server: `SaveStatus` shows that
 * one, with its retry.
 */
export const refusalOf = (
  state: SaveState,
  text: Content["questionnaire"],
): string | undefined =>
  state.kind === "error" && state.error !== "unavailable"
    ? text.errors[state.error]
    : undefined;

type SaveStatusProps = {
  state: SaveState;
  onRetry: () => void;
};

/**
 * The three save states under an answer (REM-167): « Enregistrement… »,
 * « Enregistré » once the server confirmed, and « Impossible d'enregistrer. »
 * with « Réessayer ». Announced politely.
 */
export const SaveStatus = ({ state, onRetry }: SaveStatusProps) => {
  const { text } = useQuestionnaire();
  const unavailable = state.kind === "error" && state.error === "unavailable";
  const message =
    state.kind === "saving"
      ? text.saving
      : state.kind === "saved"
        ? text.saved
        : "";
  return (
    <div aria-live="polite" className="flex min-h-4 flex-wrap items-center gap-x-2">
      {unavailable ? (
        <>
          <Typography as="p" size="sm" className="text-error-text">
            {text.errors.unavailable}
          </Typography>
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto min-h-12 px-0"
            onClick={onRetry}
          >
            {text.retry}
          </Button>
        </>
      ) : (
        <Typography as="p" size="xs" tone="muted">
          {message}
        </Typography>
      )}
    </div>
  );
};

/** The label of a mandatory field: the mark, and the word for a screen reader. */
export const MandatoryLabel = ({ label }: { label: string }) => {
  const { text } = useQuestionnaire();
  return (
    <>
      {label}
      <span aria-hidden="true">*</span>
      <VisuallyHidden>({text.mandatory})</VisuallyHidden>
    </>
  );
};

/** The label of a field the story marks optional. */
export const OptionalLabel = ({ label }: { label: string }) => {
  const { text } = useQuestionnaire();
  return (
    <>
      {label}
      <Typography as="span" size="sm" tone="muted" weight="normal">
        {text.optional}
      </Typography>
    </>
  );
};
