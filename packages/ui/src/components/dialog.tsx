import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "../lib/utils";

/**
 * The centred modal, for a decision that must be made before anything else can
 * happen — "publish this plan?". `Sheet` is the same Radix primitive dressed as
 * a side panel; reach for that when the panel is a place to go, and this when it
 * is a question to answer.
 */
export const Dialog = ({
  ...props
}: ComponentProps<typeof DialogPrimitive.Root>) => (
  <DialogPrimitive.Root data-slot="dialog" {...props} />
);

export const DialogTrigger = ({
  ...props
}: ComponentProps<typeof DialogPrimitive.Trigger>) => (
  <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
);

export const DialogClose = ({
  ...props
}: ComponentProps<typeof DialogPrimitive.Close>) => (
  <DialogPrimitive.Close data-slot="dialog-close" {...props} />
);

/** `DialogTitle` is required — Radix warns when a dialog has no accessible name. */
export const DialogContent = ({
  className,
  children,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content>) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className="bg-foreground/40 data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out fixed inset-0 z-50"
    />
    <DialogPrimitive.Content
      data-slot="dialog-content"
      className={cn(
        "bg-background border-border data-[state=open]:animate-pop-in fixed left-1/2 top-1/2 z-50 flex w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-xl border p-6 shadow-xl",
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="focus-visible:ring-ring/40 absolute right-4 top-4 rounded-sm opacity-70 transition-opacity duration-[--duration-fast] hover:opacity-100 focus-visible:outline-none focus-visible:ring-[3px]">
        <X aria-hidden="true" className="size-5" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
);

export const DialogHeader = ({
  className,
  ...props
}: ComponentProps<"div">) => (
  <div
    data-slot="dialog-header"
    className={cn("flex flex-col gap-1.5 pr-6", className)}
    {...props}
  />
);

export const DialogFooter = ({
  className,
  ...props
}: ComponentProps<"div">) => (
  <div
    data-slot="dialog-footer"
    className={cn(
      "mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end",
      className,
    )}
    {...props}
  />
);

export const DialogTitle = ({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Title>) => (
  <DialogPrimitive.Title
    data-slot="dialog-title"
    className={cn("text-foreground text-lg font-semibold", className)}
    {...props}
  />
);

export const DialogDescription = ({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) => (
  <DialogPrimitive.Description
    data-slot="dialog-description"
    className={cn("text-muted-foreground text-sm", className)}
    {...props}
  />
);
