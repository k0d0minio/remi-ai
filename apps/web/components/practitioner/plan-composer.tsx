"use client";

import { Check, Send, Sparkles } from "lucide-react";
import { useState } from "react";
import type { Recommendation } from "@remi/services/shared";
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
import { fill } from "@/lib/content/fill";
import type { Content } from "@/lib/content/types";

type Props = {
  clientName: string;
  /** The consultation's write-up, one paragraph per line as it was typed. */
  notes: readonly string[];
  drafts: readonly Recommendation[];
  categories: Content["plan"]["categories"];
  content: Content["planComposer"];
};

/**
 * "From notes to a clear plan", as an editing surface rather than a generation
 * button.
 *
 * The design argument is the tick boxes: REMI proposes a reading of the notes,
 * and nothing crosses to the patient until the practitioner has confirmed it.
 * The drafts arrive with `confirmed` already set, so a suggestion REMI
 * over-reached on comes in unticked — the screen has to look honest in that
 * case, not only in the happy one.
 *
 * Publishing is visual for now: it flips the panel into its published state and
 * writes nothing. The write lands when there is a storage adapter to write to.
 */
export const PlanComposer = ({
  clientName,
  notes,
  drafts,
  categories,
  content,
}: Props) => {
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(drafts.map((draft) => [draft.id, draft.confirmed])),
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
          <AlertTitle>{content.published.title}</AlertTitle>
          <AlertDescription>
            {fill(content.published.body, {
              name: clientName,
              count: confirmedCount,
            })}
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Typography as="h2" size="lg" weight="semibold">
              {content.notes.title}
            </Typography>
            <Typography size="sm" tone="muted">
              {content.notes.lead}
            </Typography>
          </div>

          <Card elevation="flat" className="border-border">
            <CardContent className="flex flex-col gap-4">
              {notes.map((note) => (
                <Typography
                  key={note}
                  size="sm"
                  className="border-border border-l-2 pl-3 font-mono"
                >
                  {note}
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
                {content.structured.title}
              </Typography>
            </div>
            <Typography size="sm" tone="muted">
              {fill(content.structured.lead, { name: clientName })}
            </Typography>
          </div>

          <ul className="flex flex-col gap-2">
            {drafts.map((draft) => (
              <li key={draft.id}>
                <label
                  htmlFor={draft.id}
                  className="border-border hover:bg-accent/50 flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors duration-[--duration-fast]"
                >
                  <Checkbox
                    id={draft.id}
                    checked={confirmed[draft.id]}
                    onCheckedChange={() => toggle(draft.id)}
                    className="mt-0.5"
                  />
                  <div className="flex min-w-0 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Typography as="span" size="sm" weight="medium">
                        {draft.title}
                      </Typography>
                      <Badge variant="neutral" tone="subtle" size="sm">
                        {categories[draft.category]}
                      </Badge>
                    </div>
                    <Typography size="sm" tone="muted">
                      {draft.detail}
                    </Typography>
                  </div>
                </label>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between gap-4">
            <Typography size="sm" tone="muted">
              {fill(content.structured.count, {
                confirmed: confirmedCount,
                total: drafts.length,
              })}
            </Typography>

            <Dialog>
              <DialogTrigger asChild>
                <Button disabled={confirmedCount === 0}>
                  <Send aria-hidden="true" />
                  {content.structured.publish}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {fill(content.dialog.title, { name: clientName })}
                  </DialogTitle>
                  <DialogDescription>
                    {fill(content.dialog.body, { count: confirmedCount })}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">{content.dialog.cancel}</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button onClick={() => setPublished(true)}>
                      <Check aria-hidden="true" />
                      {content.dialog.confirm}
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
