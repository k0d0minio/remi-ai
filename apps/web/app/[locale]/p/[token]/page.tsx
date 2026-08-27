import { notFound } from "next/navigation";
import {
  getPatientByShareToken,
  listPatientRecommendations,
} from "@remi/services/server";
import { isLocale, recommendationCategories } from "@remi/services/shared";
import {
  Badge,
  Card,
  CardContent,
  Separator,
  Typography,
  Wordmark,
} from "@remi/ui/server";
import { getContent } from "@/lib/content";

/** Reads the database on every hit — never prerendered. */
export const dynamic = "force-dynamic";

type Params = { locale: string; token: string };

/**
 * The shareable patient link (REMI-035): the one page in this app reached by
 * URL rather than sign-in. The token in the path is the whole credential — an
 * unguessable capability minted per patient in the admin console, revocable by
 * regenerating it there. Nothing here mutates, and nothing links onward into
 * the signed-in app.
 *
 * This page renders in the patient's own language and shows the real name
 * when Morgane recorded one — it is their page. The pseudonym stays the
 * working name everywhere else.
 */
const PatientLink = async ({ params }: { params: Promise<Params> }) => {
  const { locale, token } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  const content = getContent(locale).patientLink;

  const result = await getPatientByShareToken(token);
  if (!result.ok) {
    notFound();
  }
  const patient = result.data;
  const recommendations = await listPatientRecommendations(patient.id);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-col gap-4">
        <Wordmark />
        <div className="flex flex-col gap-2">
          <Typography as="h1" size="2xl" weight="semibold">
            {content.greeting} {patient.fullName ?? patient.pseudonym}
          </Typography>
          <Typography size="sm" tone="muted">
            {content.lead}
          </Typography>
        </div>
      </header>

      {patient.objective ? (
        <section className="flex flex-col gap-2">
          <Typography as="h2" size="lg" weight="semibold">
            {content.objectiveTitle}
          </Typography>
          <Typography size="sm" className="whitespace-pre-line">
            {patient.objective}
          </Typography>
        </section>
      ) : null}

      <section className="flex flex-col gap-4">
        <Typography as="h2" size="lg" weight="semibold">
          {content.recommendationsTitle}
        </Typography>

        {recommendations.length === 0 ? (
          <Typography size="sm" tone="muted">
            {content.empty}
          </Typography>
        ) : (
          <ul className="flex flex-col gap-3">
            {recommendationCategories
              .flatMap((category) =>
                recommendations.filter(
                  (recommendation) => recommendation.category === category,
                ),
              )
              .map((recommendation) => (
                <li key={recommendation.id}>
                  <Card>
                    <CardContent className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="info" tone="subtle" size="sm">
                          {content.categories[recommendation.category]}
                        </Badge>
                        <Typography as="h3" size="sm" weight="medium">
                          {recommendation.title}
                        </Typography>
                      </div>
                      {recommendation.detail ? (
                        <Typography
                          size="sm"
                          tone="muted"
                          className="whitespace-pre-line"
                        >
                          {recommendation.detail}
                        </Typography>
                      ) : null}
                    </CardContent>
                  </Card>
                </li>
              ))}
          </ul>
        )}
      </section>

      <Card variant="info">
        <CardContent className="flex flex-col gap-1.5">
          <Typography as="h2" size="sm" weight="semibold">
            {content.disclaimer.title}
          </Typography>
          <Typography size="sm" tone="muted">
            {content.disclaimer.body}
          </Typography>
        </CardContent>
      </Card>

      <footer className="flex flex-col gap-4">
        <Separator tone="subtle" />
        <Typography size="xs" tone="muted">
          {content.betaNote}
        </Typography>
      </footer>
    </main>
  );
};

export default PatientLink;
