import type { Metadata } from "next";
import { Plus, Users } from "lucide-react";
import NextLink from "next/link";
import { listPatients } from "@remi/services/server";
import { formatDate } from "@remi/services/shared";
import { Button } from "@remi/ui";
import { Badge, EmptyState, Typography } from "@remi/ui/server";
import {
  patientStatusIntents,
  patientStatusLabels,
} from "@/components/patients/vocabulary";
import { ensureDatabase } from "@/lib/database";

export const metadata: Metadata = {
  title: "Patients",
};

/** Reads the database on every hit — never prerendered. */
export const dynamic = "force-dynamic";

/**
 * The patient roster — real rows from the database, unlike the fixture-backed
 * screens around it. Rows rather than a table: at 10–15 patients there is
 * nothing to sort, and rows survive a phone screen, which is where Morgane
 * opens this between consultations.
 */
const Patients = async () => {
  // The page's own graph, not the layout's: the two render in parallel, so
  // the guard's registration cannot be relied on to have happened first.
  ensureDatabase();
  const patients = await listPatients();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Typography as="h1" size="2xl" weight="semibold">
            Patients
          </Typography>
          <Typography size="sm" tone="muted">
            The profiles Morgane runs her consultations on — {patients.length}{" "}
            on the books.
          </Typography>
        </div>

        <Button asChild>
          <NextLink href="/patients/new">
            <Plus aria-hidden="true" />
            New patient
          </NextLink>
        </Button>
      </div>

      {patients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No patients yet"
          body="Create the first profile to start encoding recommendations and share the patient link."
          actions={
            <Button asChild>
              <NextLink href="/patients/new">
                <Plus aria-hidden="true" />
                New patient
              </NextLink>
            </Button>
          }
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {patients.map((patient) => (
            <li key={patient.id}>
              <NextLink
                href={`/patients/${patient.id}`}
                className="border-border bg-card hover:bg-accent focus-visible:ring-ring/40 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border px-4 py-3 transition-colors duration-[--duration-fast] focus-visible:outline-none focus-visible:ring-[3px]"
              >
                <Typography as="span" size="sm" weight="medium">
                  {patient.pseudonym}
                </Typography>
                {patient.fullName ? (
                  <Typography as="span" size="sm" tone="muted">
                    {patient.fullName}
                  </Typography>
                ) : null}
                <span className="ml-auto flex items-center gap-3">
                  <Typography as="span" size="xs" tone="muted">
                    since {formatDate(patient.createdAt)}
                  </Typography>
                  <Badge
                    variant={patientStatusIntents[patient.status]}
                    tone="subtle"
                    size="sm"
                  >
                    {patientStatusLabels[patient.status]}
                  </Badge>
                </span>
              </NextLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Patients;
