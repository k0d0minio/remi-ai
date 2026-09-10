"use client";

import { useState } from "react";
import { Typography } from "@remi/ui/server";
import type { PatientSummary } from "@remi/services/shared";

type Props = {
  summary: PatientSummary | null;
};

const EMPTY_PROMPT =
  "Aucun résumé pour le moment — écrivez-le dans la section Résumé vivant.";

/**
 * The living summary's head — § C's first paragraph, the thing Morgane re-reads
 * first. A trigger reveals the rest inline (client island, no navigation). When
 * there is no summary yet, a prompt to write one appears in its place.
 */
export const SummaryHead = ({ summary }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const body = summary?.body ?? "";
  const paragraphs = body.split(/\n\s*\n/).filter((part) => part.trim() !== "");
  const first = paragraphs[0];

  if (!first) {
    return (
      <Typography size="sm" tone="muted">
        {EMPTY_PROMPT}
      </Typography>
    );
  }

  const hasMore = paragraphs.length > 1;

  return (
    <div className="flex flex-col gap-2">
      <Typography size="sm" className="whitespace-pre-line">
        {expanded ? body : first}
      </Typography>
      {hasMore ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="text-primary focus-visible:ring-ring/40 w-fit rounded-sm text-sm font-medium transition-colors hover:underline focus-visible:outline-none focus-visible:ring-[3px]"
        >
          {expanded ? "Masquer le résumé complet" : "Voir le résumé complet"}
        </button>
      ) : null}
    </div>
  );
};
