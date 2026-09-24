"use client";

import { Eye } from "lucide-react";
import NextLink from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@remi/ui";
import type { PatientSegment } from "@/components/patients/vocabulary";
import { scrollTo } from "@/components/patients/patient-navigation";

type Action = {
  label: string;
  /** The section the action lands on — always rendered, whatever the data. */
  targetId: string;
  segment: PatientSegment;
};

const ACTIONS: readonly Action[] = [
  {
    label: "Ajouter une recommandation",
    targetId: "recommendations",
    segment: "suivi",
  },
  { label: "Proposer une recette", targetId: "recipes", segment: "dossier" },
  { label: "Ajouter un retour repas", targetId: "meals", segment: "journal" },
  { label: "Copier le contexte", targetId: "copy-context", segment: "suivi" },
];

type Props = {
  patientId: string;
  /** The patient's own link, marked as her preview — built server-side. */
  previewUrl: string;
};

/**
 * The working view's quick actions — five, plus « Voir comme la patiente »
 * (her 14 Sept § 7), which opens the patient's own link in a new tab: the page
 * they see, from their token, without recording it as their visit.
 *
 * « Nouvelle consultation » is the one that leaves the page: it opens the
 * write-up screen, where the note, the check-ins, the consigne, the résumé and
 * the preparation note are one form and one save. The other four land on their
 * section's add form; when that section lives in another phone segment, they
 * switch the segment first (same mechanism as the segmented control — the URL
 * and the root's data-segment) and scroll once it is back in the layout.
 */
export const QuickActions = ({ patientId, previewUrl }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const go = (action: Action) => {
    const current =
      document.getElementById("patient-page")?.getAttribute("data-segment") ??
      "suivi";
    if (current !== action.segment) {
      document
        .getElementById("patient-page")
        ?.setAttribute("data-segment", action.segment);
      // Every other param is kept — `from=consultation` above all, which is
      // what puts the way back on the page.
      const params = new URLSearchParams(searchParams);
      params.set("segment", action.segment);
      router.replace(`${pathname}?${params}`);
      window.setTimeout(() => scrollTo(action.targetId), 60);
    } else {
      scrollTo(action.targetId);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" asChild>
        <NextLink href={`/patients/${patientId}/consultation`}>
          Nouvelle consultation
        </NextLink>
      </Button>
      {ACTIONS.map((action) => (
        <Button
          key={action.targetId}
          type="button"
          size="sm"
          onClick={() => go(action)}
        >
          {action.label}
        </Button>
      ))}
      <Button size="sm" variant="outline" asChild>
        <a href={previewUrl} target="_blank" rel="noopener noreferrer">
          <Eye aria-hidden="true" />
          Voir comme la patiente
        </a>
      </Button>
    </div>
  );
};
