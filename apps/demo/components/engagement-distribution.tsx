import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Typography,
} from "@remi/ui/server";
import { cn } from "@remi/ui/utils";
import type { EngagementBand, Intent } from "@/lib/mock/types";

/** Static class strings — a composed `bg-${intent}` produces no CSS. */
const fills: Record<Intent, string> = {
  success: "bg-success",
  info: "bg-info",
  warning: "bg-warning",
  error: "bg-error",
  neutral: "bg-muted-foreground",
};

type Props = {
  bands: EngagementBand[];
  /** The cohort, so a band can be read as a share and not only as a count. */
  total: number;
};

/**
 * Where the cohort sits, band by band. Horizontal bars because the bands have
 * long names, ordered from held to lost because the order is the reading.
 *
 * The colours are the design system's intents rather than an invented series
 * palette: an engagement band *is* a state, which is what those tokens are
 * reserved for. Checked with the data-viz validator against both surfaces —
 * adjacent-pair separation under simulated protanopia/deuteranopia clears the
 * threshold, and the two low-contrast fills are relieved the way the rule
 * requires: every bar is direct-labelled and the whole thing has a table view,
 * so no value is ever carried by colour alone. `bg-neutral` would be the fill
 * for the last band, but at grey-100 it is invisible on a card — the
 * de-emphasis grey does that job instead.
 */
export const EngagementDistribution = ({ bands, total }: Props) => {
  const highest = Math.max(...bands.map((band) => band.count));
  const share = (count: number) => Math.round((count / total) * 100);

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-2">
        {bands.map((band) => (
          <li
            key={band.level}
            className="grid grid-cols-[minmax(0,8rem)_1fr_auto] items-center gap-3 sm:grid-cols-[minmax(0,13rem)_1fr_auto]"
          >
            <div className="flex min-w-0 flex-col">
              <Typography as="span" size="sm" weight="medium">
                {band.label}
              </Typography>
              <Typography as="span" size="xs" tone="muted">
                {band.criterion}
              </Typography>
            </div>
            <div
              aria-hidden="true"
              className={cn("h-5 min-w-0.5 rounded-r-sm", fills[band.intent])}
              style={{ width: `${(band.count / highest) * 100}%` }}
            />
            <Typography
              as="span"
              size="sm"
              className="whitespace-nowrap tabular-nums"
            >
              {band.count}
              <span className="text-muted-foreground">
                {" "}
                · {share(band.count)} %
              </span>
            </Typography>
          </li>
        ))}
      </ul>

      <details>
        <summary className="text-primary cursor-pointer text-sm">
          Voir les chiffres
        </summary>
        <Table className="mt-2">
          <TableCaption>
            Répartition des {total} accompagnements par niveau d'engagement.
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Niveau</TableHead>
              <TableHead>Critère</TableHead>
              <TableHead>Personnes</TableHead>
              <TableHead>Part</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bands.map((band) => (
              <TableRow key={band.level}>
                <TableCell>{band.label}</TableCell>
                <TableCell className="text-muted-foreground">
                  {band.criterion}
                </TableCell>
                <TableCell className="tabular-nums">{band.count}</TableCell>
                <TableCell className="tabular-nums">
                  {share(band.count)} %
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </details>
    </div>
  );
};
