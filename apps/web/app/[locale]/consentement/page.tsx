import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { defaultLocale, isLocale, localePath } from "@remi/services/shared";
import { Typography, Wordmark } from "@remi/ui/server";
import { SignOutButton } from "@/components/patient-auth/sign-out-button";
import { ConsentList } from "@/components/patient-consents/consent-list";
import { consentEntries } from "@/lib/consents/entries";
import { getContent } from "@/lib/content";
import { fill } from "@/lib/content/fill";
import { landingPaths, PROFILE_PATH } from "@/lib/patient-auth/paths";
import {
  careConsentHeld,
  patientLanding,
  requirePatient,
} from "@/lib/patient-auth/session";

/** Reads the session and the consents on every hit: never prerendered. */
export const dynamic = "force-dynamic";

type Params = { locale: string };

export const generateMetadata = async ({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> => {
  const { locale } = await params;
  return {
    title: getContent(isLocale(locale) ? locale : defaultLocale).patientConsents
      .pause.metaTitle,
  };
};

/**
 * The screen of an active patient whose care consent is not in force (REM-43).
 * The service needs that consent, so the space does not open: the guard of the
 * space sends the patient here. The screen says what stops, what does not
 * change, and how to give the consent again. It shows no recommendation, no
 * recipe and no patient data other than the consents.
 *
 * It sits beside `attente/`, outside the shell of `(patient)/`: the tab bar
 * belongs to the open space. Each hit reads the consent again, so the request
 * after a new consent opens the space.
 *
 * The patient's id comes from the session, never from the address (D-26).
 */
const CareConsentPage = async ({ params }: { params: Promise<Params> }) => {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  const account = await requirePatient(locale);
  const landing = await patientLanding(account);
  if (landing !== "home") {
    redirect(localePath(locale, landingPaths[landing]));
  }
  if (await careConsentHeld(account)) {
    redirect(localePath(locale, PROFILE_PATH));
  }
  const entries = await consentEntries(account.patientProfileId, locale);
  const content = getContent(locale);
  const text = content.patientConsents;
  const care = entries.find((entry) => entry.key === "care");

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-8 px-5 py-10">
      <Wordmark />
      <section aria-labelledby="pause-title" className="flex flex-col gap-4">
        <Typography as="h1" id="pause-title" size="2xl" weight="semibold">
          {text.pause.title}
        </Typography>
        <Typography as="p" size="base">
          {care?.state === "withdrawn" && care.decidedOn
            ? fill(text.pause.withdrawn, { date: care.decidedOn })
            : text.pause.missing}
        </Typography>
      </section>

      <section aria-labelledby="pause-stops" className="flex flex-col gap-2">
        <Typography as="h2" id="pause-stops" size="lg" weight="semibold">
          {text.pause.stopsTitle}
        </Typography>
        <ul className="flex list-disc flex-col gap-1 pl-5">
          {text.pause.stops.map((line) => (
            <Typography as="li" key={line} size="base">
              {line}
            </Typography>
          ))}
        </ul>
      </section>

      <section aria-labelledby="pause-stays" className="flex flex-col gap-2">
        <Typography as="h2" id="pause-stays" size="lg" weight="semibold">
          {text.pause.staysTitle}
        </Typography>
        <Typography as="p" size="base">
          {text.pause.stays}
        </Typography>
      </section>

      <section aria-labelledby="pause-again" className="flex flex-col gap-3">
        <Typography as="h2" id="pause-again" size="lg" weight="semibold">
          {text.pause.againTitle}
        </Typography>
        <Typography as="p" size="base">
          {text.pause.again}
        </Typography>
        <Typography as="h3" size="base" weight="medium">
          {text.pause.consentsTitle}
        </Typography>
        <ConsentList
          locale={locale}
          entries={entries}
          names={content.signupLink.consent.names}
          textLine={content.signupLink.consent.version}
          text={text}
        />
        <Typography size="sm" tone="muted">
          {text.deletion}
        </Typography>
      </section>

      <SignOutButton locale={locale} label={content.signOut} />
    </main>
  );
};

export default CareConsentPage;
