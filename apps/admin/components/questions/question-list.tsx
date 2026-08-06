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
import type { Question } from "@/lib/questions";

type Props = {
  title: string;
  description?: string;
  /** First question number in this section — numbering runs across sections. */
  startAt: number;
  questions: readonly Question[];
};

const openNote =
  "Question ouverte — pas d'options préparées, la réponse se construit en conversation.";

/**
 * A section of questions, numbered continuously across the page so an answer
 * can name its question — « la 6 » — without also naming a section. Choices
 * render as lettered options to give the discussion a shape, not to close it;
 * a question without choices is open on purpose, and says so.
 */
export const QuestionList = ({
  title,
  description,
  startAt,
  questions,
}: Props) => (
  <Card elevation="flat">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      {description ? <CardDescription>{description}</CardDescription> : null}
    </CardHeader>

    <CardContent>
      <ol className="flex flex-col">
        {questions.map((question, index) => (
          <li
            key={question.title}
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
                {question.title}
              </Typography>

              <Typography size="sm" tone="muted" className="max-w-2xl">
                {question.context}
              </Typography>

              {question.choices ? (
                <ul className="flex flex-col gap-2">
                  {question.choices.map((choice, choiceIndex) => (
                    <li
                      key={choice.label}
                      className="border-border flex flex-col gap-1 rounded-md border p-3"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <Typography size="sm" weight="medium">
                          {String.fromCharCode(97 + choiceIndex)}.{" "}
                          {choice.label}
                        </Typography>
                        {choice.recommended ? (
                          <Badge variant="info" tone="subtle" size="sm">
                            recommandation de Jamie
                          </Badge>
                        ) : null}
                      </div>
                      <Typography size="sm" tone="muted" className="max-w-2xl">
                        {choice.detail}
                      </Typography>
                    </li>
                  ))}
                </ul>
              ) : (
                <Typography size="sm" tone="muted" className="italic">
                  {openNote}
                </Typography>
              )}
            </div>
          </li>
        ))}
      </ol>
    </CardContent>
  </Card>
);
