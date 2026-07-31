import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "../lib/utils";

const sheetContent = cva(
  "bg-background fixed z-50 flex flex-col gap-4 shadow-xl transition-transform ease-standard",
  {
    variants: {
      side: {
        right:
          "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm data-[state=open]:animate-slide-in-right data-[state=closed]:animate-slide-out-right",
        left: "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
        top: "inset-x-0 top-0 h-auto border-b",
        bottom: "inset-x-0 bottom-0 h-auto border-t",
      },
    },
    defaultVariants: { side: "right" },
  },
);

export const Sheet = ({
  ...props
}: ComponentProps<typeof SheetPrimitive.Root>) => (
  <SheetPrimitive.Root data-slot="sheet" {...props} />
);

export const SheetTrigger = ({
  ...props
}: ComponentProps<typeof SheetPrimitive.Trigger>) => (
  <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
);

export const SheetClose = ({
  ...props
}: ComponentProps<typeof SheetPrimitive.Close>) => (
  <SheetPrimitive.Close data-slot="sheet-close" {...props} />
);

type ContentProps = ComponentProps<typeof SheetPrimitive.Content> &
  VariantProps<typeof sheetContent>;

/**
 * `SheetTitle` is not optional — Radix warns when a dialog has no accessible
 * name, and a nav panel that announces as "dialog" and nothing else is a dead
 * end for a screen reader. Wrap it in `VisuallyHidden` if it should not be seen.
 */
export const SheetContent = ({
  className,
  children,
  side,
  ...props
}: ContentProps) => (
  <SheetPrimitive.Portal>
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className="bg-foreground/40 data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out fixed inset-0 z-50"
    />
    <SheetPrimitive.Content
      data-slot="sheet-content"
      className={cn(sheetContent({ side }), className)}
      {...props}
    >
      {children}
      <SheetPrimitive.Close className="focus-visible:ring-ring/40 absolute right-4 top-4 rounded-sm opacity-70 transition-opacity duration-[--duration-fast] hover:opacity-100 focus-visible:outline-none focus-visible:ring-[3px]">
        <X aria-hidden="true" className="size-5" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPrimitive.Portal>
);

export const SheetHeader = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    data-slot="sheet-header"
    className={cn("flex flex-col gap-1.5 p-6 pb-2", className)}
    {...props}
  />
);

export const SheetTitle = ({
  className,
  ...props
}: ComponentProps<typeof SheetPrimitive.Title>) => (
  <SheetPrimitive.Title
    data-slot="sheet-title"
    className={cn("text-foreground font-semibold", className)}
    {...props}
  />
);

export const SheetDescription = ({
  className,
  ...props
}: ComponentProps<typeof SheetPrimitive.Description>) => (
  <SheetPrimitive.Description
    data-slot="sheet-description"
    className={cn("text-muted-foreground text-sm", className)}
    {...props}
  />
);
