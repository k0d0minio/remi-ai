import type { Metadata } from "next";
import { Check } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Typography,
} from "@remi/ui/server";
import { FrameEditor } from "@/components/frame-editor";
import { frameEffects, frameName, frameSummary } from "@/lib/mock/frame";

export const metadata: Metadata = { title: "Cadre thérapeutique" };

/**
 * The screen that separates REMI from a diet app. Everything else in the
 * practitioner console reports on what happened; this one decides what REMI is
 * allowed to say in the first place.
 */
const Page = () => (
  <div className="mx-auto flex max-w-4xl flex-col gap-8">
    <div className="flex flex-col gap-2">
      <Typography as="h1" size="2xl" weight="semibold">
        Cadre thérapeutique
      </Typography>
      <Typography tone="muted">
        {frameName} · {frameSummary}
      </Typography>
    </div>

    <Alert variant="info">
      <AlertTitle>Vous posez le cadre, REMI travaille dedans</AlertTitle>
      <AlertDescription>
        <ul className="mt-2 flex flex-col gap-1.5">
          {frameEffects.map((effect) => (
            <li key={effect} className="flex items-start gap-2">
              <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              {effect}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>

    <FrameEditor />
  </div>
);

export default Page;
