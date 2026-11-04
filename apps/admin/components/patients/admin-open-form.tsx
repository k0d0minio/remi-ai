"use client";

import { ShieldAlert } from "lucide-react";
import NextLink from "next/link";
import { useActionState } from "react";
import { Button } from "@remi/ui";
import { Field, Input, Typography } from "@remi/ui/server";
import {
  openPatientFileAction,
  type AdminOpenState,
} from "@/lib/patients/admin-open";

const initial: AdminOpenState = { error: null };

type Props = {
  patientId: string;
  pseudonym: string;
};

/**
 * The step before an admin reads a file of another practitioner (story 3).
 * The reason is asked once per file, and holds for four hours. The journal
 * records the open with the reason.
 */
export const AdminOpenForm = ({ patientId, pseudonym }: Props) => {
  const [state, action, pending] = useActionState(
    openPatientFileAction,
    initial,
  );

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <div className="flex items-center gap-2">
        <ShieldAlert aria-hidden="true" className="text-warning-text size-5" />
        <Typography as="h1" size="xl" weight="semibold">
          Accès au dossier de {pseudonym}
        </Typography>
      </div>
      <Typography size="sm" tone="muted">
        Ce dossier est suivi par un autre compte. Vous pouvez l&apos;ouvrir en
        lecture seule pour un besoin technique ou administratif. Le motif et
        l&apos;accès sont enregistrés au journal. L&apos;accès dure quatre
        heures.
      </Typography>
      <form
        action={action}
        className="border-border flex flex-col gap-4 rounded-lg border p-4"
      >
        <input type="hidden" name="patientId" value={patientId} />
        <Field
          id="admin-open-reason"
          label="Motif de l'accès"
          hint="Une ligne, par exemple « Erreur signalée sur le questionnaire »."
        >
          <Input
            id="admin-open-reason"
            name="reason"
            required
            maxLength={200}
            autoComplete="off"
          />
        </Field>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Ouverture…" : "Ouvrir en lecture seule"}
          </Button>
          <Button asChild size="sm" variant="ghost">
            <NextLink href="/patients?scope=all">Annuler</NextLink>
          </Button>
          {state.error ? (
            <Typography size="sm" className="text-error-text" role="alert">
              {state.error}
            </Typography>
          ) : null}
        </div>
      </form>
    </div>
  );
};
