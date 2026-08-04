"use client";

import { Camera, Check, Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@remi/ui";
import { Textarea, Typography } from "@remi/ui/server";
import { JournalConfidenceBadge } from "@/components/journal-confidence-badge";
import { JournalPhotoTile } from "@/components/journal-photo-tile";
import { JournalRecognitions } from "@/components/journal-recognitions";
import { JournalTimeline } from "@/components/journal-timeline";
import { analysisSteps, capturedEntry, slotLabels } from "@/lib/mock/journal";
import type { JournalEntry } from "@/lib/mock/types";

/** How long each analysing line stays on screen. Long enough to be read. */
const STEP_MS = 700;

type Stage = "capture" | "analyzing" | "result";

type Props = {
  entries: JournalEntry[];
};

/**
 * The add flow, and the timeline it adds to.
 *
 * The analysing state is the part worth prototyping: it names each thing being
 * done to the photo instead of spinning silently, because "what did it just do
 * with my lunch" is the question a person asks the first time and never asks
 * out loud. The capture step takes no photo — the demo has no camera and no
 * backend to send one to, and says so on the screen rather than in a caption.
 */
export const JournalLogFlow = ({ entries }: Props) => {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<Stage>("capture");
  const [analysisStep, setAnalysisStep] = useState(0);
  const [note, setNote] = useState("");
  const [logged, setLogged] = useState<JournalEntry[]>([]);

  useEffect(() => {
    if (stage !== "analyzing") {
      return;
    }

    const advance = setInterval(() => {
      setAnalysisStep((current) =>
        Math.min(current + 1, analysisSteps.length - 1),
      );
    }, STEP_MS);
    const finish = setTimeout(() => {
      setStage("result");
    }, analysisSteps.length * STEP_MS);

    return () => {
      clearInterval(advance);
      clearTimeout(finish);
    };
  }, [stage]);

  const reset = () => {
    setStage("capture");
    setAnalysisStep(0);
    setNote("");
  };

  const close = () => {
    setOpen(false);
    reset();
  };

  const log = () => {
    setLogged((current) => [
      {
        ...capturedEntry,
        id: `${capturedEntry.id}_${current.length + 1}`,
        note: note.trim() || null,
      },
      ...current,
    ]);
    close();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={() => {
            reset();
            setOpen(true);
          }}
        >
          <Plus aria-hidden="true" />
          Ajouter un repas
        </Button>
      </div>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (next) {
            setOpen(true);
            return;
          }

          close();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un repas</DialogTitle>
            <DialogDescription>
              Une photo, et REMI la compare à votre plan. Rien n'est envoyé à
              votre praticien avant votre bilan de la semaine.
            </DialogDescription>
          </DialogHeader>

          {stage === "capture" ? (
            <div className="flex flex-col gap-4">
              <div className="border-border bg-muted flex flex-col items-center gap-3 rounded-xl border border-dashed p-8">
                <Camera
                  aria-hidden="true"
                  className="text-muted-foreground size-8"
                />
                <Typography size="sm" tone="muted" className="text-center">
                  Maquette : aucune photo n'est prise ni enregistrée.
                </Typography>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={close}>
                  Annuler
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setAnalysisStep(0);
                    setStage("analyzing");
                  }}
                >
                  <Camera aria-hidden="true" />
                  Prendre la photo
                </Button>
              </DialogFooter>
            </div>
          ) : null}

          {stage === "analyzing" ? (
            <div
              aria-live="polite"
              className="flex flex-col items-center gap-4 py-10"
            >
              <Loader2
                aria-hidden="true"
                className="text-primary size-8 animate-spin"
              />
              <Typography size="sm" tone="muted">
                {analysisSteps[analysisStep]}
              </Typography>
            </div>
          ) : null}

          {stage === "result" ? (
            <div className="flex flex-col gap-4">
              <JournalPhotoTile tone={capturedEntry.photoTone} size="lg" />

              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex flex-col gap-0.5">
                  <Typography as="span" size="sm" tone="muted">
                    {slotLabels[capturedEntry.slot]} · à l'instant
                  </Typography>
                  <Typography as="span" weight="medium">
                    {capturedEntry.identified}
                  </Typography>
                </div>
                <JournalConfidenceBadge confidence={capturedEntry.confidence} />
              </div>

              <JournalRecognitions recognitions={capturedEntry.recognitions} />

              <div className="flex flex-col gap-1.5">
                <Typography as="label" htmlFor="journal-note" size="sm">
                  Une note, si vous voulez
                </Typography>
                <Textarea
                  id="journal-note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Ce que vous avez ressenti, où vous étiez…"
                  className="min-h-20"
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={close}>
                  Annuler
                </Button>
                <Button type="button" onClick={log}>
                  <Check aria-hidden="true" />
                  Ajouter au journal
                </Button>
              </DialogFooter>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <JournalTimeline
        entries={[...logged, ...entries]}
        viewer="person"
        freshIds={logged.map((entry) => entry.id)}
      />
    </div>
  );
};
