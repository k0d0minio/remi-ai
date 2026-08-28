import { notFound } from "next/navigation";
import {
  getPatientByShareToken,
  listPatientRecommendations,
  recordPatientLinkOpened,
} from "@remi/services/server";
import { ageInYears, isLocale } from "@remi/services/shared";
import {
  Badge,
  Card,
  CardContent,
  Separator,
  Typography,
  Wordmark,
} from "@remi/ui/server";
import { getContent } from "@/lib/content";
import { ensureDatabase } from "@/lib/database";

/** Reads the database on every hit — never prerendered. */
export const dynamic = "force-dynamic";

type Params = { locale: string; token: string };

/**
 * The shareable patient link (REMI-035): the one page in this app reached by
 * URL rather than sign-in. The token in the path is the whole credential — an
 * unguessable capability minted per patient in the admin console, revocable by
 * regenerating it there. Nothing here links onward into the signed-in app.
 *
 * This page renders in the patient's own language and shows the real name
 * when Morgane recorded one — it is their page. The pseudonym stays the
 * working name everywhere else.
 *
 * What it shows is a deliberate subset. The objective, the constraints, the
 * preferences and the clinical figures are all written about this person and
 * belong to them; the anamnesis and the consultation notes are the
 * practitioner's working record, in her shorthand, and never leave the console.
 */
const PatientLink = async ({ params }: { params: Promise<Params> }) => {
  const { locale, token } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  const content = getContent(locale).patientLink;

  ensureDatabase();
  const result = await getPatientByShareToken(token);
  if (!result.ok) {
    notFound();
  }
  const patient = result.data;
  const recommendations = await listPatientRecommendations(patient.id);

  // Awaited rather than fired and forgotten: an unawaited promise in a server
  // component can be cut off when the response finishes. The service
  // rate-limits itself, so this is usually a read and no write at all.
  await recordPatientLinkOpened(patient.id);

  const age = ageInYears(patient.birthDate);
  const measurements = [
    age !== null ? `${age} ${content.ageLabel}` : null,
    patient.heightCm ? `${patient.heightCm} ${content.heightLabel}` : null,
    patient.weightKg ? `${patient.weightKg} ${content.weightLabel}` : null,
  ].filter((entry) => entry !== null);

  const profileBlocks = [
    { title: content.constraintsTitle, body: patient.constraints },
    { title: content.preferencesTitle, body: patient.preferences },
    { title: content.medicationsTitle, body: patient.medications },
    { title: content.supplementsTitle, body: patient.supplements },
  ].filter((block) => block.body.trim() !== "");

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
            {recommendations.map((recommendation) => (
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

      {measurements.length > 0 || profileBlocks.length > 0 ? (
        <section className="flex flex-col gap-4">
          <Typography as="h2" size="lg" weight="semibold">
            {content.profileTitle}
          </Typography>

          {measurements.length > 0 ? (
            <Typography size="sm" tone="muted">
              {measurements.join(" · ")}
            </Typography>
          ) : null}

          {profileBlocks.map((block) => (
            <div key={block.title} className="flex flex-col gap-1">
              <Typography as="h3" size="sm" weight="medium">
                {block.title}
              </Typography>
              <Typography
                size="sm"
                tone="muted"
                className="whitespace-pre-line"
              >
                {block.body}
              </Typography>
            </div>
          ))}
        </section>
      ) : null}

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
