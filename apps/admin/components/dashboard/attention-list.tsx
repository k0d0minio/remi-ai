import {
  Circle,
  CircleAlert,
  CircleCheck,
  Info,
  TriangleAlert,
} from "lucide-react";
import type { ComponentType } from "react";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  IconTile,
  Typography,
} from "@remi/ui/server";
import { cn } from "@remi/ui/utils";
import type { AttentionItem, Intent } from "@/lib/fixtures";

type Props = {
  items: AttentionItem[];
};

/**
 * The icon comes from the intent rather than from the item, so severity reads
 * the same everywhere in the console — an operator learns one mapping, not one
 * per list.
 */
const intentIcons: Record<Intent, ComponentType<{ className?: string }>> = {
  success: CircleCheck,
  warning: TriangleAlert,
  error: CircleAlert,
  info: Info,
  neutral: Circle,
};

export const AttentionList = ({ items }: Props) => (
  <Card elevation="flat">
    <CardHeader>
      <CardTitle>Needs attention</CardTitle>
      <CardDescription>
        Open items ordered by severity, not by age.
      </CardDescription>
    </CardHeader>

    <CardContent>
      {items.length === 0 ? (
        <EmptyState
          icon={CircleCheck}
          intent="success"
          title="Nothing is waiting"
          body="Every open item has been cleared. New ones land here as they are raised."
        />
      ) : (
        <ul className="flex flex-col">
          {items.map((item, index) => {
            const Icon = intentIcons[item.intent];

            return (
              <li
                key={item.id}
                className={cn(
                  "flex gap-4 py-4",
                  index > 0 && "border-border border-t",
                )}
              >
                <IconTile intent={item.intent} size="sm">
                  <Icon />
                </IconTile>

                <div className="flex min-w-0 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <Typography as="h3" size="sm" weight="medium">
                      {item.title}
                    </Typography>
                    <Badge variant={item.intent} tone="subtle" size="sm">
                      {item.status}
                    </Badge>
                  </div>

                  <Typography size="sm" tone="muted">
                    {item.detail}
                  </Typography>

                  <Typography size="xs" tone="muted" className="opacity-80">
                    {item.area} · {item.age}
                  </Typography>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </CardContent>
  </Card>
);
