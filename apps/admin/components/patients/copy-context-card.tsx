"use client";

import { useState } from "react";
// `/shared`, not `/ai`: the assembler is isomorphic and the text re-renders
// here as she edits, while `/ai` carries the provider seam and runs on Node.
import {
  DEFAULT_CONTEXT_PREAMBLE,
  contextBlocks,
  defaultContextBlocks,
  patientContextText,
  type ContextBlock,
  type PatientContextInput,
} from "@remi/services/shared";
import { Checkbox, CopyButton } from "@remi/ui";
import { Field, Textarea, Typography } from "@remi/ui/server";
import { recordContextExportAction } from "@/lib/patients/actions";

type Props = {
  patientId: string;
  /** Built server-side by `patientContextInput` — pseudonymous by its type. */
  context: PatientContextInput;
};

/** The blocks as Morgane reads them, in the order the text renders them. */
const blockLabels: Record<ContextBlock, string> = {
  profil: "Profil",
  objectifs: "Objectifs",
  consigne: "Consigne",
  recommandations: "Recommandations",
  complements: "Compléments",
  essentiels: "Essentiels",
  resume: "Résumé",
};

/**
 * « Copier le contexte » — the patient's context as a prompt, in one gesture.
 *
 * Morgane already generates recipes by pasting a hand-typed profile into a
 * model; this is that paste, assembled from the record and pseudonymous. The
 * assembling is `@remi/services`' pure function, reused verbatim by every
 * `ai-assist` prompt later, so this component only holds what is genuinely
 * interface: the preamble she edits, the blocks she includes, and the copy.
 *
 * The textarea is not a nicety. `navigator.clipboard.writeText` needs a user
 * gesture and a secure context, so the text has to be selectable by hand when
 * the write is refused — which is also why the audit line is written from the
 * button's `onCopied` rather than from its click.
 *
 * Neither the preamble nor the block choice is persisted: the stub forbids a
 * table, and browser storage would keep state the trail cannot see. Every page
 * load starts from the default.
 */
export const CopyContextCard = ({ patientId, context }: Props) => {
  const [preamble, setPreamble] = useState(DEFAULT_CONTEXT_PREAMBLE);
  const [blocks, setBlocks] = useState(defaultContextBlocks);

  const text = patientContextText(context, { preamble, blocks });
  const included = contextBlocks.filter((block) => blocks[block]);

  const toggle = (block: ContextBlock, on: boolean) => {
    setBlocks((current) => ({ ...current, [block]: on }));
  };

  // A failure to record must never look like a failure to copy: the text is on
  // her clipboard by the time this runs.
  const recordExport = () => {
    void recordContextExportAction(patientId, included).catch(() => {});
  };

  return (
    <div className="flex flex-col gap-4">
      <Field
        id="context-preamble"
        label="Préambule"
        hint="Vos mots, modifiables avant de copier. Ils ne sont pas enregistrés : le préambule par défaut revient au rechargement."
      >
        <Textarea
          id="context-preamble"
          value={preamble}
          rows={3}
          onChange={(event) => setPreamble(event.target.value)}
        />
      </Field>

      <fieldset className="flex flex-col gap-2">
        <Typography as="legend" size="sm" weight="medium">
          Blocs inclus
        </Typography>
        <Typography size="sm" tone="muted">
          Le protocole est coché par défaut ; le résumé ne l&apos;est pas.
        </Typography>
        <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1">
          {contextBlocks.map((block) => (
            <div key={block} className="flex items-center gap-2">
              <Checkbox
                id={`context-block-${block}`}
                checked={blocks[block]}
                onCheckedChange={(checked) => toggle(block, checked === true)}
              />
              <label
                htmlFor={`context-block-${block}`}
                className="text-sm leading-none"
              >
                {blockLabels[block]}
              </label>
            </div>
          ))}
        </div>
      </fieldset>

      <Field
        id="context-text"
        label="Texte à coller"
        hint="Sélectionnable à la main si la copie est refusée par le navigateur."
      >
        <Textarea
          id="context-text"
          value={text}
          readOnly
          rows={12}
          className="font-mono text-xs"
        />
      </Field>

      <div className="flex flex-wrap items-center gap-2">
        <CopyButton
          value={text}
          label="Copier le contexte"
          copiedLabel="Copié"
          variant="primary"
          onCopied={recordExport}
        />
      </div>

      <Typography size="xs" tone="muted">
        Le texte ne contient que le pseudonyme — jamais le nom, l&apos;email ni
        le lien patient. Chaque copie est inscrite au journal des actions.
      </Typography>
    </div>
  );
};
