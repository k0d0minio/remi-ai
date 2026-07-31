import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "../lib/utils";

const switchRoot = cva(
  "peer inline-flex shrink-0 items-center rounded-full border border-transparent transition-colors duration-[--duration-fast] ease-standard outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
  {
    variants: {
      size: {
        sm: "h-5 w-9",
        md: "h-6 w-11",
      },
    },
    defaultVariants: { size: "md" },
  },
);

const switchThumb = cva(
  "pointer-events-none block rounded-full bg-background shadow-sm ring-0 transition-transform duration-[--duration-fast] ease-standard data-[state=unchecked]:translate-x-0.5",
  {
    variants: {
      size: {
        sm: "size-4 data-[state=checked]:translate-x-4",
        md: "size-5 data-[state=checked]:translate-x-5",
      },
    },
    defaultVariants: { size: "md" },
  },
);

type Props = ComponentProps<typeof SwitchPrimitive.Root> &
  VariantProps<typeof switchRoot>;

export const Switch = ({ className, size, ...props }: Props) => (
  <SwitchPrimitive.Root
    data-slot="switch"
    className={cn(switchRoot({ size }), className)}
    {...props}
  >
    <SwitchPrimitive.Thumb
      data-slot="switch-thumb"
      className={cn(switchThumb({ size }))}
    />
  </SwitchPrimitive.Root>
);
