import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { Link, Typography } from "@remi/ui/server";
import { AccessActions } from "@/components/practitioners/access-actions";
import { ActivitySummary } from "@/components/practitioners/activity-summary";
import { ClientRoster } from "@/components/practitioners/client-roster";
import { PractitionerProfile } from "@/components/practitioners/practitioner-profile";
import { practitioners } from "@/lib/fixtures";

type Params = { id: string };

const findPractitioner = (id: string) =>
  practitioners.find((practitioner) => practitioner.id === id);

export const generateMetadata = async ({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> => {
  const { id } = await params;
  return { title: findPractitioner(id)?.name ?? "Practitioner" };
};

/**
 * One account, whole. The roster and the activity sit together on the wide
 * column because the question an operator arrives with is nearly always about
 * both — "is this account working" is not answerable from either alone.
 */
const PractitionerDetail = async ({ params }: { params: Promise<Params> }) => {
  const { id } = await params;
  const practitioner = findPractitioner(id);

  if (!practitioner) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Link
          as={NextLink}
          href="/practitioners"
          variant="muted"
          className="flex w-fit items-center gap-1.5 text-sm"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Practitioners
        </Link>

        <div className="flex flex-col gap-1">
          <Typography as="h1" size="2xl" weight="semibold">
            {practitioner.name}
          </Typography>
          <Typography size="sm" tone="muted">
            {practitioner.specialty} · {practitioner.practice},{" "}
            {practitioner.city}
          </Typography>
        </div>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[1fr_1.6fr]">
        <div className="flex flex-col gap-6">
          <PractitionerProfile practitioner={practitioner} />
          <AccessActions practitioner={practitioner} />
        </div>

        <div className="flex flex-col gap-6">
          <ActivitySummary activity={practitioner.activity} />
          <ClientRoster practitioner={practitioner} />
        </div>
      </div>
    </div>
  );
};

export default PractitionerDetail;
