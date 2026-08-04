import { cn } from "@remi/ui/utils";
import type { Intent, TrendPoint } from "@/lib/mock/types";

type Tone = Extract<Intent, "success" | "warning" | "error" | "neutral">;

/**
 * Static class strings, not a template — Tailwind reads the source, so a
 * composed `stroke-${tone}` produces no CSS at all.
 */
const strokes: Record<Tone, string> = {
  success: "stroke-success",
  warning: "stroke-warning",
  error: "stroke-error",
  neutral: "stroke-muted-foreground",
};

const fills: Record<Tone, string> = {
  success: "fill-success",
  warning: "fill-warning",
  error: "fill-error",
  neutral: "fill-muted-foreground",
};

const sizes = {
  sm: { width: 76, height: 32 },
  md: { width: 148, height: 40 },
} as const;

const PAD = 6;

type Props = {
  points: TrendPoint[];
  tone: Tone;
  /**
   * A fixed scale, for values that already share one — percentages get
   * `[0, 100]`. Omitted, the line is scaled to its own series, which shows the
   * shape and says nothing about the size of the move.
   */
  domain?: [number, number];
  size?: keyof typeof sizes;
  className?: string;
};

/**
 * The shape of a series, at the size of a table cell: a 2px line and an end dot,
 * no axis and no grid.
 *
 * It is `aria-hidden` on purpose. A drawing this small cannot carry a value, so
 * every caller renders the reading as words and the numbers as text beside it —
 * the chart supplements them, it never gates them. The `<title>` per point is a
 * convenience for a mouse, never the only way to read a figure.
 */
export const TrendLine = ({
  points,
  tone,
  domain,
  size = "sm",
  className,
}: Props) => {
  const { width, height } = sizes[size];
  const values = points.map((point) => point.value);
  const [low, high] = domain ?? [Math.min(...values), Math.max(...values)];
  const span = high - low;

  const x = (index: number) =>
    PAD + (index / (points.length - 1)) * (width - PAD * 2);
  /** A flat series has no span to divide by; it sits on the middle line. */
  const y = (value: number) =>
    span === 0
      ? height / 2
      : PAD + (1 - (value - low) / span) * (height - PAD * 2);

  const line = points
    .map((point, index) => `${x(index)},${y(point.value)}`)
    .join(" ");
  const last = points[points.length - 1];
  const step = (width - PAD * 2) / (points.length - 1);

  return (
    <svg
      aria-hidden="true"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("shrink-0", className)}
    >
      <polyline
        points={line}
        className={cn("fill-none", strokes[tone])}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={x(points.length - 1)}
        cy={y(last.value)}
        r={4}
        className={cn("stroke-card", fills[tone])}
        strokeWidth={2}
      />
      {points.map((point, index) => (
        <rect
          key={point.label}
          x={x(index) - step / 2}
          y={0}
          width={step}
          height={height}
          fill="transparent"
        >
          {/* One interpolated child: React treats `title` as a metadata tag and
              mismatches on hydration when it receives several. */}
          <title>{`${point.label} · ${point.value}`}</title>
        </rect>
      ))}
    </svg>
  );
};
