"use client";

import { usePathname, useRouter } from "next/navigation";
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
    label: "Nouvelle consultation",
    targetId: "consultations",
    segment: "dossier",
  },
  {
    label: "Ajouter une recommandation",
    targetId: "recommendations",
    segment: "suivi",
  },
  { label: "Proposer une recette", targetId: "recipes", segment: "dossier" },
  { label: "Ajouter un retour repas", targetId: "meals", segment: "journal" },
];

/**
 * The working view's four quick actions. Each lands on its section's add form;
 * when that section lives in another phone segment, it switches the segment
 * first (same mechanism as the segmented control — the URL and the root's
 * data-segment) and scrolls once the section is back in the layout.
 */
export const QuickActions = () => {
  const router = useRouter();
  const pathname = usePathname();

  const go = (action: Action) => {
    const current =
      document.getElementById("patient-page")?.getAttribute("data-segment") ??
      "suivi";
    if (current !== action.segment) {
      document
        .getElementById("patient-page")
        ?.setAttribute("data-segment", action.segment);
      router.replace(`${pathname}?segment=${action.segment}`);
      window.setTimeout(() => scrollTo(action.targetId), 60);
    } else {
      scrollTo(action.targetId);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
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
    </div>
  );
};
