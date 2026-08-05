import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Typography,
} from "@remi/ui/server";
import { cn } from "@remi/ui/utils";
import type { Point } from "@/lib/offer";

type Props = {
  title: string;
  description?: string;
  points: readonly Point[];
};

/**
 * The prose half of the page: a short label and the paragraph that earns it.
 * Two columns from `md` up, because a label sitting above its own paragraph
 * reads as a heading and invites skimming — and every one of these is meant to
 * be read.
 */
export const PointList = ({ title, description, points }: Props) => (
  <Card elevation="flat">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      {description ? <CardDescription>{description}</CardDescription> : null}
    </CardHeader>

    <CardContent>
      <dl className="flex flex-col">
        {points.map((point, index) => (
          <div
            key={point.label}
            className={cn(
              "grid gap-1 py-4 md:grid-cols-[13rem_1fr] md:gap-8",
              index > 0 && "border-border border-t",
            )}
          >
            <Typography as="dt" size="sm" weight="medium">
              {point.label}
            </Typography>
            <Typography as="dd" size="sm" tone="muted" className="max-w-2xl">
              {point.body}
            </Typography>
          </div>
        ))}
      </dl>
    </CardContent>
  </Card>
);
