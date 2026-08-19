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
import type { Item } from "@/lib/dossier/shared";

type Props = {
  title: string;
  description?: string;
  items: readonly Item[];
};

/**
 * The dossier's workhorse: a titled card over a list of points, each with an
 * optional status. The badge's intent comes from the data, so a new status is
 * one more row of content rather than one more branch here.
 */
export const ItemCard = ({ title, description, items }: Props) => (
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
              {item.tag ? (
                <Badge variant={item.tag.intent} tone="subtle" size="sm">
                  {item.tag.label}
                </Badge>
              ) : null}
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
