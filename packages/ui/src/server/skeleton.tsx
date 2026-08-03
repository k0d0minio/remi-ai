import type { ComponentProps } from "react";
import { cn } from "../lib/utils";

/**
 * A placeholder block for a Suspense fallback. Sized by the caller with utility
 * classes, because only the caller knows the shape of what is arriving.
 *
 * `aria-hidden` on purpose: the loading state is announced by the live region
 * around it, and a screen reader gains nothing from a list of grey rectangles.
 */
export const Skeleton = ({ className, ...props }: ComponentProps<"div">) => (
  <div
    data-slot="skeleton"
    aria-hidden="true"
    className={cn("bg-muted animate-pulse rounded-md", className)}
    {...props}
  />
);
