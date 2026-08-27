import { ArrowLeft } from "lucide-react";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { getPatient, listPatientRecommendations } from "@remi/services/server";
import { appHref } from "@remi/services/shared";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Typography,
} from "@remi/ui/server";
import { DeletePatient } from "@/components/patients/delete-patient";
import { PatientForm } from "@/components/patients/patient-form";
import { RecommendationAddForm } from "@/components/patients/recommendation-add-form";
import { RecommendationItem } from "@/components/patients/recommendation-item";
import { ShareLinkCard } from "@/components/patients/share-link-card";
import {
  patientStatusIntents,
  patientStatusLabels,
} from "@/components/patients/vocabulary";

/** Reads the database on every hit — never prerendered. */
export const dynamic = "force-dynamic";

type Params = { id: string };

/**
 * One patient, everything Morgane does with them on one scrolling page: the
 * link she shares, the protocol she encodes, the profile behind it, and — last
 * and behind a dialog — deletion. Ordered by how often each is reached for
 * mid-consultation, phone first.
 */
const PatientDetail = async ({ params }: { params: Promise<Params> }) => {
  const { id } = await params;
  const result = await getPatient(id);
  if (!result.ok) {
    notFound();
  }
  const patient = result.data;
  const recommendations = await listPatientRecommendations(patient.id);
  const shareUrl = appHref("web", `/p/${patient.shareToken}`, patient.locale);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <NextLink
          href="/patients"
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/40 inline-flex w-fit items-center gap-1.5 rounded-sm text-sm transition-colors duration-[--duration-fast] focus-visible:outline-none focus-visible:ring-[3px]"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Patients
        </NextLink>
        <div className="flex flex-wrap items-center gap-3">
          <Typography as="h1" size="2xl" weight="semibold">
            {patient.pseudonym}
          </Typography>
          <Badge
            variant={patientStatusIntents[patient.status]}
            tone="subtle"
            size="sm"
          >
            {patientStatusLabels[patient.status]}
          </Badge>
        </div>
        {patient.fullName ? (
          <Typography size="sm" tone="muted">
            {patient.fullName}
          </Typography>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient link</CardTitle>
          <CardDescription>
            Their view of the profile and recommendations — for the patient, and
            for consultants testing the interface.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ShareLinkCard patientId={patient.id} url={shareUrl} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>
            The protocol, encoded entry by entry — this is what the patient link
            shows.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {recommendations.length === 0 ? (
            <Typography size="sm" tone="muted">
              Nothing encoded yet.
            </Typography>
          ) : (
            <ul className="flex flex-col gap-3">
              {recommendations.map((recommendation) => (
                <RecommendationItem
                  key={recommendation.id}
                  recommendation={recommendation}
                />
              ))}
            </ul>
          )}

          <RecommendationAddForm patientId={patient.id} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            The anamnesis-level picture the recommendations — and later the
            recipes — are personalised against.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PatientForm patient={patient} />
        </CardContent>
      </Card>

      <Card variant="error">
        <CardHeader>
          <CardTitle>Danger zone</CardTitle>
          <CardDescription>
            Deleting removes the profile, its recommendations and the patient
            link — permanently.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeletePatient patientId={patient.id} pseudonym={patient.pseudonym} />
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientDetail;
