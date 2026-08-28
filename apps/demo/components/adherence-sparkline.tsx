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
import type { AdherencePoint } from "@/lib/mock/types";

/**
 * Geometry, in the SVG's own units. The chart is drawn at a fixed size rather
 * than stretched to its container: `preserveAspectRatio` scaling would thicken
 * the 2px line and turn the end dot into an ellipse, and a sparkline whose
 * marks change weight with the viewport is no longer the same chart.
 */
const WIDTH = 240;
const PLOT_TOP = 8;
const PLOT_BOTTOM = 48;
const LABEL_Y = 62;
const HEIGHT = 68;
const PAD_X = 8;

type Props = {
  points: AdherencePoint[];
  /** The week's average, as the figure the tile leads with. */
  average: number;
  /** Change in points against the previous week. */
  delta: number;
};

/**
 * A stat tile with a trend: the week's average adherence, its change, and the
 * seven daily values behind it.
 *
 * The scale is fixed 0–100 because the values are percentages — a sparkline
 * zoomed to its own min and max makes a flat week look dramatic, which is
 * exactly the lie this screen must not tell a patient about her own effort. One
 * series, so no legend: the label above says what is plotted. The exact numbers
 * live in the table for anyone reading with a screen reader, so nothing on the
 * chart is gated behind colour or hover.
 */
export const AdherenceSparkline = ({ points, average, delta }: Props) => {
  const plotWidth = WIDTH - PAD_X * 2;
  const plotHeight = PLOT_BOTTOM - PLOT_TOP;
  const x = (index: number) =>
    PAD_X + (index / (points.length - 1)) * plotWidth;
  const y = (value: number) => PLOT_TOP + (1 - value / 100) * plotHeight;

  const line = points
    .map((point, index) => `${x(index)},${y(point.value)}`)
    .join(" ");
  const area = `${PAD_X},${PLOT_BOTTOM} ${line} ${WIDTH - PAD_X},${PLOT_BOTTOM}`;
  const last = points[points.length - 1];
  const rising = delta >= 0;
  const TrendIcon = rising ? TrendingUp : TrendingDown;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <Typography as="h3" size="sm" tone="muted">
          Régularité de la semaine
        </Typography>
        <div className="flex flex-wrap items-baseline gap-3">
          <Typography as="span" size="3xl" weight="semibold">
            {average} %
          </Typography>
          <Badge variant={rising ? "success" : "warning"} tone="subtle">
            <TrendIcon aria-hidden="true" />
            {rising ? "+" : "−"}
            {Math.abs(delta)} pts vs semaine précédente
          </Badge>
        </div>
      </div>

      <svg
        aria-hidden="true"
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="max-w-full"
      >
        <polyline
          points={area}
          className="fill-success stroke-none"
          opacity={0.1}
        />
        <line
          x1={PAD_X}
          y1={PLOT_BOTTOM}
          x2={WIDTH - PAD_X}
          y2={PLOT_BOTTOM}
          className="stroke-border"
          strokeWidth={1}
        />
        <polyline
          points={line}
          className="stroke-success fill-none"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx={x(points.length - 1)}
          cy={y(last.value)}
          r={4}
          className="fill-success stroke-card"
          strokeWidth={2}
        />

        {points.map((point, index) => (
          <g key={point.day}>
            <text
              x={x(index)}
              y={LABEL_Y}
              textAnchor="middle"
              className="fill-muted-foreground text-[9px]"
            >
              {point.label}
            </text>
            <rect
              x={x(index) - plotWidth / (points.length - 1) / 2}
              y={0}
              width={plotWidth / (points.length - 1)}
              height={HEIGHT}
              fill="transparent"
            >
              {/* One interpolated child: React treats `title` as a metadata tag
                  and mismatches on hydration when it receives several. */}
              <title>{`${point.day} · ${point.value} % du plan appliqué`}</title>
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
            Part du plan appliquée chaque jour de la semaine.
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Jour</TableHead>
              <TableHead>Plan appliqué</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {points.map((point) => (
              <TableRow key={point.day}>
                <TableCell>{point.day}</TableCell>
                <TableCell>{point.value} %</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </details>
    </div>
  );
};
