"use client";

import { Check, Send, Sparkles } from "lucide-react";
import { useState } from "react";
import {
  Button,
  Checkbox,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@remi/ui";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Card,
  CardContent,
  Typography,
} from "@remi/ui/server";
import { categoryLabels, draftRecommendations, notes } from "@/lib/mock/plan";

type Props = {
  clientName: string;
};

/**
 * "From notes to a clear plan", as an editing surface rather than a generation
 * button.
 *
 * The design argument is the tick boxes: REMI proposes a reading of the notes,
 * and nothing crosses to the patient until the practitioner has confirmed it.
 * One suggestion arrives unticked on purpose — the screen has to look honest in
 * the case where REMI has over-reached, not only in the happy one.
 */
export const PlanComposer = ({ clientName }: Props) => {
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      draftRecommendations.map((draft) => [draft.id, draft.confirmed]),
    ),
  );
  const [published, setPublished] = useState(false);

  const toggle = (id: string) => {
    setConfirmed((current) => ({ ...current, [id]: !current[id] }));
  };

  const confirmedCount = Object.values(confirmed).filter(Boolean).length;

  return (
    <div className="flex flex-col gap-6">
      {published ? (
        <Alert variant="success">
          <AlertTitle>Plan publié</AlertTitle>
          <AlertDescription>
            {clientName} verra {confirmedCount} recommandations dans son espace,
            traduites en repas et en étapes.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Typography as="h2" size="lg" weight="semibold">
              Vos notes
            </Typography>
            <Typography size="sm" tone="muted">
              Telles que vous les avez écrites. REMI ne les modifie jamais.
            </Typography>
          </div>

          <Card elevation="flat" className="border-border">
            <CardContent className="flex flex-col gap-4">
              {notes.map((note) => (
                <Typography
                  key={note.id}
                  size="sm"
                  className="border-border border-l-2 pl-3 font-mono"
                >
                  {note.text}
                </Typography>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Sparkles aria-hidden="true" className="text-primary size-4" />
              <Typography as="h2" size="lg" weight="semibold">
                Structuré par REMI
              </Typography>
            </div>
            <Typography size="sm" tone="muted">
              Décochez ce qui ne correspond pas. Rien de décoché n'atteint{" "}
              {clientName}.
            </Typography>
          </div>

          <ul className="flex flex-col gap-2">
            {draftRecommendations.map((draft) => {
              const isConfirmed = confirmed[draft.id];
              const source = notes.findIndex(
                (note) => note.id === draft.fromNoteId,
              );

              return (
                <li key={draft.id}>
                  <label
                    htmlFor={draft.id}
                    className="border-border hover:bg-accent/50 flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors duration-[--duration-fast]"
                  >
                    <Checkbox
                      id={draft.id}
                      checked={isConfirmed}
                      onCheckedChange={() => toggle(draft.id)}
                      className="mt-0.5"
                    />
                    <div className="flex min-w-0 flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Typography as="span" size="sm" weight="medium">
                          {draft.title}
                        </Typography>
                        <Badge variant="neutral" tone="subtle" size="sm">
                          {categoryLabels[draft.category]}
                        </Badge>
                      </div>
                      <Typography size="sm" tone="muted">
                        {draft.detail}
                      </Typography>
                      <Typography size="xs" tone="muted" className="opacity-70">
                        Tiré de votre note {source + 1}
                      </Typography>
                    </div>
                  </label>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center justify-between gap-4">
            <Typography size="sm" tone="muted">
              {confirmedCount} sur {draftRecommendations.length} confirmées
            </Typography>

            <Dialog>
              <DialogTrigger asChild>
                <Button disabled={confirmedCount === 0}>
                  <Send aria-hidden="true" />
                  Publier le plan
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Publier le plan de {clientName} ?</DialogTitle>
                  <DialogDescription>
                    {confirmedCount} recommandations deviendront des repas et
                    des étapes dans son espace. Le plan précédent sera remplacé.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Annuler</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button onClick={() => setPublished(true)}>
                      <Check aria-hidden="true" />
                      Publier
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </section>
      </div>
    </div>
  );
};
