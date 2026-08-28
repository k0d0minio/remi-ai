import type { Metadata } from "next";
import { CalendarDays, Stethoscope } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  IconTile,
  Separator,
  Typography,
} from "@remi/ui/server";
import { clinicName, practitionerName } from "@/lib/mock/clients";
import { categoryLabels, draftRecommendations } from "@/lib/mock/plan";

export const metadata: Metadata = { title: "Mon plan" };

/**
 * The same recommendations the practitioner confirmed, read from the patient's
 * side. Only the confirmed ones appear — the screen is the proof that what REMI
 * suggests all week traces back to a decision a human made in a consultation.
 */
const Page = () => {
  const published = draftRecommendations.filter((draft) => draft.confirmed);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Typography as="h1" size="2xl" weight="semibold">
          Mon plan
        </Typography>
        <Typography tone="muted">
          Ce que votre praticien a recommandé, en mots sur lesquels agir.
        </Typography>
      </div>

      <Card elevation="flat" className="border-border">
        <CardContent className="flex items-center gap-4">
          <IconTile intent="primary">
            <Stethoscope />
          </IconTile>
          <div className="flex flex-col gap-0.5">
            <Typography as="span" weight="medium">
              {practitionerName}
            </Typography>
            <Typography size="sm" tone="muted">
              {clinicName} · consultation du 22 juillet 2026
            </Typography>
          </div>
          <Badge
            variant="neutral"
            tone="subtle"
            size="sm"
            className="ml-auto shrink-0"
          >
            <CalendarDays aria-hidden="true" />
            Revoir le 19 août
          </Badge>
        </CardContent>
      </Card>

      <Separator />

      <ul className="flex flex-col gap-3">
        {published.map((recommendation) => (
          <li key={recommendation.id}>
            <Card elevation="flat" className="border-border">
              <CardHeader className="gap-2">
                <Badge
                  variant="neutral"
                  tone="subtle"
                  size="sm"
                  className="w-fit"
                >
                  {categoryLabels[recommendation.category]}
                </Badge>
                <CardTitle className="text-base">
                  {recommendation.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Typography size="sm" tone="muted">
                  {recommendation.detail}
                </Typography>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>

      <Alert variant="info">
        <AlertTitle>Votre praticien reste la référence</AlertTitle>
        <AlertDescription>
          REMI applique ces recommandations au quotidien. Il ne pose pas de
          diagnostic et ne remplace pas une consultation — tout ce qui est
          clinique appartient à {practitionerName}.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default Page;
