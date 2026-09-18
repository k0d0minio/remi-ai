import { ArrowLeft } from "lucide-react";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import {
  getPatient,
  getPatientInstruction,
  getPatientSummary,
  listGoalCheckIns,
  listPatientGoals,
} from "@remi/services/server";
import { Typography } from "@remi/ui/server";
import {
  ConsultationForm,
  type ConsultationGoal,
} from "@/components/patients/consultation-form";
import { ensureDatabase } from "@/lib/database";

/** Reads the database on every hit — never prerendered. */
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

/**
 * The three protocol sections, as links back into the patient page.
 *
 * They open those sections as they stand today — one row per save. When
 * `bulk-entry` turns them into grids, the same links open the grid: the anchor
 * and the segment are what this screen knows about them, and neither changes.
 * `from=consultation` is what puts a way back on the patient page, so leaving
 * this screen to add a recommendation is a round trip rather than an exit.
 */
const protocolLinks = (id: string) =>
  [
    { label: "Recommandations", anchor: "recommendations" },
    { label: "Compléments", anchor: "supplements" },
    { label: "Essentiels placard et frigo", anchor: "pantry" },
  ].map((section) => ({
    label: section.label,
    href: `/patients/${id}?segment=suivi&from=consultation#${section.anchor}`,
  }));

/**
 * « Nouvelle consultation » — the five edits Morgane used to make in five
 * places, on one screen in the order she works: comprendre (the note), décider
 * (the check-ins, the consigne, the résumé), agir (links into the protocol),
 * suivre (what to prepare next time). One save writes all of it, and returns
 * here to the patient's working view.
 */
const NewConsultation = async ({ params }: PageProps) => {
  ensureDatabase();
  const { id } = await params;
  const result = await getPatient(id);
  if (!result.ok) {
    notFound();
  }
  const patient = result.data;

  const [goals, instruction, summary] = await Promise.all([
    listPatientGoals(patient.id),
    getPatientInstruction(patient.id),
    getPatientSummary(patient.id),
  ]);

  // What she is moving from, one read per active goal — two or three of them.
  const withLastCheckIn: ConsultationGoal[] = await Promise.all(
    goals.map(async (goal) => ({
      goal,
      lastCheckIn: (await listGoalCheckIns(goal.id))[0] ?? null,
    })),
  );

  // Resolved server-side: a date input seeded from the browser's clock
  // disagrees with the server the moment someone works across midnight.
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <NextLink
          href={`/patients/${patient.id}`}
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/40 inline-flex w-fit items-center gap-1.5 rounded-sm text-sm transition-colors duration-[--duration-fast] focus-visible:outline-none focus-visible:ring-[3px]"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          {patient.pseudonym}
        </NextLink>
        <Typography as="h1" size="2xl" weight="semibold">
          Nouvelle consultation
        </Typography>
        <Typography size="sm" tone="muted">
          Tout se remplit ici et s&apos;enregistre en une fois. Ce que vous
          écrivez est conservé si vous quittez la page.
        </Typography>
      </div>

      <ConsultationForm
        patientId={patient.id}
        pseudonym={patient.pseudonym}
        today={today}
        goals={withLastCheckIn}
        instruction={instruction?.body ?? ""}
        patientInstruction={instruction?.patientBody ?? ""}
        summary={summary?.body ?? ""}
        nextConsultationPrep={patient.nextConsultationPrep ?? ""}
        protocolLinks={protocolLinks(patient.id)}
      />
    </div>
  );
};

export default NewConsultation;
