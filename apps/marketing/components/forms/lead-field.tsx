import type { ComponentProps } from "react";
import { Field, Input, Textarea } from "@remi/ui/server";
import { FLOW } from "@/lib/content/landing";

type Base = {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
};

type InputProps = Base & { multiline?: false } & Omit<
    ComponentProps<typeof Input>,
    "id" | "invalid"
  >;

type TextareaProps = Base & { multiline: true } & Omit<
    ComponentProps<typeof Textarea>,
    "id" | "invalid"
  >;

/**
 * One form field of the sign-up flows: the design system's `Field` with the
 * « (facultatif) » suffix Morgane's forms show, and the error wired to the
 * control. The `id` is explicit, as `Field` asks.
 */
export const LeadField = (props: InputProps | TextareaProps) => {
  const { id, label, optional, error, multiline, ...rest } = props;
  const text = optional ? (
    <>
      {label}{" "}
      <span className="text-muted-foreground font-normal">{FLOW.optional}</span>
    </>
  ) : (
    label
  );
  return (
    <Field id={id} label={text} error={error}>
      {multiline ? (
        <Textarea
          rows={3}
          invalid={Boolean(error)}
          {...(rest as ComponentProps<typeof Textarea>)}
        />
      ) : (
        <Input
          invalid={Boolean(error)}
          {...(rest as ComponentProps<typeof Input>)}
        />
      )}
    </Field>
  );
};
