import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Typography,
} from "@remi/ui/server";
import { PatientMessages } from "@/components/patient-messages";
import { practitionerName } from "@/lib/mock/clients";

export const metadata: Metadata = { title: "Mes messages" };

/**
 * The same thread as `/practitioner/messages`, from the other end. The framing
 * is the part that changes: the practitioner is told these messages sit in a
 * file, and the patient is told nobody is waiting at the other end of the line —
 * which is the expectation that actually needs setting before she writes.
 */
const Page = () => (
  <div className="mx-auto flex max-w-2xl flex-col gap-6">
    <div className="flex flex-col gap-2">
      <Typography as="h1" size="2xl" weight="semibold">
        Mes messages
      </Typography>
      <Typography tone="muted">
        Pour ce qui ne peut pas attendre la prochaine consultation, sans être
        urgent.
      </Typography>
    </div>

    <Alert variant="info">
      <ShieldCheck aria-hidden="true" />
      <AlertTitle>Vos messages font partie de votre suivi</AlertTitle>
      <AlertDescription>
        <p>
          {practitionerName} les lit entre deux consultations et vous répond
          quand il le peut. Ce n'est pas une messagerie instantanée : personne
          n'attend de l'autre côté.
        </p>
        <p>En cas d'urgence, appelez le 112 ou votre médecin traitant.</p>
      </AlertDescription>
    </Alert>

    <PatientMessages practitionerLabel={practitionerName} />
  </div>
);

export default Page;
