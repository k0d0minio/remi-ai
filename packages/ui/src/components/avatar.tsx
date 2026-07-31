import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "../lib/utils";

const avatar = cva(
  "relative flex shrink-0 overflow-hidden rounded-full border border-border",
  {
    variants: {
      size: {
        sm: "size-8 text-xs",
        md: "size-10 text-sm",
        lg: "size-12 text-base",
      },
    },
    defaultVariants: { size: "md" },
  },
);

type Props = ComponentProps<typeof AvatarPrimitive.Root> &
  VariantProps<typeof avatar>;

/**
 * Client-side because Radix tracks the image's load state — that is the whole
 * value here. The fallback shows immediately and is swapped out only once the
 * image has actually decoded, so a slow avatar never leaves a blank hole.
 */
export const Avatar = ({ className, size, ...props }: Props) => (
  <AvatarPrimitive.Root
    data-slot="avatar"
    className={cn(avatar({ size }), className)}
    {...props}
  />
);

export const AvatarImage = ({
  className,
  ...props
}: ComponentProps<typeof AvatarPrimitive.Image>) => (
  <AvatarPrimitive.Image
    data-slot="avatar-image"
    className={cn("aspect-square size-full object-cover", className)}
    {...props}
  />
);

export const AvatarFallback = ({
  className,
  ...props
}: ComponentProps<typeof AvatarPrimitive.Fallback>) => (
  <AvatarPrimitive.Fallback
    data-slot="avatar-fallback"
    className={cn(
      "bg-primary-subtle text-primary flex size-full items-center justify-center rounded-full font-medium",
      className,
    )}
    {...props}
  />
);
