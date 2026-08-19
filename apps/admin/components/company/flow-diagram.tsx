import { ArrowRight, RotateCcw } from "lucide-react";
import { Fragment, type ComponentType } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  IconTile,
  Typography,
} from "@remi/ui/server";

export type FlowNode = {
  title: string;
  body: string;
  icon: ComponentType<{ className?: string }>;
  /** Label on the arrow leaving this node. Absent on the last one. */
  via?: string;
};

type Props = {
  title: string;
  description?: string;
  nodes: readonly FlowNode[];
  /** The leg that closes the loop, drawn back beneath the row. */
  returnLabel?: string;
};

/**
 * A left-to-right flow of stages, with the arrows carrying what moves between
 * them. A paragraph can say the same thing, but a reader deciding where to
 * spend an hour reads the shape before they read the sentence — and the shape
 * is the argument here.
 *
 * The row stacks on a narrow screen, so the arrows rotate a quarter turn rather
 * than pointing sideways at nothing.
 */
export const FlowDiagram = ({
  title,
  description,
  nodes,
  returnLabel,
}: Props) => (
  <Card elevation="flat">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      {description ? <CardDescription>{description}</CardDescription> : null}
    </CardHeader>

    <CardContent className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-stretch">
        {nodes.map((node) => {
          const Icon = node.icon;

          return (
            <Fragment key={node.title}>
              <div className="border-border bg-card flex flex-1 flex-col gap-2 rounded-lg border p-4">
                <IconTile intent="primary" size="sm">
                  <Icon />
                </IconTile>
                <Typography as="h3" size="sm" weight="medium">
                  {node.title}
                </Typography>
                <Typography size="xs" tone="muted">
                  {node.body}
                </Typography>
              </div>

              {node.via ? (
                <div className="flex shrink-0 items-center justify-center gap-2 md:w-24 md:flex-col md:gap-1">
                  <ArrowRight
                    aria-hidden="true"
                    className="text-muted-foreground size-4 shrink-0 rotate-90 md:rotate-0"
                  />
                  <Typography
                    size="xs"
                    tone="muted"
                    className="text-balance text-center"
                  >
                    {node.via}
                  </Typography>
                </div>
              ) : null}
            </Fragment>
          );
        })}
      </div>

      {returnLabel ? (
        <div className="border-border flex items-center gap-2 rounded-lg border border-dashed px-4 py-2.5">
          <RotateCcw
            aria-hidden="true"
            className="text-muted-foreground size-4 shrink-0"
          />
          <Typography size="xs" tone="muted">
            {returnLabel}
          </Typography>
        </div>
      ) : null}
    </CardContent>
  </Card>
);
