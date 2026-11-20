import type { ComponentProps } from "react";
import { Typography } from "@remi/ui/server";
import { MealAddForm } from "@/components/patients/meal-add-form";
import { MealJournal } from "@/components/patients/meal-journal";
import { SectionFold } from "@/components/patients/section-fold";

type Entries = ComponentProps<typeof MealJournal>["entries"];

type Props = {
  patientId: string;
  entries: Entries;
  archived: Entries;
  /** The meals that wait for the practitioner's feedback. */
  awaitingFeedback: number;
  today: string;
};

/** « 1 repas attend un retour. » — also the one line of the folded row. */
export const mealsAwaitingLabel = (count: number) =>
  count === 1
    ? "1 repas attend un retour."
    : `${count} repas attendent un retour.`;

/** « Journal des repas »: the entries, the add form, then the archived ones. */
export const MealsSection = ({
  patientId,
  entries,
  archived,
  awaitingFeedback,
  today,
}: Props) => (
  <>
    {awaitingFeedback > 0 ? (
      <Typography size="sm" tone="muted">
        {mealsAwaitingLabel(awaitingFeedback)}
      </Typography>
    ) : null}

    {entries.length === 0 ? (
      <Typography size="sm" tone="muted">
        Aucun repas noté pour le moment.
      </Typography>
    ) : (
      <MealJournal entries={entries} />
    )}

    <MealAddForm patientId={patientId} today={today} />

    {archived.length > 0 ? (
      <SectionFold
        id="archived-meals"
        label="Repas archivés"
        count={archived.length}
      >
        <MealJournal entries={archived} />
      </SectionFold>
    ) : null}
  </>
);
