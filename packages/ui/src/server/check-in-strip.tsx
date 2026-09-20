import type { ReactNode } from "react";
import { cn } from "../lib/utils";

/**
 * One answered day on a check-in strip.
 *
 * `direction` is the shared `better | stable | worse` vocabulary, passed as a
 * plain string so this package stays free of the services package — the ui
 * package depends on nothing but React and the tokens, and a type import would
 * be the first crack in that.
 */
export type CheckInMark = {
  id: string;
  /** `YYYY-MM-DD`, used as the accessible date on the mark. */
  checkedOn: string;
  direction: "better" | "stable" | "worse";
  /** The optional word the answer carried. */
  note?: string;
  /** True for the patient's own answer, false for the practitioner's. */
  fromPatient?: boolean;
  /** Rendered beside the mark — the « Vu » control, on the console only. */
  action?: ReactNode;
};

type Props = {
  /** Oldest first: a timeline reads left to right. */
  marks: readonly CheckInMark[];
  /** What a reader hears instead of the row of faces. */
  label: string;
  /** Shown in place of the strip when nothing has been answered yet. */
  empty: string;
  /** Formats a date for the reader's locale — the caller owns the language. */
  formatDate: (value: string) => string;
  /**
   * How each direction reads aloud. Required for the same reason `formatDate`
   * is: the keys are English because they are what the database stores, and a
   * francophone patient must never hear one.
   */
  directionLabels: Record<CheckInMark["direction"], string>;
  className?: string;
};

/**
 * Faces on a timeline — the progression view on both sides of decision D-9.
 *
 * Deliberately not a chart. Eight weeks of one-tap answers is a handful of
 * marks, and a chart library would be a dependency, a client bundle and an axis
 * for data that has no magnitude: « mieux » is not a number and drawing it as
 * one would invent a precision the answer never had. So it is a list of marks,
 * readable at a glance and by a screen reader, and it costs the patient's phone
 * nothing.
 *
 * It lives here rather than in either app because the patient's « Ma
 * progression » and the console's goals slot render the same thing — two copies
 * are two things to disagree about what a « moins bien » looks like.
 */
export const CheckInStrip = ({
  marks,
  label,
  empty,
  formatDate,
  directionLabels,
  className,
}: Props) => {
  if (marks.length === 0) {
    return (
      <p className="text-muted-foreground text-sm" role="note">
        {empty}
      </p>
    );
  }

  return (
    <ol
      aria-label={label}
      className={cn("flex flex-wrap items-start gap-2", className)}
    >
      {marks.map((mark) => (
        <li key={mark.id} className="flex flex-col items-center gap-1">
          <span
            aria-hidden="true"
            className={cn(
              "flex size-8 items-center justify-center rounded-full border text-base",
              directionMark[mark.direction].className,
              // The patient's own answers carry the ring: on the console's
              // timeline hers and Morgane's sit side by side, and `written_by`
              // is the only thing that tells them apart.
              mark.fromPatient ? "ring-ring/40 ring-2 ring-offset-1" : null,
            )}
          >
            {directionMark[mark.direction].face}
          </span>
          {/*
            The whole of the mark for a reader: the face is decorative, so the
            date and the direction have to be said somewhere, and a title
            attribute is not read reliably.
          */}
          <span className="sr-only">
            {`${formatDate(mark.checkedOn)} — ${directionLabels[mark.direction]}`}
            {mark.note ? ` — ${mark.note}` : ""}
          </span>
          <span className="text-muted-foreground text-[0.625rem] tabular-nums">
            {formatDate(mark.checkedOn)}
          </span>
          {mark.action}
        </li>
      ))}
    </ol>
  );
};

/**
 * One face per direction, and only the worsening is tinted.
 *
 * The same restraint the console's badges already keep: a strip where every
 * mark is coloured reads as noise, and the one that should catch the eye is the
 * one going the wrong way.
 */
const directionMark = {
  better: { face: "🙂", className: "border-border bg-card" },
  stable: { face: "😐", className: "border-border bg-card" },
  worse: {
    face: "🙁",
    className: "border-warning-border bg-warning-subtle text-warning-text",
  },
} as const;
