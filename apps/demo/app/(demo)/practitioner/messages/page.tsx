import type { Metadata } from "next";
import { Stethoscope } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Typography,
} from "@remi/ui/server";
import { MessagesInbox } from "@/components/messages-inbox";

export const metadata: Metadata = { title: "Messagerie" };

/**
 * The banner is not decoration. Everything below it looks like a chat app, and a
 * chat app carries an expectation — instant, always-on, answerable in a line —
 * that a therapeutic relationship cannot honour. Saying what this is before the
 * practitioner sees the first bubble is what keeps the resemblance useful
 * instead of misleading.
 */
const Page = () => (
  <div className="flex flex-col gap-6">
    <div className="flex flex-col gap-2">
      <Typography as="h1" size="2xl" weight="semibold">
        Messagerie
      </Typography>
      <Typography tone="muted">
        Ce qui se dit entre deux consultations, au dossier plutôt qu'en SMS.
      </Typography>
    </div>

    <Alert variant="info">
      <Stethoscope aria-hidden="true" />
      <AlertTitle>Ces échanges font partie du cadre thérapeutique</AlertTitle>
      <AlertDescription>
        <p>
          Ils sont conservés au dossier de la personne et relus en consultation.
          Ce n'est pas une messagerie instantanée : aucun accusé de lecture
          n'est renvoyé, et aucun délai de réponse n'est promis de votre part.
        </p>
        <p>REMI peut proposer une réponse. Il n'en envoie jamais une.</p>
      </AlertDescription>
    </Alert>

    <MessagesInbox />
  </div>
);

export default Page;
