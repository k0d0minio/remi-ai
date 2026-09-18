"use client";

import { Plus } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useState, useTransition } from "react";
import { recommendationCategories } from "@remi/services/shared";
import type {
  PatientRecommendation,
  ProtocolRow,
  RecommendationCategory,
} from "@remi/services/shared";
import { Button } from "@remi/ui";
import { Field, Input, Textarea, Typography } from "@remi/ui/server";
import { saveRecommendationSectionAction } from "@/lib/patients/actions";
import { CopyFromPatient } from "@/components/patients/copy-from-patient";
import { SectionEditFrame } from "@/components/patients/section-edit-frame";
import { SectionRowControls } from "@/components/patients/section-row-controls";
import { TemplateControls } from "@/components/patients/template-controls";
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

/**
 * A reused row arrives with no id — a new row in *this* protocol, not a pointer
 * at the one it came from. The category travels with the title because it is
 * what decides which block the row lands in; an unrecognised one falls back to
 * nutrition rather than creating a block nothing else knows about.
 */
const fromReused = (row: ProtocolRow): Row => ({
  id: "",
  category: asCategory(row.category ?? ""),
  title: row.title ?? "",
  detail: row.detail ?? "",
});

const asCategory = (value: string): RecommendationCategory =>
  (recommendationCategories as readonly string[]).includes(value)
    ? (value as RecommendationCategory)
    : "nutrition";

// `some` rather than `includes`: the addable list is narrowed to the four
// categories it offers, so `includes` refuses the wider argument this is asked
// about — `supplement` being exactly the case that has to be answerable.
const isAddable = (category: RecommendationCategory) =>
  addableRecommendationCategories.some((addable) => addable === category);

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
  // The ids on screen when edit mode opened. A row that appears after that
  // — the quick-add form, another operator — is not this save's to archive.
  const [seeded, setSeeded] = useState<readonly string[]>([]);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  /**
   * The save closes the editor, and it does so here rather than in an effect
   * watching the result: the page revalidates behind this, so what the read
   * view shows on the way back is already the section she just wrote.
   */
  const save = (formData: FormData) => {
    startTransition(async () => {
      const result = await saveRecommendationSectionAction(formData);
      setError(result.error);
      if (result.saved) {
        setEditing(false);
      }
    });
  };
  const { rows, addRows, removeRow, swapRows, setField, reset } =
    useSectionRows<Row>(recommendations.map(toRow), () => ({
      id: "",
      category: "nutrition",
      title: "",
      detail: "",
    }));

  const open = useCallback(() => {
    reset(recommendations.map(toRow));
    setSeeded(recommendations.map((row) => row.id));
    setError(null);
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
      error={error}
      patientId={patientId}
      pseudonym={pseudonym}
      action={save}
      editLabel="Modifier les recommandations"
      readView={children}
      footer={
        <div className="flex flex-col gap-3">
          <CopyFromPatient
            patientId={patientId}
            kind="recommendation"
            emptyLabel="aucune recommandation en cours"
            onTaken={(taken) => addRows(taken.rows.map(fromReused))}
          />

          <TemplateControls
            kind="recommendation"
            currentRows={rows.map((row) => ({
              category: row.category,
              title: row.title,
              detail: row.detail,
            }))}
            onInsert={(inserted) => addRows(inserted.map(fromReused))}
          />
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {seeded.map((id) => (
          <input key={id} type="hidden" name="seeded-id" value={id} />
        ))}

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
