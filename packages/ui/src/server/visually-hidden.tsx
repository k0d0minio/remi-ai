import type { ComponentProps, ElementType } from "react";
import { cn } from "../lib/utils";

type Props = ComponentProps<"span"> & { as?: ElementType };

/**
 * Content for assistive technology only — clipped rather than `display: none`,
 * which would take it out of the accessibility tree along with everything else.
 * Used for the text an icon-only control needs and a sighted user does not.
 */
export const VisuallyHidden = ({
  as: Tag = "span",
  className,
  ...props
}: Props) => (
  <Tag
    data-slot="visually-hidden"
    className={cn(
      "absolute -m-px h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 [clip:rect(0,0,0,0)]",
      className,
    )}
    {...props}
  />
);
