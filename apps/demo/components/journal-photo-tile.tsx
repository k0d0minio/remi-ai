import { Apple, Croissant, Fish, Leaf, Wheat } from "lucide-react";
import type { ComponentType } from "react";
import { Typography } from "@remi/ui/server";
import { cn } from "@remi/ui/utils";
import type { PhotoTone } from "@/lib/mock/types";

/**
 * The photo, without a photo.
 *
 * `apps/demo` ships no binary images on purpose — a prototype that needs a
 * photographer before it can be reviewed is a prototype nobody reviews, and a
 * stock plate of salmon would tell a stakeholder that the recognition works
 * rather than what the screen looks like when it doesn't. The tile is drawn
 * from tokens, tinted by what kind of plate it was, and says "photo" out loud
 * so nobody mistakes it for the real thing.
 */
const tones: Record<
  PhotoTone,
  { icon: ComponentType<{ className?: string }>; className: string }
> = {
  greens: {
    icon: Leaf,
    className:
      "from-success-subtle to-success-border border-success-border text-success-text",
  },
  protein: {
    icon: Fish,
    className:
      "from-info-subtle to-info-border border-info-border text-info-text",
  },
  grains: {
    icon: Wheat,
    className:
      "from-warning-subtle to-warning-border border-warning-border text-warning-text",
  },
  fruit: {
    icon: Apple,
    className:
      "from-primary-subtle to-primary-border border-primary-border text-primary",
  },
  sweet: {
    icon: Croissant,
    className:
      "from-neutral-subtle to-neutral-border border-neutral-border text-neutral-text",
  },
};

type Props = {
  tone: PhotoTone;
  size?: "sm" | "lg";
  className?: string;
};

export const JournalPhotoTile = ({ tone, size = "sm", className }: Props) => {
  const { icon: Icon, className: toneClassName } = tones[tone];

  return (
    <div
      aria-hidden="true"
      className={cn(
        "bg-linear-to-br flex shrink-0 flex-col items-center justify-center gap-1 rounded-lg border",
        toneClassName,
        size === "sm" ? "size-16" : "h-32 w-full",
        className,
      )}
    >
      <Icon className={size === "sm" ? "size-6" : "size-9"} />
      {size === "lg" ? (
        <Typography as="span" size="xs" weight="medium">
          photo
        </Typography>
      ) : null}
    </div>
  );
};
