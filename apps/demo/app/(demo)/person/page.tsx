import type { Metadata } from "next";
import { ArrowRight, Clock, Footprints, Users } from "lucide-react";
import NextLink from "next/link";
import { Button } from "@remi/ui";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
  Typography,
} from "@remi/ui/server";
import { practitionerName } from "@/lib/mock/clients";
import { recipes } from "@/lib/mock/meals";
import { steps } from "@/lib/mock/steps";

export const metadata: Metadata = { title: "Aujourd'hui" };

/**
 * Two things, and deliberately not a third: what to cook tonight, and the one
 * habit in flight. The whole product argument is that a person leaving a
 * consultation is not short of advice — they are short of a next action.
 */
const Page = () => {
  const step = steps.find((candidate) => candidate.status === "current");
  const tonight = recipes.find((recipe) => recipe.slot === "dîner");

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Typography as="h1" size="2xl" weight="semibold">
          Bonjour Camille
        </Typography>
        <Typography tone="muted">
          Une chose à la fois, à votre rythme.
        </Typography>
      </div>

      {tonight ? (
        <Card>
          <CardHeader>
            <CardDescription>Ce soir</CardDescription>
            <CardTitle>{tonight.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Typography tone="muted">{tonight.summary}</Typography>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="neutral" tone="subtle" size="sm">
                <Clock aria-hidden="true" />
                {tonight.minutes} minutes
              </Badge>
              <Badge variant="neutral" tone="subtle" size="sm">
                <Users aria-hidden="true" />
                {tonight.servings} personnes
              </Badge>
            </div>

            <Button asChild variant="outline" className="w-fit">
              <NextLink href="/person/meals">
                Voir la recette et la semaine
                <ArrowRight aria-hidden="true" />
              </NextLink>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {step ? (
        <Card variant="success">
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <Footprints aria-hidden="true" className="size-4" />
              Votre étape de la quinzaine
            </CardDescription>
            <CardTitle>{step.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Typography tone="muted">{step.why}</Typography>

            <div className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between">
                <Typography as="span" size="sm" tone="muted">
                  Jours appliqués
                </Typography>
                <Typography as="span" size="sm" weight="medium">
                  {step.completedDays} / {step.targetDays}
                </Typography>
              </div>
              <Progress
                intent="success"
                value={(step.completedDays / step.targetDays) * 100}
                label="Jours appliqués"
              />
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card elevation="flat" className="border-border">
        <CardContent>
          <Typography size="sm" tone="muted">
            {practitionerName} suit votre progression et ajustera le plan à la
            prochaine consultation. C'est lui qui décide — REMI ne fait
            qu'appliquer.
          </Typography>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
