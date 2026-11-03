"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Locale } from "@remi/services/shared";
import { Typography, VisuallyHidden } from "@remi/ui/server";
import type { Content } from "@/lib/content/types";
import type { SaveError, SaveResult } from "@/lib/questionnaire/state";

type QuestionnaireContextValue = {
  locale: Locale;
  text: Content["questionnaire"];
  /** Every save reports here, so the header follows the file's status. */
  onSettled: (result: SaveResult) => void;
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

/** How long typing must pause before a text answer saves. */
const TYPING_PAUSE_MS = 800;

/**
 * Saves one answer on each change, never twice for the same value. `commit`
 * saves now (a choice, a blur). `schedule` saves once typing pauses. A refused
 * or failed value is sent again on the next blur, so the patient can retry.
 *
 * No cleanup clears the timer: a pending save still runs after the section or
 * the page changes, which is what keeps the last keystrokes.
 */
export const useAutosave = (
  save: (value: string) => Promise<SaveResult>,
  saved: string,
) => {
  const { onSettled } = useQuestionnaire();
  const [state, setState] = useState<SaveState>({ kind: "idle" });
  const lastSent = useRef<string | null>(saved);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRun = useRef(0);

  const commit = async (value: string) => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (value === lastSent.current) {
      return;
    }
    lastSent.current = value;
    latestRun.current += 1;
    const run = latestRun.current;
    setState({ kind: "saving" });
    let result: SaveResult;
    try {
      result = await save(value);
    } catch {
      result = { ok: false, error: "unavailable" };
    }
    if (!result.ok) {
      lastSent.current = null;
    }
    onSettled(result);
    // An older save that ends late does not overwrite the newer one's state.
    if (run === latestRun.current) {
      setState(
        result.ok ? { kind: "saved" } : { kind: "error", error: result.error },
      );
    }
  };

  const schedule = (value: string) => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(() => {
      timer.current = null;
      void commit(value);
    }, TYPING_PAUSE_MS);
  };

  return { state, commit, schedule };
};

/** « Enregistrement… » or « Enregistré » under a field, announced politely. */
export const SaveStatus = ({ state }: { state: SaveState }) => {
  const { text } = useQuestionnaire();
  const message =
    state.kind === "saving"
      ? text.saving
      : state.kind === "saved"
        ? text.saved
        : "";
  return (
    <Typography
      as="p"
      size="xs"
      tone="muted"
      aria-live="polite"
      className="min-h-4"
    >
      {message}
    </Typography>
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
