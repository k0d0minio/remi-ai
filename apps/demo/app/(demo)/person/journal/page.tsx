import type { Metadata } from "next";
import { Camera } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Typography,
} from "@remi/ui/server";
import { JournalLogFlow } from "@/components/journal-log-flow";
import { practitionerName } from "@/lib/mock/clients";
import { journalEntries } from "@/lib/mock/journal";

export const metadata: Metadata = { title: "Journal" };

/**
 * Photographing a meal is the cheapest honest record a person can keep — no
 * weighing, no app-shaped vocabulary, no evening spent typing. What makes it
 * worth building here is the third line of every entry: what REMI read, how
 * sure it is, and which of the practitioner's recommendations it lands on.
 * Without that mapping this is a photo album; with it, it is the material the
 * next consultation runs on.
 */
const Page = () => (
  <div className="mx-auto flex max-w-2xl flex-col gap-6">
    <div className="flex flex-col gap-2">
      <Typography as="h1" size="2xl" weight="semibold">
        Journal
      </Typography>
      <Typography tone="muted">
        Une photo de ce que vous mangez, quand vous y pensez. REMI reconnaît
        l'assiette et la place face à votre plan.
      </Typography>
    </div>

    <Alert variant="info">
      <Camera aria-hidden="true" />
      <AlertTitle>Ce n'est pas une note, c'est une trace</AlertTitle>
      <AlertDescription>
        <p>
          REMI dit ce qu'il croit voir et à quel point il en est sûr — il se
          trompe, et vous pouvez le corriger. Rien ici n'est bon ou mauvais :
          les repas s'ajoutent, et ce qui mérite une discussion est signalé
          comme tel.
        </p>
        <p>
          {practitionerName} retrouve ce journal dans votre dossier avant votre
          consultation. C'est lui qui l'interprète.
        </p>
      </AlertDescription>
    </Alert>

    <JournalLogFlow entries={journalEntries} />
  </div>
);

export default Page;
