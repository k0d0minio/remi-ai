import * as SelectPrimitive from "@radix-ui/react-select";
import { cva, type VariantProps } from "class-variance-authority";
import { Check, ChevronDown } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "../lib/utils";

// Deliberately the same shape as `Input`'s cva, so a select and a text field
// sitting next to each other in a form line up and share a focus treatment.
const trigger = cva(
  "flex w-full min-w-0 items-center justify-between gap-2 rounded-md border border-input bg-background text-base transition-colors duration-[--duration-fast] ease-standard outline-none data-[placeholder]:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:opacity-60",
  {
    variants: {
      size: {
        sm: "h-8 px-2.5 py-1",
        md: "h-9 px-3 py-1",
        lg: "h-10 px-3.5 py-2",
      },
      invalid: {
        true: "border-error-border focus-visible:border-error focus-visible:ring-error/30",
        false: "",
      },
    },
    defaultVariants: { size: "md", invalid: false },
  },
);

export const Select = ({
  ...props
}: ComponentProps<typeof SelectPrimitive.Root>) => (
  <SelectPrimitive.Root data-slot="select" {...props} />
);

export const SelectValue = ({
  ...props
}: ComponentProps<typeof SelectPrimitive.Value>) => (
  <SelectPrimitive.Value data-slot="select-value" {...props} />
);

type TriggerProps = ComponentProps<typeof SelectPrimitive.Trigger> &
  VariantProps<typeof trigger>;

export const SelectTrigger = ({
  className,
  children,
  size,
  invalid,
  ...props
}: TriggerProps) => (
  <SelectPrimitive.Trigger
    data-slot="select-trigger"
    aria-invalid={invalid || undefined}
    className={cn(trigger({ size, invalid }), className)}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown aria-hidden="true" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
);

export const SelectContent = ({
  className,
  children,
  position = "popper",
  ...props
}: ComponentProps<typeof SelectPrimitive.Content>) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      data-slot="select-content"
      position={position}
      className={cn(
        "bg-popover text-popover-foreground border-border data-[state=open]:animate-pop-in relative z-50 max-h-[--radix-select-content-available-height] min-w-[8rem] overflow-y-auto rounded-lg border shadow-lg",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "w-full min-w-[--radix-select-trigger-width]",
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
);

export const SelectLabel = ({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.Label>) => (
  <SelectPrimitive.Label
    data-slot="select-label"
    className={cn(
      "text-muted-foreground px-2 py-1.5 text-xs font-medium",
      className,
    )}
    {...props}
  />
);

export const SelectItem = ({
  className,
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Item>) => (
  <SelectPrimitive.Item
    data-slot="select-item"
    className={cn(
      "focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-default select-none items-center rounded-md py-1.5 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex size-4 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check aria-hidden="true" className="size-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
);

export const SelectSeparator = ({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.Separator>) => (
  <SelectPrimitive.Separator
    data-slot="select-separator"
    className={cn("bg-border -mx-1 my-1 h-px", className)}
    {...props}
  />
);
