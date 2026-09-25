import { notFound } from "next/navigation";
import { ageInYears, formatNumber, isLocale } from "@remi/services/shared";
import { Card, CardContent, Typography } from "@remi/ui/server";
import { ProfileForm } from "@/components/patient-link/profile-form";
import { SegmentPage } from "@/components/patient-link/segment-page";
import { getContent } from "@/lib/content";
import { fill } from "@/lib/content/fill";
import { loadPatientLink } from "@/lib/patient-link/load";

/** Reads the database on every hit — never prerendered. */
export const dynamic = "force-dynamic";

type Params = { locale: string; token: string };

/**
 * Mon profil: the seven fields the patient keeps true (`patient-profile-edit`),
 * then what Morgane has on record about them, read-only.
 *
 * The read-only block is exactly what RETENTION's table lets reach the link
 * from identity and measures — the name, the age (never the birth date), the
 * height and the weight. Constraints, referral, consent and anamnesis are her
 * working record and are not rendered; medications and supplements reach the
 * patient through their own segments, not this one.
 *
 * Like Repas and Messages it never 404s on an empty record and is never
 * hidden from the navigation — it is where a patient fills in what she has
 * not asked yet (`lib/patient-link/load.ts` → `visibleSegments`).
 */
const Segment = async ({ params }: { params: Promise<Params> }) => {
  const { locale, token } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  const content = getContent(locale).patientLink;
  const text = content.profile;

  const data = await loadPatientLink(token);
  if (!data) {
    notFound();
  }
  const { patient } = data;
  const age = ageInYears(patient.birthDate);

  const record = [
    { label: text.nameLabel, value: patient.fullName ?? patient.pseudonym },
    {
      label: text.ageLabel,
      value: age === null ? null : fill(text.ageValue, { age }),
    },
    {
      label: text.heightLabel,
      value:
        patient.heightCm === null
          ? null
          : `${formatNumber(patient.heightCm, locale)} cm`,
    },
    {
      label: text.weightLabel,
      value:
        patient.weightKg === null
          ? null
          : `${formatNumber(patient.weightKg, locale)} kg`,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <SegmentPage title={text.title}>
        <Typography size="sm" tone="muted">
          {text.lead}
        </Typography>
        <Card>
          <CardContent>
            <ProfileForm
              token={token}
              locale={locale}
              profile={{
                dietaryRegime: patient.dietaryRegime,
                allergies: patient.allergies,
                intolerances: patient.intolerances,
                preferences: patient.preferences,
                likesCooking: patient.likesCooking,
                cookingTime: patient.cookingTime,
                foodBudget: patient.foodBudget,
              }}
              content={content}
            />
          </CardContent>
        </Card>
      </SegmentPage>

      <SegmentPage title={text.recordTitle}>
        <Typography size="sm" tone="muted">
          {text.recordLead}
        </Typography>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
          {record.map((row) => (
            <div key={row.label} className="flex flex-col gap-0.5">
              <dt>
                <Typography size="xs" tone="muted">
                  {row.label}
                </Typography>
              </dt>
              <dd>
                <Typography size="sm" tone={row.value ? "default" : "muted"}>
                  {row.value ?? text.notRecorded}
                </Typography>
              </dd>
            </div>
          ))}
        </dl>
      </SegmentPage>
    </div>
  );
};

export default Segment;
