import NextLink from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import {
  getPatient,
  patientActor,
  patientLandingFor,
} from "@remi/services/server";
import { localePath } from "@remi/services/shared";
import { Link, Typography, Wordmark } from "@remi/ui/server";
import { PatientTabBar } from "@/components/patient-shell/patient-tab-bar";
import { getContent } from "@/lib/content";
import { fill } from "@/lib/content/fill";
import { resolveLocale, type LocaleParams } from "@/lib/locale-params";
import { PROFILE_PATH, QUESTIONNAIRE_PATH } from "@/lib/patient-auth/paths";
import { requirePatient } from "@/lib/patient-auth/session";

/** Reads the session on every hit — never prerendered. */
export const dynamic = "force-dynamic";

/**
 * The patient's shell after activation (story 31): the logo, the greeting, a
 * link to Profil, and the tab bar. It is the patient session's boundary, so it
 * sits beside `(app)`, which runs on the development session only.
 *
 * A layout does not guard the data its pages read: a page renders alongside
 * its layout. A page that reads patient data calls `requirePatient()` itself.
 */
const PatientLayout = async ({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<LocaleParams>;
}) => {
  const locale = await resolveLocale(params);
  const account = await requirePatient(locale);
  // No recipe before activation (story 2, criterion 5).
  if (patientLandingFor(account) !== "home") {
    redirect(localePath(locale, QUESTIONNAIRE_PATH));
  }
  const patientId = account.patientProfileId;
  const patient = await getPatient(patientActor(patientId), patientId);
  const firstName = patient.ok ? patient.data.firstName?.trim() : undefined;
  const content = getContent(locale);
  const tabs = content.patientTabs.map((tab) => ({
    ...tab,
    href: localePath(locale, tab.href),
  }));

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#content"
        className="focus-visible:ring-ring bg-background sr-only z-50 rounded-md px-3 py-2 text-sm font-medium outline-none focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus-visible:ring-[3px]"
      >
        {content.shell.skipToContent}
      </a>

      <header className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 pt-6">
        <div className="flex items-center justify-between gap-4">
          <Wordmark size="sm" />
          <Link
            as={NextLink}
            href={localePath(locale, PROFILE_PATH)}
            variant="muted"
            className="inline-flex min-h-11 items-center px-2 text-sm font-medium"
          >
            {content.patientShell.profileLink}
          </Link>
        </div>
        <Typography as="p" size="xl" weight="semibold">
          {firstName
            ? fill(content.patientShell.greeting, { name: firstName })
            : content.patientShell.greetingNoName}
        </Typography>
      </header>

      <main
        id="content"
        className="mx-auto w-full max-w-xl flex-1 px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-6"
      >
        {children}
      </main>

      <PatientTabBar tabs={tabs} label={content.shell.navLabel} />
    </div>
  );
};

export default PatientLayout;
