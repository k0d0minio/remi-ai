import type { ComponentType, ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Card, CardContent, CardHeader } from "../card";
import { IconTile } from "../icon-tile";
import { Typography } from "../typography";

type Intent = "neutral" | "success" | "warning" | "error" | "info" | "primary";

export type Feature = {
  /** A lucide icon component — passed uninstantiated, rendered here at one size. */
  icon: ComponentType<{ className?: string }>;
  title: ReactNode;
  body: ReactNode;
  intent?: Intent;
};

type Props = {
  items: Feature[];
  columns?: 2 | 3 | 4;
  /**
   * Wraps the grid — pass `Stagger` from @remi/ui/motion and each card in a
   * `StaggerItem` to animate them in. Left out, the grid simply renders.
   */
  as?: ComponentType<{ className?: string; children: ReactNode }>;
  /** Wraps each card, for the same reason. */
  itemAs?: ComponentType<{ className?: string; children: ReactNode }>;
  className?: string;
};

// Spelled out rather than interpolated: Tailwind scans for whole class names, and
// a template literal like `md:grid-cols-${columns}` produces nothing at all — and
// only fails in a production build, never in dev.
const columnClass = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
} as const;

export const FeatureGrid = ({
  items,
  columns = 3,
  as: Wrapper,
  itemAs: ItemWrapper,
  className,
}: Props) => {
  const Grid = Wrapper ?? "div";
  const Item = ItemWrapper ?? "div";

  return (
    <Grid className={cn("grid gap-6", columnClass[columns], className)}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Item key={String(item.title)} className="h-full">
            <Card elevation="flat" className="border-border h-full gap-4">
              <CardHeader className="gap-4">
                <IconTile intent={item.intent ?? "primary"}>
                  <Icon />
                </IconTile>
                <Typography as="h3" size="lg" weight="semibold">
                  {item.title}
                </Typography>
              </CardHeader>
              <CardContent>
                <Typography tone="muted">{item.body}</Typography>
              </CardContent>
            </Card>
          </Item>
        );
      })}
    </Grid>
  );
};
