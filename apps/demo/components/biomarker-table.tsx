import { CircleCheck, Minus, TriangleAlert } from "lucide-react";
import type { ComponentType } from "react";
import {
  Badge,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Typography,
} from "@remi/ui/server";
import { TrendLine } from "@/components/trend-line";
import type {
  Biomarker,
  BiomarkerReading,
  BiomarkerStatus,
  Intent,
  LabPanel,
} from "@/lib/mock/types";

/** French figures — "5,4", not "5.4". The demo has no i18n layer to route it. */
const decimal = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });

const statusLabels: Record<BiomarkerStatus, string> = {
  "in-range": "Dans l'intervalle",
  below: "Sous l'intervalle",
  above: "Au-dessus de l'intervalle",
};

const statusVariant: Record<
  BiomarkerStatus,
  Extract<Intent, "success" | "warning">
> = {
  "in-range": "success",
  below: "warning",
  above: "warning",
};

const readingLabels: Record<BiomarkerReading, string> = {
  improving: "En amélioration",
  stable: "Stable",
  worsening: "En dégradation",
};

/**
 * The icon says whether it is good news, never which way the line went — CRP
 * falling and vitamine D rising are both improvements, and an arrow would
 * contradict one of them.
 */
const readingIcons: Record<
  BiomarkerReading,
  ComponentType<{ className?: string }>
> = {
  improving: CircleCheck,
  stable: Minus,
  worsening: TriangleAlert,
};

const readingTones: Record<
  BiomarkerReading,
  Extract<Intent, "success" | "warning" | "neutral">
> = {
  improving: "success",
  stable: "neutral",
  worsening: "warning",
};

type Props = {
  panels: LabPanel[];
  biomarkers: Biomarker[];
};

/**
 * The panel, read as a series rather than as a snapshot: three dated columns,
 * the reference the laboratory printed, where the latest value sits against it,
 * and which way the marker is going.
 *
 * Status and évolution are two columns because they are two questions. Ferritine
 * is under its range *and* climbing; glycémie is barely over *and* getting
 * worse. Collapsing those into one badge would tell the practitioner the
 * opposite of what the panel says.
 *
 * The small line is scaled to its own series and carries no value — the three
 * numbers are right there in the row. It shows shape, and the words next to it
 * say what that shape means.
 */
export const BiomarkerTable = ({ panels, biomarkers }: Props) => (
  <Table>
    <TableCaption>
      Trois prélèvements, du plus ancien au plus récent. Les valeurs et les
      intervalles sont ceux du laboratoire ; la lecture est celle du praticien.
    </TableCaption>
    <TableHeader>
      <TableRow>
        <TableHead>Marqueur</TableHead>
        {panels.map((panel, index) => (
          <TableHead
            key={panel.id}
            className={
              index === panels.length - 1 ? "text-foreground" : undefined
            }
          >
            {panel.label}
          </TableHead>
        ))}
        <TableHead>Intervalle</TableHead>
        <TableHead>Statut</TableHead>
        <TableHead>Évolution</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {biomarkers.map((biomarker) => {
        const ReadingIcon = readingIcons[biomarker.reading];
        const points = biomarker.values.map((value, index) => ({
          label: panels[index].date,
          value,
        }));

        return (
          <TableRow key={biomarker.id}>
            <TableCell>
              <div className="flex flex-col">
                <Typography as="span" size="sm" weight="medium">
                  {biomarker.name}
                </Typography>
                {biomarker.unit ? (
                  <Typography as="span" size="xs" tone="muted">
                    {biomarker.unit}
                  </Typography>
                ) : null}
              </div>
            </TableCell>

            {biomarker.values.map((value, index) => {
              const latest = index === biomarker.values.length - 1;

              return (
                <TableCell
                  key={panels[index].id}
                  className={
                    latest
                      ? "font-medium tabular-nums"
                      : "text-muted-foreground tabular-nums"
                  }
                >
                  {decimal.format(value)}
                </TableCell>
              );
            })}

            <TableCell className="text-muted-foreground whitespace-nowrap tabular-nums">
              {biomarker.range}
            </TableCell>

            <TableCell>
              <Badge
                variant={statusVariant[biomarker.status]}
                tone="subtle"
                size="sm"
              >
                {statusLabels[biomarker.status]}
              </Badge>
            </TableCell>

            <TableCell>
              <div className="flex flex-col gap-1">
                <TrendLine
                  points={points}
                  tone={readingTones[biomarker.reading]}
                />
                <Typography
                  as="span"
                  size="xs"
                  tone="muted"
                  className="flex items-center gap-1 whitespace-nowrap"
                >
                  <ReadingIcon className="size-3" />
                  {readingLabels[biomarker.reading]}
                </Typography>
              </div>
            </TableCell>
          </TableRow>
        );
      })}
    </TableBody>
  </Table>
);
