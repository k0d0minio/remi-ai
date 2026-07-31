import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type { ComponentProps } from "react";
import { cn } from "../lib/utils";

export const TooltipProvider = ({
  delayDuration = 200,
  ...props
}: ComponentProps<typeof TooltipPrimitive.Provider>) => (
  <TooltipPrimitive.Provider
    data-slot="tooltip-provider"
    delayDuration={delayDuration}
    {...props}
  />
);

export const Tooltip = ({
  ...props
}: ComponentProps<typeof TooltipPrimitive.Root>) => (
  <TooltipPrimitive.Root data-slot="tooltip" {...props} />
);

export const TooltipTrigger = ({
  ...props
}: ComponentProps<typeof TooltipPrimitive.Trigger>) => (
  <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
);

/**
 * A tooltip is hover- and focus-only, so anything essential must also exist
 * somewhere a touch user can reach. Use it for the footnote on a pricing row,
 * never for the row's meaning.
 */
export const TooltipContent = ({
  className,
  sideOffset = 6,
  children,
  ...props
}: ComponentProps<typeof TooltipPrimitive.Content>) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      data-slot="tooltip-content"
      sideOffset={sideOffset}
      className={cn(
        "bg-foreground text-background z-50 w-fit max-w-xs text-balance rounded-md px-3 py-1.5 text-xs shadow-md",
        "data-[state=delayed-open]:animate-pop-in data-[state=closed]:animate-fade-out",
        className,
      )}
      {...props}
    >
      {children}
      <TooltipPrimitive.Arrow className="fill-foreground z-50 size-2.5 translate-y-[calc(-50%-1px)] rotate-45 rounded-[2px]" />
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
);
