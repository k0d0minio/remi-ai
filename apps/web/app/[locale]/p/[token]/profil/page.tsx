import { notFound } from "next/navigation";
import { ageInYears, isLocale } from "@remi/services/shared";
import { Card, CardContent, Typography } from "@remi/ui/server";
import { ProfileForm } from "@/components/patient-link/profile-form";
import { SegmentPage } from "@/components/patient-link/segment-page";
import { getContent } from "@/lib/content";
import { loadPatientLink } from "@/lib/patient-link/load";

/** Reads the database on every hit — never prerendered. */
export const dynamic = "force-dynamic";

type Params = { locale: string; token: string };

/**
 * « Mon profil »: the seven fields the patient owns, then the practitioner's
 * record shown read-only beneath them.
 *
 * The split is `.icm/docs/RETENTION.md`'s table, not a judgement made here.
 * Name, age, height, weight, medication and supplements reach the link and so
 * appear, without an input, under a heading that says whose they are — a
 * patient who can see a field but not change it should be told which it is
 * rather than left tapping at it. Birth date, referral, anamnesis and consent
 * do not reach the link at all, so they are absent from the page rather than
 * hidden in it.
 *
 * Like Repas, it never 404s on an empty record and is never hidden from the
 * navigation: an empty profile is exactly the state this page exists to end.
 */
const Segment = async ({ params }: { params: Promise<Params> }) => {
  const { locale, token } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  const content = getContent(locale).patientLink;
  const copy = content.profile;

  const data = await loadPatientLink(token);
  if (!data) {
    notFound();
  }

  const { patient } = data;
  const age = ageInYears(patient.birthDate);

  // Only what RETENTION says reaches the link, and only what is actually on
  // file: a row reading "Poids : —" tells the patient nothing and invites them
  // to ask why they cannot fill it in.
  const record = [
    { label: copy.nameLabel, value: patient.fullName ?? "" },
    {
      label: copy.ageLabel,
      value: age === null ? "" : `${age} ${copy.ageUnit}`,
    },
    {
      label: copy.heightLabel,
      value: patient.heightCm === null ? "" : `${patient.heightCm} cm`,
    },
    {
      label: copy.weightLabel,
      value: patient.weightKg === null ? "" : `${patient.weightKg} kg`,
    },
    { label: copy.medicationsLabel, value: patient.medications },
    { label: copy.supplementsLabel, value: patient.supplements },
  ].filter((row) => row.value !== "");

  return (
    <div className="flex flex-col gap-8">
      <SegmentPage title={copy.title}>
        <div className="flex flex-col gap-4">
          <Typography size="sm" tone="muted">
            {copy.lead}
          </Typography>
          <Card>
            <CardContent>
              <ProfileForm
                token={token}
                locale={locale}
                patient={patient}
                content={content}
              />
            </CardContent>
          </Card>
        </div>
      </SegmentPage>

      <SegmentPage title={copy.recordTitle}>
        <div className="flex flex-col gap-4">
          <Typography size="sm" tone="muted">
            {copy.recordLead}
          </Typography>
          {record.length > 0 ? (
            <Card>
              <CardContent>
                <dl className="flex flex-col gap-3">
                  {record.map((row) => (
                    <div key={row.label} className="flex flex-col gap-0.5">
                      <Typography as="dt" size="xs" tone="muted">
                        {row.label}
                      </Typography>
                      <Typography as="dd" size="sm">
                        {row.value}
                      </Typography>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
          ) : (
            <Typography size="sm" tone="muted">
              {copy.recordEmpty}
            </Typography>
          )}
        </div>
      </SegmentPage>
    </div>
  );
};

export default Segment;
