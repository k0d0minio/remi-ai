import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import NextLink from "next/link";
import { Typography } from "@remi/ui/server";
import { PatientForm } from "@/components/patients/patient-form";

export const metadata: Metadata = {
  title: "Nouveau patient",
};

const NewPatient = () => (
  <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
    <div className="flex flex-col gap-2">
      <NextLink
        href="/patients"
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring inline-flex w-fit items-center gap-1.5 rounded-sm text-sm transition-colors duration-[--duration-fast] focus-visible:outline-none focus-visible:ring-[3px]"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Patients
      </NextLink>
      <Typography as="h1" size="2xl" weight="semibold">
        Nouveau patient
      </Typography>
      <Typography size="sm" tone="muted">
        Le dossier complet, comme si le patient s&apos;était inscrit lui-même.
        Seul le pseudonyme est requis pour enregistrer : les champs manquants
        restent listés sur le dossier. Aucun email ne part.
      </Typography>
    </div>

    <PatientForm />
  </div>
);

export default NewPatient;
