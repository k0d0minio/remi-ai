import type {
  MandatoryQuestionnaireField,
  OptionalQuestionnaireField,
} from "@remi/services/shared";
import {
  mandatoryQuestionnaireFieldLabels,
  optionalQuestionnaireFieldLabels,
} from "@remi/services/shared";
import { Typography } from "@remi/ui/server";

type FieldKey = MandatoryQuestionnaireField | OptionalQuestionnaireField;

/** The anchor of the block. The patient list links to it. */
export const MISSING_INFORMATION_ANCHOR = "missing-information";

/** The anchor of one field in « Dossier patient »: `#field-<key>`. */
export const fieldAnchor = (key: string) => `field-${key}`;

type Props = {
  mandatory: readonly MandatoryQuestionnaireField[];
  optional: readonly OptionalQuestionnaireField[];
};

/**
 * « Informations manquantes »: the empty fields, mandatory apart from optional
 * (story 6, criterion 3). Each item jumps to its field in « Dossier patient ».
 */
export const MissingInformation = ({ mandatory, optional }: Props) => (
  <div
    role="group"
    aria-labelledby={MISSING_INFORMATION_ANCHOR}
    className="border-border flex flex-col gap-3 rounded-md border p-4"
  >
    <Typography
      as="h3"
      id={MISSING_INFORMATION_ANCHOR}
      size="sm"
      weight="semibold"
      className="scroll-mt-60"
    >
      Informations manquantes
    </Typography>
    <MissingList
      title="Obligatoires"
      items={mandatory.map((key) => ({
        key,
        label: mandatoryQuestionnaireFieldLabels[key].fr,
      }))}
    />
    <MissingList
      title="Facultatives"
      items={optional.map((key) => ({
        key,
        label: optionalQuestionnaireFieldLabels[key].fr,
      }))}
    />
  </div>
);

type MissingListProps = {
  title: string;
  items: readonly { key: FieldKey; label: string }[];
};

const MissingList = ({ title, items }: MissingListProps) => (
  <div className="flex flex-col gap-1">
    <Typography size="xs" tone="muted">
      {`${title} · ${items.length}`}
    </Typography>
    {items.length === 0 ? (
      <Typography size="sm">Rien ne manque.</Typography>
    ) : (
      <ul className="flex flex-wrap gap-x-3 gap-y-1">
        {items.map((item) => (
          <li key={item.key}>
            <a
              href={`#${fieldAnchor(item.key)}`}
              className="text-sm underline underline-offset-2 max-sm:inline-flex max-sm:min-h-11 max-sm:items-center"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    )}
  </div>
);
