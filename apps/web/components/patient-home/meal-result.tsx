import type { ReactNode } from "react";
import type { MealImprovement, MealSuggestion } from "@remi/services/shared";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Card,
  CardContent,
  Typography,
} from "@remi/ui/server";
import { fill } from "@/lib/content/fill";
import type { Content } from "@/lib/content/types";
import type { PlannedMeal } from "@/lib/meals/state";

type Texts = Content["patientMeal"]["saved"]["suggestion"];

type Props = {
  meal: PlannedMeal;
  /** Null when the patient's safety data could not be read. */
  suggestion: MealSuggestion | null;
  content: Content["patientMeal"]["saved"];
};

const improvementText = (improvement: MealImprovement, texts: Texts) => {
  switch (improvement.status) {
    case "aligned":
      return texts.aligned;
    case "withheld":
      return texts.withheld;
    case "no_protocol":
      return texts.noProtocol;
    case "address_alert":
      return texts.addressAlert;
    case "shown":
      return fill(texts.kinds[improvement.kind], {
        food: improvement.food,
        replaces: improvement.replaces ?? "",
      });
  }
};

type BlockProps = {
  title: string;
  children: ReactNode;
};

const Block = ({ title, children }: BlockProps) => (
  <div className="flex flex-col gap-1">
    <Typography as="h3" size="base" weight="semibold">
      {title}
    </Typography>
    {children}
  </div>
);

type AnswerProps = {
  answer: MealSuggestion["answer"];
  texts: Texts;
};

const Answer = ({ answer, texts }: AnswerProps) => {
  if (answer.status === "unavailable") {
    return <Typography tone="muted">{texts.unavailable}</Typography>;
  }
  if (answer.status === "unclear") {
    return <Typography>{texts.unclear}</Typography>;
  }
  const { goodPoints, improvement, toCheck } = answer;
  return (
    <>
      {toCheck.length > 0 ? (
        <Typography>
          {fill(texts.toCheck, { foods: toCheck.join(", ") })}
        </Typography>
      ) : null}
      {goodPoints.length > 0 ? (
        <Block title={texts.goodTitle}>
          <ul className="flex list-disc flex-col gap-1 pl-5">
            {goodPoints.map((point) => (
              <Typography as="li" key={point}>
                {point}
              </Typography>
            ))}
          </ul>
        </Block>
      ) : null}
      <Block title={texts.improveTitle}>
        <Typography weight={improvement.status === "shown" ? "medium" : "normal"}>
          {improvementText(improvement, texts)}
        </Typography>
        {improvement.status === "shown" ? (
          <>
            <Typography>{improvement.explanation}</Typography>
            <Typography size="sm" tone="muted">
              {fill(texts.basis, { basis: improvement.basis })}
            </Typography>
          </>
        ) : null}
      </Block>
    </>
  );
};

/**
 * What the home page shows after a meal is saved (REM-102, story 28): the
 * alerts of the compatibility gate first, before any praise (D-30), then
 * REMI's two blocks, then the meal as recorded. The buttons « Ça me convient »
 * and « Pas pour moi » are REM-103.
 */
export const MealResult = ({ meal, suggestion, content }: Props) => {
  const texts = content.suggestion;
  const alerts = suggestion?.alerts ?? [];
  const traces = suggestion?.traces ?? [];
  // With no answer on the safety data, REMI knows nothing: the advice shows.
  const checkIngredients = suggestion?.checkIngredients ?? true;

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <Typography as="h2" size="lg" weight="semibold">
          {content.title}
        </Typography>
        {alerts.length > 0 || traces.length > 0 ? (
          <Alert variant="warning">
            <AlertTitle>{texts.alertTitle}</AlertTitle>
            <AlertDescription className="text-foreground">
              {alerts.map((alert) => (
                <p key={`${alert.source}:${alert.food}`}>
                  {fill(texts.alerts[alert.source], { food: alert.food })}
                </p>
              ))}
              {traces.map((food) => (
                <p key={`trace:${food}`}>{fill(texts.trace, { food })}</p>
              ))}
            </AlertDescription>
          </Alert>
        ) : null}
        {suggestion ? (
          <Answer answer={suggestion.answer} texts={texts} />
        ) : (
          <Typography tone="muted">{texts.unavailable}</Typography>
        )}
        {checkIngredients ? (
          <Typography size="sm" tone="muted">
            {texts.checkIngredients}
          </Typography>
        ) : null}
        <div className="flex flex-col gap-1">
          <Typography as="h3" size="sm" weight="medium" tone="muted">
            {content.mealLabel}
          </Typography>
          <Typography className="whitespace-pre-line break-words">
            {meal.description}
          </Typography>
        </div>
      </CardContent>
    </Card>
  );
};
