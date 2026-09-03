import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { isLocale } from "@remi/services/shared";
import {
  Card,
  CardContent,
  Separator,
  Typography,
  Wordmark,
} from "@remi/ui/server";
import { SegmentNav } from "@/components/patient-link/segment-nav";
import { getContent } from "@/lib/content";
import { loadPatientLink, visibleSegments } from "@/lib/patient-link/load";

/** Reads the database on every hit — never prerendered. */
export const dynamic = "force-dynamic";

type Params = { locale: string; token: string };

/**
 * The shell every segment of the patient link renders inside (REMI-035,
 * decision #3): the wordmark, the greeting, the navigation, and the
 * privacy/disclaimer card with the beta note as a shared footer.
 *
 * The token in the path is the whole credential — an unguessable capability
 * minted per patient in the admin console, revocable by regenerating it there.
 * An unknown, malformed or revoked token is `notFound()` here, so it 404s on
 * every route at once: there is nothing partial to show without it, and the
 * patient's name never reaches the page.
 *
 * Nothing here links onward into the signed-in app, and no session is created
 * or read.
 */
const PatientLinkLayout = async ({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<Params>;
}) => {
  const { locale, token } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  const content = getContent(locale).patientLink;

  const data = await loadPatientLink(token);
  if (!data) {
    notFound();
  }

  const { patient } = data;

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
        <SegmentNav
          locale={locale}
          token={token}
          segments={visibleSegments(data)}
          content={content}
        />
      </header>

      {children}

      <Card variant="info">
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Typography as="h2" size="sm" weight="semibold">
              {content.disclaimer.title}
            </Typography>
            <Typography size="sm" tone="muted">
              {content.disclaimer.body}
            </Typography>
          </div>
          <div className="flex flex-col gap-1.5">
            <Typography as="h2" size="sm" weight="semibold">
              {content.privacy.title}
            </Typography>
            <Typography size="sm" tone="muted">
              {content.privacy.body}
            </Typography>
          </div>
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

export default PatientLinkLayout;
