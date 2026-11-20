"use client";

import type { ComponentProps } from "react";
import { maskDateEntry } from "@remi/services/shared";
import { Input } from "@remi/ui/server";

type Props = Omit<
  ComponentProps<typeof Input>,
  "type" | "inputMode" | "value" | "onChange" | "maxLength"
> & {
  /** The text as typed, « JJ/MM/AAAA ». `""` is no date. */
  value: string;
  onValueChange: (value: string) => void;
};

/**
 * A date typed as « JJ/MM/AAAA » (REM-159). It is a text field with the
 * numeric keyboard of a phone, not a native date picker: a picker proposes
 * today, and the patient must step through the months to reach a birth year.
 * Here the year is typed directly, and an empty field stays empty.
 *
 * The slashes come as the patient types. A change in the middle of the text
 * is kept as typed, so the cursor does not jump: the caller reads the text
 * with `parseDateEntry`. The other props go to the `Input`, so a `Field`
 * around it wires the label, the hint and the error.
 */
export const DateInput = ({ value, onValueChange, ...props }: Props) => (
  <Input
    {...props}
    type="text"
    inputMode="numeric"
    maxLength={10}
    value={value}
    onChange={(event) => {
      const { value: typed, selectionStart } = event.target;
      const atEnd = selectionStart === null || selectionStart >= typed.length;
      onValueChange(
        atEnd ? maskDateEntry(typed) : typed.replace(/[^\d/]/g, ""),
      );
    }}
  />
);
