"use client";

import { Plus } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useState, useTransition } from "react";
import type { PatientSupplement, ProtocolRow } from "@remi/services/shared";
import { Button } from "@remi/ui";
import { Field, Input, Textarea, Typography } from "@remi/ui/server";
import { saveSupplementSectionAction } from "@/lib/patients/actions";
import { CopyFromPatient } from "@/components/patients/copy-from-patient";
import { SectionEditFrame } from "@/components/patients/section-edit-frame";
import { SectionRowControls } from "@/components/patients/section-row-controls";
import { TemplateControls } from "@/components/patients/template-controls";
import { useSectionRows } from "@/components/patients/use-section-rows";

type Row = {
  id: string;
  name: string;
  dose: string;
  timing: string;
  reason: string;
};

type Props = {
  patientId: string;
  pseudonym: string;
  supplements: readonly PatientSupplement[];
  /** The read view, rendered by the server until edit mode opens. */
  children: ReactNode;
};

const blankRow = (): Row => ({
  id: "",
  name: "",
  dose: "",
  timing: "",
  reason: "",
});

const toRow = (supplement: PatientSupplement): Row => ({
  id: supplement.id,
  name: supplement.name,
  dose: supplement.dose,
  timing: supplement.timing,
  reason: supplement.reason,
});

/**
 * A reused row arrives with no id — a new row on *this* protocol, not a pointer
 * at the one it came from. Dose and moment travel because they are facts about
 * the supplement; the raison does not, because § G's justification was written
 * for one person.
 */
const fromReused = (row: ProtocolRow): Row => ({
  id: "",
  name: row.name ?? "",
  dose: row.dose ?? "",
  timing: row.timing ?? "",
  reason: row.reason ?? "",
});

/**
 * The prescribed protocol, edited whole — § G's four columns with every row on
 * screen at once, which is what § 5 asks for.
 *
 * Nom and dose stay visible because they are what she always writes; moment and
 * raison fold, per § 5 bullet 7, so the base act is a name, a dose and a tab.
 * The fields inside a closed fold still submit — a `<details>` hides them, it
 * does not take them out of the form.
 */
export const SupplementSection = ({
  patientId,
  pseudonym,
  supplements,
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
      const result = await saveSupplementSectionAction(formData);
      setError(result.error);
      if (result.saved) {
        setEditing(false);
      }
    });
  };
  const { rows, addRow, addRows, removeRow, moveRow, setField, reset } =
    useSectionRows<Row>(supplements.map(toRow), blankRow);

  const open = useCallback(() => {
    reset(supplements.map(toRow));
    setSeeded(supplements.map((row) => row.id));
    setError(null);
    setEditing(true);
  }, [reset, supplements]);

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
      editLabel="Modifier le protocole"
      readView={children}
      footer={
        <div className="flex flex-col gap-3">
          <CopyFromPatient
            patientId={patientId}
            kind="supplement"
            emptyLabel="aucun complément en cours"
            onTaken={(taken) => addRows(taken.rows.map(fromReused))}
          />

          <TemplateControls
            kind="supplement"
            currentRows={rows.map((row) => ({
              name: row.name,
              dose: row.dose,
              timing: row.timing,
              reason: row.reason,
            }))}
            onInsert={(inserted) => addRows(inserted.map(fromReused))}
          />
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        {seeded.map((id) => (
          <input key={id} type="hidden" name="seeded-id" value={id} />
        ))}

        {rows.length === 0 ? (
          <Typography size="sm" tone="muted">
            Aucun complément. Ajoutez une ligne.
          </Typography>
        ) : null}

        {rows.map((row, index) => (
          <div
            key={row.key}
            className="border-border flex flex-col gap-2 border-b pb-3 last:border-b-0"
          >
            <input type="hidden" name="row-id" value={row.id} />

            <div className="flex flex-wrap items-end gap-2">
              <Field
                id={`${row.key}-name`}
                label="Complément"
                className="min-w-48 flex-1"
              >
                <Input
                  id={`${row.key}-name`}
                  name="row-name"
                  value={row.name}
                  onChange={(event) =>
                    setField(row.key, "name", event.target.value)
                  }
                  placeholder="ex. Magnésium bisglycinate"
                />
              </Field>
              <Field
                id={`${row.key}-dose`}
                label="Dose"
                className="w-32 shrink-0"
              >
                <Input
                  id={`${row.key}-dose`}
                  name="row-dose"
                  value={row.dose}
                  onChange={(event) =>
                    setField(row.key, "dose", event.target.value)
                  }
                  placeholder="300 mg"
                />
              </Field>
              <SectionRowControls
                rowLabel={row.name || `la ligne ${index + 1}`}
                canMoveUp={index > 0}
                canMoveDown={index < rows.length - 1}
                onMoveUp={() => moveRow(row.key, "up")}
                onMoveDown={() => moveRow(row.key, "down")}
                onRemove={() => removeRow(row.key)}
              />
            </div>

            <details>
              <summary className="text-muted-foreground hover:text-foreground cursor-pointer text-sm">
                Moment et raison
              </summary>
              <div className="flex flex-col gap-3 pt-2">
                <Field id={`${row.key}-timing`} label="Moment">
                  <Input
                    id={`${row.key}-timing`}
                    name="row-timing"
                    value={row.timing}
                    onChange={(event) =>
                      setField(row.key, "timing", event.target.value)
                    }
                    placeholder="ex. le soir, au repas"
                  />
                </Field>
                <Field id={`${row.key}-reason`} label="Pourquoi">
                  <Textarea
                    id={`${row.key}-reason`}
                    name="row-reason"
                    rows={2}
                    value={row.reason}
                    onChange={(event) =>
                      setField(row.key, "reason", event.target.value)
                    }
                  />
                </Field>
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
