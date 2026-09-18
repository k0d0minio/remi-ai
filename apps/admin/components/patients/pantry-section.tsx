"use client";

import { Plus } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useState, useTransition } from "react";
import type { PantryEssential, ProtocolRow } from "@remi/services/shared";
import { Button } from "@remi/ui";
import { Field, Input, Textarea, Typography } from "@remi/ui/server";
import { savePantrySectionAction } from "@/lib/patients/actions";
import { CopyFromPatient } from "@/components/patients/copy-from-patient";
import { SectionEditFrame } from "@/components/patients/section-edit-frame";
import { SectionRowControls } from "@/components/patients/section-row-controls";
import { TemplateControls } from "@/components/patients/template-controls";
import { useSectionRows } from "@/components/patients/use-section-rows";

type Row = { id: string; item: string; why: string };

type Props = {
  patientId: string;
  pseudonym: string;
  essentials: readonly PantryEssential[];
  /** The read view, rendered by the server until edit mode opens. */
  children: ReactNode;
};

const blankRow = (): Row => ({ id: "", item: "", why: "" });

const toRow = (essential: PantryEssential): Row => ({
  id: essential.id,
  item: essential.item,
  why: essential.why,
});

/**
 * A reused row arrives with no id — it is a new row on *this* list, not a
 * pointer at the row it was copied from. A copy is a copy: changing the source
 * later changes nothing here.
 */
const fromReused = (row: ProtocolRow): Row => ({
  id: "",
  item: row.item ?? "",
  why: row.why ?? "",
});

/**
 * The placard/frigo list, edited whole — § 5's "plusieurs essentiels, pas un à
 * un" and the one section she pastes into.
 *
 * The paste box is a deliberate line split and nothing more: one line becomes
 * one item, with the "pourquoi" left blank for her to fill in or leave. Reading
 * a dose or a quantity out of that text is `ai-assist/free-text-to-rows`, which
 * is P2 by decision #8 — a parser invented here would be the thing that
 * decision exists to prevent.
 */
export const PantrySection = ({
  patientId,
  pseudonym,
  essentials,
  children,
}: Props) => {
  const [editing, setEditing] = useState(false);
  // The ids on screen when edit mode opened. A row that appears after that
  // — the quick-add form, another operator — is not this save's to archive.
  const [seeded, setSeeded] = useState<readonly string[]>([]);
  const [pasted, setPasted] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  /**
   * The save closes the editor, and it does so here rather than in an effect
   * watching the result: the page revalidates behind this, so what the read
   * view shows on the way back is already the section she just wrote.
   */
  const save = (formData: FormData) => {
    startTransition(async () => {
      const result = await savePantrySectionAction(formData);
      setError(result.error);
      if (result.saved) {
        setEditing(false);
      }
    });
  };
  const { rows, addRow, addRows, removeRow, moveRow, setField, reset } =
    useSectionRows<Row>(essentials.map(toRow), blankRow);

  const open = useCallback(() => {
    // Re-seed from the current props rather than from whatever the last
    // editing session left behind: these are the rows in force right now.
    reset(essentials.map(toRow));
    setSeeded(essentials.map((row) => row.id));
    setError(null);
    setPasted("");
    setEditing(true);
  }, [essentials, reset]);

  const appendPasted = useCallback(() => {
    const items = pasted
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => ({ id: "", item: line, why: "" }));
    if (items.length === 0) {
      return;
    }
    addRows(items);
    setPasted("");
  }, [addRows, pasted]);

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
      editLabel="Modifier la liste"
      readView={children}
      footer={
        <div className="flex flex-col gap-3">
          <CopyFromPatient
            patientId={patientId}
            kind="pantry"
            emptyLabel="aucun essentiel en cours"
            onTaken={(taken) => addRows(taken.rows.map(fromReused))}
          />

          <TemplateControls
            kind="pantry"
            currentRows={rows.map((row) => ({ item: row.item, why: row.why }))}
            onInsert={(inserted) => addRows(inserted.map(fromReused))}
          />

          <details className="border-border rounded-md border p-3">
            <summary className="text-muted-foreground hover:text-foreground cursor-pointer text-sm">
              Coller une liste
            </summary>
            <div className="flex flex-col gap-3 pt-3">
              <Field
                id="pantry-paste"
                label="Un aliment par ligne"
                hint="Chaque ligne devient une ligne de la liste. Le pourquoi reste à compléter."
              >
                <Textarea
                  id="pantry-paste"
                  rows={4}
                  value={pasted}
                  onChange={(event) => setPasted(event.target.value)}
                />
              </Field>
              <div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={appendPasted}
                  disabled={pasted.trim().length === 0}
                >
                  <Plus aria-hidden="true" />
                  Ajouter ces lignes
                </Button>
              </div>
            </div>
          </details>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        {seeded.map((id) => (
          <input key={id} type="hidden" name="seeded-id" value={id} />
        ))}

        {rows.length === 0 ? (
          <Typography size="sm" tone="muted">
            La liste est vide. Ajoutez une ligne, ou collez-en plusieurs.
          </Typography>
        ) : null}

        {rows.map((row, index) => (
          <div
            key={row.key}
            className="border-border flex flex-col gap-2 border-b pb-3 last:border-b-0"
          >
            <input type="hidden" name="row-id" value={row.id} />

            <div className="flex items-end gap-2">
              <Field id={`${row.key}-item`} label="Aliment" className="flex-1">
                <Input
                  id={`${row.key}-item`}
                  name="row-item"
                  value={row.item}
                  onChange={(event) =>
                    setField(row.key, "item", event.target.value)
                  }
                  placeholder="ex. Sardines"
                />
              </Field>
              <SectionRowControls
                rowLabel={row.item || `la ligne ${index + 1}`}
                canMoveUp={index > 0}
                canMoveDown={index < rows.length - 1}
                onMoveUp={() => moveRow(row.key, "up")}
                onMoveDown={() => moveRow(row.key, "down")}
                onRemove={() => removeRow(row.key)}
              />
            </div>

            <details>
              <summary className="text-muted-foreground hover:text-foreground cursor-pointer text-sm">
                Pourquoi
              </summary>
              <div className="pt-2">
                <Input
                  aria-label={`Pourquoi ${row.item || `la ligne ${index + 1}`}`}
                  name="row-why"
                  value={row.why}
                  onChange={(event) =>
                    setField(row.key, "why", event.target.value)
                  }
                  placeholder="ex. oméga-3"
                />
              </div>
            </details>
          </div>
        ))}

        <div>
          <Button type="button" variant="outline" size="sm" onClick={addRow}>
            <Plus aria-hidden="true" />
            Ajouter une ligne
          </Button>
        </div>
      </div>
    </SectionEditFrame>
  );
};
