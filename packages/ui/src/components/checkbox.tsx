import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "../lib/utils";

type Props = ComponentProps<typeof CheckboxPrimitive.Root> & {
  invalid?: boolean;
};

export const Checkbox = ({ className, invalid, ...props }: Props) => (
  <CheckboxPrimitive.Root
    data-slot="checkbox"
    aria-invalid={invalid || undefined}
    className={cn(
      "border-input shadow-xs ease-standard focus-visible:border-ring focus-visible:ring-ring/40 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground peer size-4 shrink-0 rounded-[4px] border outline-none transition-colors duration-[--duration-fast] focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
      invalid && "border-error-border focus-visible:ring-error/30",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      data-slot="checkbox-indicator"
      className="flex items-center justify-center text-current"
    >
      <Check aria-hidden="true" className="size-3.5" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
);
