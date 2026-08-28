"use client";

import { MessageSquarePlus, Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@remi/ui";
import { Textarea, Typography } from "@remi/ui/server";
import type { QuickReply } from "@/lib/mock/types";

type Props = {
  chips: QuickReply[];
  /**
   * `assist` is REMI proposing a reply to the practitioner; `quick` is the
   * patient reaching for a phrase she writes every fortnight. Same mechanic,
   * different claim — so the row says which one it is.
   */
  variant: "assist" | "quick";
  placeholder: string;
  onSend: (body: string) => void;
};

const rows = {
  assist: {
    icon: Sparkles,
    label: "Suggérer une réponse",
    hint: "Proposées à partir du plan en cours et de vos préceptes. Aucune n'est envoyée : elle se pose dans le champ, vous écrivez la réponse.",
  },
  quick: {
    icon: MessageSquarePlus,
    label: "Réponses rapides",
    hint: "Un point de départ, pas un formulaire. Vous pouvez tout réécrire avant d'envoyer.",
  },
} as const;

/**
 * The composer, with the chips above it rather than beside the send button.
 *
 * That placement is the design argument: a suggestion is something you read
 * before writing, not a shortcut that skips the writing. Clicking one only fills
 * the box — the practitioner still has to press send, which is the same shape as
 * the plan composer's tick boxes.
 */
export const MessageComposer = ({
  chips,
  variant,
  placeholder,
  onSend,
}: Props) => {
  const [draft, setDraft] = useState("");
  const row = rows[variant];
  const RowIcon = row.icon;

  const send = () => {
    if (!draft.trim()) {
      return;
    }

    onSend(draft.trim());
    setDraft("");
  };

  return (
    <div className="border-border bg-card flex flex-col gap-3 rounded-lg border p-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <RowIcon aria-hidden="true" className="text-primary size-4" />
          <Typography as="span" size="sm" weight="medium">
            {row.label}
          </Typography>
        </div>

        <div
          role="group"
          aria-label={row.label}
          className="flex flex-wrap gap-2"
        >
          {chips.map((chip) => (
            <Button
              key={chip.id}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDraft(chip.text)}
            >
              {chip.label}
            </Button>
          ))}
        </div>

        <Typography size="xs" tone="muted">
          {row.hint}
        </Typography>
      </div>

      <Textarea
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder={placeholder}
        aria-label="Votre message"
        className="min-h-24"
      />

      <div className="flex justify-end">
        <Button type="button" onClick={send} disabled={!draft.trim()}>
          <Send aria-hidden="true" />
          Envoyer
        </Button>
      </div>
    </div>
  );
};
