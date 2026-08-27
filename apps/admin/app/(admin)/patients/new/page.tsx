import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import NextLink from "next/link";
import { Typography } from "@remi/ui/server";
import { PatientForm } from "@/components/patients/patient-form";

export const metadata: Metadata = {
  title: "New patient",
};

const NewPatient = () => (
  <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
    <div className="flex flex-col gap-2">
      <NextLink
        href="/patients"
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/40 inline-flex w-fit items-center gap-1.5 rounded-sm text-sm transition-colors duration-[--duration-fast] focus-visible:outline-none focus-visible:ring-[3px]"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Patients
      </NextLink>
      <Typography as="h1" size="2xl" weight="semibold">
        New patient
      </Typography>
      <Typography size="sm" tone="muted">
        Only the pseudonym is required — everything else can be filled in as the
        consultations go.
      </Typography>
    </div>

    <PatientForm />
  </div>
);

export default NewPatient;
