import { Typography } from "@remi/ui/server";

type Props = {
  /** The edition in the database, when one has been imported. */
  edition?: string;
};

/**
 * The attribution the licence requires.
 *
 * CIQUAL is published under the Licence Ouverte 2.0 (Etalab), which grants
 * reuse and redistribution on one condition: the source is named. So it is
 * named on every surface that shows one of its numbers, not once in a footer
 * somebody removes. The full terms are in
 * `packages/services/src/db/fixtures/LICENCE.md`.
 */
export const CiqualAttribution = ({ edition }: Props) => (
  <Typography as="p" size="xs" tone="muted">
    Source : {edition ?? "Table Ciqual"}, ANSES — Observatoire des Aliments,{" "}
    <a
      href="https://doi.org/10.57745/RDMHWY"
      className="underline"
      rel="noreferrer"
      target="_blank"
    >
      doi.org/10.57745/RDMHWY
    </a>{" "}
    — Licence Ouverte 2.0 (Etalab). Valeurs pour 100 g.
  </Typography>
);
