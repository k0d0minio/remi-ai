import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Typography,
} from "@remi/ui/server";
import { cn } from "@remi/ui/utils";
import type { RoadmapItem, RoadmapStatus } from "@/lib/roadmap";

type Props = {
  title: string;
  description?: string;
  items: readonly RoadmapItem[];
};

/**
 * The status vocabulary maps onto the design system's intents so « décision
 * en attente » reads as the amber it is — the items Morgane and Arnaud
 * unblock — while plain work stays neutral and done reads as done.
 */
const statusVariant: Record<
  RoadmapStatus,
  "neutral" | "info" | "warning" | "success"
> = {
  "à faire": "neutral",
  "décision en cours": "info",
  "décision en attente": "warning",
  "en place": "success",
};

export const PhaseCard = ({ title, description, items }: Props) => (
  <Card elevation="flat">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      {description ? <CardDescription>{description}</CardDescription> : null}
    </CardHeader>

    <CardContent>
      <ul className="flex flex-col">
        {items.map((item, index) => (
          <li
            key={item.title}
            className={cn(
              "flex flex-col gap-1.5 py-4",
              index > 0 && "border-border border-t",
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
              <Typography as="h3" size="sm" weight="medium">
                {item.title}
              </Typography>
              <Badge
                variant={statusVariant[item.status]}
                tone="subtle"
                size="sm"
              >
                {item.status}
              </Badge>
            </div>
            <Typography size="sm" tone="muted" className="max-w-2xl">
              {item.body}
            </Typography>
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);
