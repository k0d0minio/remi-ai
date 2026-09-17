"use client";

import { Plus } from "lucide-react";
import type { ReactNode } from "react";
import { useActionState, useCallback, useEffect, useState } from "react";
import { recommendationCategories } from "@remi/services/shared";
import type {
  PatientRecommendation,
  RecommendationCategory,
} from "@remi/services/shared";
import { Button } from "@remi/ui";
import { Field, Input, Textarea, Typography } from "@remi/ui/server";
import {
  saveRecommendationSectionAction,
  type SectionSaveState,
} from "@/lib/patients/actions";
import { SectionEditFrame } from "@/components/patients/section-edit-frame";
import { SectionRowControls } from "@/components/patients/section-row-controls";
import { useSectionRows } from "@/components/patients/use-section-rows";
import {
  addableRecommendationCategories,
  categoryLabels,
} from "@/components/patients/vocabulary";

type Row = {
  id: string;
  category: RecommendationCategory;
  title: string;
  detail: string;
};

const initial: SectionSaveState = { error: null, saved: false };

type Props = {
  patientId: string;
  pseudonym: string;
  recommendations: readonly PatientRecommendation[];
  /** The read view, rendered by the server until edit mode opens. */
  children: ReactNode;
};

const toRow = (recommendation: PatientRecommendation): Row => ({
  id: recommendation.id,
  category: recommendation.category,
  title: recommendation.title,
  detail: recommendation.detail,
});

const isAddable = (category: RecommendationCategory) =>
  addableRecommendationCategories.includes(category);

/**
 * The protocol, edited whole — one block per category, rows under each.
 *
 * A block rather than a category picker per row, because that is how a protocol
 * is written: she works through nutrition, then habits, then activity. It also
 * makes reordering unambiguous — rank is per category in the service, so a move
 * is always within the run it belongs to, and no row can be dragged into a
 * position that the read view would immediately undo.
 *
 * Moving a row between categories is deliberately not here: that is the
 * single-row edit form, which still exists. `supplement` is not offered for new
 * rows — supplements have their own table — but a block appears for it when the
 * patient still has rows stored under it, so an old entry stays editable
 * instead of being silently re-categorised by the first save.
 */
export const RecommendationSection = ({
  patientId,
  pseudonym,
  recommendations,
  children,
}: Props) => {
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState(
    saveRecommendationSectionAction,
    initial,
  );
  const { rows, addRows, removeRow, swapRows, setField, reset } =
    useSectionRows<Row>(recommendations.map(toRow), () => ({
      id: "",
      category: "nutrition",
      title: "",
      detail: "",
    }));

  useEffect(() => {
    if (state.saved) {
      setEditing(false);
    }
  }, [state]);

  const open = useCallback(() => {
    reset(recommendations.map(toRow));
    setEditing(true);
  }, [recommendations, reset]);

  // A block for every category she can add to, plus any category that still
  // holds rows — which is what keeps a retired one visible while it has content.
  const blocks = recommendationCategories.filter(
    (category) =>
      isAddable(category) || rows.some((row) => row.category === category),
  );

  return (
    <SectionEditFrame
      editing={editing}
      onEdit={open}
      onCancel={() => setEditing(false)}
      pending={pending}
      error={state.error}
      patientId={patientId}
      pseudonym={pseudonym}
      action={action}
      editLabel="Modifier les recommandations"
      readView={children}
    >
      <div className="flex flex-col gap-6">
        {blocks.map((category) => {
          const group = rows.filter((row) => row.category === category);

          return (
            <div key={category} className="flex flex-col gap-3">
              <Typography as="h3" variant="eyebrow" tone="muted">
                {categoryLabels[category]}
              </Typography>

              {group.length === 0 ? (
                <Typography size="sm" tone="muted">
                  Rien dans cette catégorie.
                </Typography>
              ) : null}

              {group.map((row, index) => (
                <div
                  key={row.key}
                  className="border-border flex flex-col gap-2 border-b pb-3 last:border-b-0"
                >
                  <input type="hidden" name="row-id" value={row.id} />
                  <input
                    type="hidden"
                    name="row-category"
                    value={row.category}
                  />

                  <div className="flex items-end gap-2">
                    <Field
                      id={`${row.key}-title`}
                      label="Recommandation"
                      className="flex-1"
                    >
                      <Input
                        id={`${row.key}-title`}
                        name="row-title"
                        value={row.title}
                        onChange={(event) =>
                          setField(row.key, "title", event.target.value)
                        }
                        placeholder="ex. Oméga-3 — 2 g par jour, au repas"
                      />
                    </Field>
                    <SectionRowControls
                      rowLabel={row.title || `la ligne ${index + 1}`}
                      canMoveUp={index > 0}
                      canMoveDown={index < group.length - 1}
                      onMoveUp={() => swapRows(row.key, group[index - 1].key)}
                      onMoveDown={() => swapRows(row.key, group[index + 1].key)}
                      onRemove={() => removeRow(row.key)}
                    />
                  </div>

                  <details>
                    <summary className="text-muted-foreground hover:text-foreground cursor-pointer text-sm">
                      Détail
                    </summary>
                    <div className="pt-2">
                      <Textarea
                        aria-label={`Détail de ${row.title || `la ligne ${index + 1}`}`}
                        name="row-detail"
                        rows={3}
                        value={row.detail}
                        onChange={(event) =>
                          setField(row.key, "detail", event.target.value)
                        }
                      />
                    </div>
                  </details>
                </div>
              ))}

              {isAddable(category) ? (
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      addRows([{ id: "", category, title: "", detail: "" }])
                    }
                  >
                    <Plus aria-hidden="true" />
                    {`Ajouter — ${categoryLabels[category].toLowerCase()}`}
                  </Button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </SectionEditFrame>
  );
};
