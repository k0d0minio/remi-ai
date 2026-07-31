import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge conditional class names, resolving Tailwind conflicts left-to-right.
 *
 * This module is built as its own tsup entry WITHOUT the "use client" banner, so
 * `cn()` is callable from a server component via `@remi/ui/utils`. Importing it
 * from the main barrel pulls in the client boundary — always use the subpath.
 */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
