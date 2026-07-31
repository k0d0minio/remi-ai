import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronDown } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "../lib/utils";

const accordionItem = cva("", {
  variants: {
    variant: {
      bordered: "border-b border-border last:border-b-0",
      ghost: "",
      card: "mb-3 rounded-lg border border-border bg-card px-4 last:mb-0",
    },
  },
  defaultVariants: { variant: "bordered" },
});

export const Accordion = ({
  ...props
}: ComponentProps<typeof AccordionPrimitive.Root>) => (
  <AccordionPrimitive.Root data-slot="accordion" {...props} />
);

type ItemProps = ComponentProps<typeof AccordionPrimitive.Item> &
  VariantProps<typeof accordionItem>;

export const AccordionItem = ({ className, variant, ...props }: ItemProps) => (
  <AccordionPrimitive.Item
    data-slot="accordion-item"
    className={cn(accordionItem({ variant }), className)}
    {...props}
  />
);

export const AccordionTrigger = ({
  className,
  children,
  ...props
}: ComponentProps<typeof AccordionPrimitive.Trigger>) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      data-slot="accordion-trigger"
      className={cn(
        "ease-standard hover:text-primary focus-visible:ring-ring/40 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left font-medium outline-none transition-colors duration-[--duration-fast] focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown
        aria-hidden="true"
        className="text-muted-foreground ease-standard pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-[--duration-base]"
      />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
);

export const AccordionContent = ({
  className,
  children,
  ...props
}: ComponentProps<typeof AccordionPrimitive.Content>) => (
  <AccordionPrimitive.Content
    data-slot="accordion-content"
    // Radix measures the panel and exposes it as --radix-accordion-content-height;
    // the keyframes below are what turn that measurement into a height animation.
    className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden"
    {...props}
  >
    <div className={cn("text-muted-foreground pb-4", className)}>
      {children}
    </div>
  </AccordionPrimitive.Content>
);
