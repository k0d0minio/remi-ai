import { cn } from "../lib/utils";

type Props = {
  /** The radio group. Unique per form on the page, or two groups merge. */
  name: string;
  /** What the form posts. `""` is a legitimate choice, not an empty one. */
  value: string;
  label: string;
  defaultChecked?: boolean;
  className?: string;
};

/**
 * One option of a small set, as a chip rather than a row of a select.
 *
 * Both surfaces that offer a meal's moment are thumb-first — Morgane logging
 * from the WhatsApp thread she is standing in, a patient writing down dinner —
 * and a chip is one tap where a select is three. The control underneath is a
 * plain radio, so the group is keyboard- and screen-reader-navigable without a
 * line of JavaScript, which is also what keeps this a server component.
 */
export const ChoiceChip = ({
  name,
  value,
  label,
  defaultChecked,
  className,
}: Props) => (
  <label className={cn("cursor-pointer", className)}>
    <input
      type="radio"
      name={name}
      value={value}
      defaultChecked={defaultChecked}
      className="peer sr-only"
    />
    <span className="border-border bg-card text-muted-foreground peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-foreground peer-focus-visible:ring-ring/40 inline-flex min-h-11 items-center rounded-full border px-4 text-sm transition-colors duration-[--duration-fast] peer-focus-visible:outline-none peer-focus-visible:ring-[3px]">
      {label}
    </span>
  </label>
);
