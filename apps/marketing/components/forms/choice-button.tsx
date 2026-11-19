import type { ComponentProps } from "react";
import { cn } from "@remi/ui/utils";

type Props = ComponentProps<"button"> & {
  title: string;
  sub: string;
  primary?: boolean;
};

/** One answer of the conversational sign-up: a title and a line under it. */
export const ChoiceButton = ({ title, sub, primary, className, ...props }: Props) => (
  <button
    type="button"
    className={cn(
      "border-border bg-card hover:border-primary focus-visible:ring-ring flex w-full flex-col items-start gap-0.5 rounded-lg border px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-[3px]",
      primary && "border-primary bg-primary-subtle",
      className,
    )}
    {...props}
  >
    <span className="font-semibold">{title}</span>
    <span className="text-muted-foreground text-sm">{sub}</span>
  </button>
);
