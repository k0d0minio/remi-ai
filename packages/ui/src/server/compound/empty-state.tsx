import type { ComponentType, ReactNode } from "react";
import { cn } from "../../lib/utils";
import { IconTile } from "../icon-tile";
import { Typography } from "../typography";

type Intent = "neutral" | "success" | "warning" | "error" | "info" | "primary";

type Props = {
  /** A lucide icon component — passed uninstantiated, rendered here at one size. */
  icon: ComponentType<{ className?: string }>;
  title: ReactNode;
  body?: ReactNode;
  /** The buttons, rendered by the caller — `Button` is a client component. */
  actions?: ReactNode;
  intent?: Intent;
  className?: string;
};

/**
 * What a list renders when it has nothing in it. Its job is to say why the space
 * is empty and what would fill it — "no clients yet" plus the way to add one —
 * because a blank panel reads as a failure rather than a starting point.
 */
export const EmptyState = ({
  icon: Icon,
  title,
  body,
  actions,
  intent = "neutral",
  className,
}: Props) => (
  <div
    data-slot="empty-state"
    className={cn(
      "border-border flex flex-col items-center gap-4 rounded-lg border border-dashed px-6 py-12 text-center",
      className,
    )}
  >
    <IconTile intent={intent}>
      <Icon />
    </IconTile>

    <div className="flex max-w-sm flex-col gap-1.5">
      <Typography as="h3" weight="semibold" balance>
        {title}
      </Typography>
      {body ? (
        <Typography size="sm" tone="muted" balance>
          {body}
        </Typography>
      ) : null}
    </div>

    {actions ? <div className="flex gap-3">{actions}</div> : null}
  </div>
);
