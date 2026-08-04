import { TrendingDown, TrendingUp } from "lucide-react";
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
import type { CohortWeek } from "@/lib/mock/types";

/**
 * Geometry, in the SVG's own units — the same fixed-size approach as
 * `adherence-sparkline.tsx`. The plot leaves a band at the bottom for the week
 * labels and a band at the top for the two direct labels, so nothing the chart
 * draws can be clipped by its own container.
 *
 * The width is set to what the card gives it on a desktop viewport, so the chart
 * renders at 1:1 there and only ever scales *down*, uniformly, on a narrow
 * screen. A viewBox wider than its column would shrink the type at every size.
 */
const WIDTH = 520;
const HEIGHT = 200;
const PLOT_LEFT = 44;
const PLOT_RIGHT = 500;
const PLOT_TOP = 26;
const PLOT_BOTTOM = 160;
const LABEL_Y = 182;
const TICKS = [0, 50, 100];

type Props = {
  weeks: CohortWeek[];
  /** The eight-week average, written out in `analytics.ts` rather than derived. */
  average: number;
  /** Change in points between the first week and the last. */
  delta: number;
};

/**
 * One series — the cohort's week — so there is no legend: the heading says what
 * is plotted, and a box with a single swatch would only restate it.
 *
 * The scale is fixed 0–100 because the values are percentages. A chart zoomed to
 * its own min and max would turn twenty-two points of progress into a cliff, and
 * a practitioner deciding whether their cohort is holding needs the real slope.
 * Only the first and last points are labelled: a number on all eight is noise,
 * and the rest are in the table underneath.
 */
export const CohortAdherenceChart = ({ weeks, average, delta }: Props) => {
  const rising = delta >= 0;
  const TrendIcon = rising ? TrendingUp : TrendingDown;
  const plotWidth = PLOT_RIGHT - PLOT_LEFT;
  const plotHeight = PLOT_BOTTOM - PLOT_TOP;
  const step = plotWidth / (weeks.length - 1);

  const x = (index: number) => PLOT_LEFT + index * step;
  const y = (value: number) => PLOT_TOP + (1 - value / 100) * plotHeight;

  const line = weeks
    .map((week, index) => `${x(index)},${y(week.adherence)}`)
    .join(" ");
  const area = `${PLOT_LEFT},${PLOT_BOTTOM} ${line} ${PLOT_RIGHT},${PLOT_BOTTOM}`;
  const first = weeks[0];
  const last = weeks[weeks.length - 1];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline gap-3">
        <Typography as="span" size="3xl" weight="semibold">
          {average} %
        </Typography>
        <Typography as="span" size="sm" tone="muted">
          du plan appliqué en moyenne
        </Typography>
        <Badge variant={rising ? "success" : "warning"} tone="subtle">
          <TrendIcon aria-hidden="true" />
          {rising ? "+" : "−"}
          {Math.abs(delta)} pts depuis le {first.label}
        </Badge>
      </div>

      <svg
        aria-hidden="true"
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto max-w-full"
      >
        {TICKS.map((tick) => (
          <g key={tick}>
            <line
              x1={PLOT_LEFT}
              y1={y(tick)}
              x2={PLOT_RIGHT}
              y2={y(tick)}
              className="stroke-border"
              strokeWidth={1}
            />
            <text
              x={PLOT_LEFT - 10}
              y={y(tick)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-muted-foreground text-[10px] tabular-nums"
            >
              {tick} %
            </text>
          </g>
        ))}

        <polyline
          points={area}
          className="fill-primary stroke-none"
          opacity={0.1}
        />
        <polyline
          points={line}
          className="stroke-primary fill-none"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx={x(weeks.length - 1)}
          cy={y(last.adherence)}
          r={4}
          className="fill-primary stroke-card"
          strokeWidth={2}
        />

        <text
          x={PLOT_LEFT}
          y={y(first.adherence) - 12}
          textAnchor="start"
          className="fill-muted-foreground text-[11px] tabular-nums"
        >
          {first.adherence} %
        </text>
        <text
          x={PLOT_RIGHT}
          y={y(last.adherence) - 14}
          textAnchor="end"
          className="fill-foreground text-[11px] font-medium tabular-nums"
        >
          {last.adherence} %
        </text>

        {weeks.map((week, index) => (
          <g key={week.id}>
            <text
              x={x(index)}
              y={LABEL_Y}
              textAnchor="middle"
              className="fill-muted-foreground text-[10px]"
            >
              {week.label}
            </text>
            <rect
              x={x(index) - step / 2}
              y={0}
              width={step}
              height={HEIGHT}
              fill="transparent"
            >
              {/* One interpolated child: React treats `title` as a metadata tag
                  and mismatches on hydration when it receives several. */}
              <title>{`${week.range} · ${week.adherence} % du plan appliqué`}</title>
            </rect>
          </g>
        ))}
      </svg>

      <details>
        <summary className="text-primary cursor-pointer text-sm">
          Voir les chiffres
        </summary>
        <Table className="mt-2">
          <TableCaption>
            Part du plan appliquée par la cohorte, semaine par semaine.
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Semaine</TableHead>
              <TableHead>Plan appliqué</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {weeks.map((week) => (
              <TableRow key={week.id}>
                <TableCell>{week.range}</TableCell>
                <TableCell className="tabular-nums">
                  {week.adherence} %
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </details>
    </div>
  );
};
