import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@remi/ui";
import { Input, Typography } from "@remi/ui/server";
import { practitionerStatusLabels } from "@/components/practitioners/status";
import type { PractitionerStatus } from "@/lib/fixtures";

type Props = {
  /** Derived from the rows on screen, so the list can never offer a dead option. */
  specialties: string[];
};

const statuses: PractitionerStatus[] = ["onboarded", "invited", "suspended"];

/**
 * The filter row, rendered ahead of the query layer that will drive it. It is
 * here now because it decides the table's header spacing and the page's top
 * rhythm, and retrofitting those is a redesign rather than a wiring job.
 *
 * The controls are inert on purpose and the line underneath says so — a console
 * that silently ignores a filter is worse than one that admits it has none.
 */
export const PractitionerFilters = ({ specialties }: Props) => (
  <div className="flex flex-col gap-2">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative sm:max-w-xs sm:flex-1">
        <Search
          aria-hidden="true"
          className="text-muted-foreground pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2"
        />
        <Input
          type="search"
          size="sm"
          aria-label="Search practitioners"
          placeholder="Name, practice or city"
          className="pl-8"
        />
      </div>

      <Select defaultValue="all">
        <SelectTrigger size="sm" aria-label="Specialty" className="sm:w-52">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Every specialty</SelectItem>
          {specialties.map((specialty) => (
            <SelectItem key={specialty} value={specialty}>
              {specialty}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select defaultValue="all">
        <SelectTrigger size="sm" aria-label="Pilot status" className="sm:w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Every status</SelectItem>
          {statuses.map((status) => (
            <SelectItem key={status} value={status}>
              {practitionerStatusLabels[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <Typography size="xs" tone="muted">
      Filters are not wired yet — the console reads from fixtures, so the table
      below always shows every practitioner.
    </Typography>
  </div>
);
