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
import type { Decision } from "@/lib/dossier/shared";

type Props = {
  title: string;
  description?: string;
  /** First number in this section — numbering runs across the whole page. */
  startAt: number;
  decisions: readonly Decision[];
  /**
   * Rendered under a decision that carries no options. Only worth saying where
   * options were a possibility — a section of factual questions has none by
   * nature, and a note repeating that under every one of them is noise.
   */
  openNote?: string;
};

/**
 * Numbered continuously across the page so an answer can name its decision —
 * « la 3 » — without also naming a section. Options render as lettered choices
 * to give the discussion a shape, never to close it.
 */
export const DecisionList = ({
  title,
  description,
  startAt,
  decisions,
  openNote,
}: Props) => (
  <Card elevation="flat">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      {description ? <CardDescription>{description}</CardDescription> : null}
    </CardHeader>

    <CardContent>
      <ol className="flex flex-col">
        {decisions.map((decision, index) => (
          <li
            key={decision.title}
            className={cn(
              "grid gap-x-3 gap-y-2 py-5 md:grid-cols-[2rem_1fr]",
              index > 0 && "border-border border-t",
            )}
          >
            <Typography
              size="sm"
              weight="semibold"
              tone="muted"
              className="tabular-nums"
            >
              {String(startAt + index).padStart(2, "0")}
            </Typography>

            <div className="flex flex-col gap-3">
              <Typography as="h3" size="sm" weight="semibold">
                {decision.title}
              </Typography>

              <Typography size="sm" tone="muted" className="max-w-2xl">
                {decision.context}
              </Typography>

              <Typography size="sm" className="max-w-2xl">
                <Typography as="span" size="sm" weight="medium">
                  Ce qui en dépend —{" "}
                </Typography>
                <Typography as="span" size="sm" tone="muted">
                  {decision.consequence}
                </Typography>
              </Typography>

              {decision.options ? (
                <ul className="flex flex-col gap-2">
                  {decision.options.map((option, optionIndex) => (
                    <li
                      key={option.label}
                      className="border-border flex flex-col gap-1 rounded-md border p-3"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <Typography size="sm" weight="medium">
                          {String.fromCharCode(97 + optionIndex)}.{" "}
                          {option.label}
                        </Typography>
                        {option.recommended ? (
                          <Badge variant="info" tone="subtle" size="sm">
                            recommandation de Jamie
                          </Badge>
                        ) : null}
                      </div>
                      <Typography size="sm" tone="muted" className="max-w-2xl">
                        {option.detail}
                      </Typography>
                    </li>
                  ))}
                </ul>
              ) : openNote ? (
                <Typography size="sm" tone="muted" className="italic">
                  {openNote}
                </Typography>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </CardContent>
  </Card>
);
