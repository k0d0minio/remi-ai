"use client";

import { useState } from "react";
import { Switch } from "@remi/ui";
import {
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Typography,
} from "@remi/ui/server";
import type { FeatureFlag, FlagScope } from "@/lib/fixtures";

type Props = {
  flags: FeatureFlag[];
};

/**
 * Scope is reach, not health, so it does not take an intent colour — a flag on
 * in staging is not "worse" than one on internally. `production` is the one
 * exception: it means every practitioner sees this, which is the only scope
 * where a wrong switch costs something, and it earns the weight.
 */
const scopeIntents: Record<FlagScope, "outline" | "warning"> = {
  internal: "outline",
  staging: "outline",
  "pilot cohort": "outline",
  production: "warning",
};

/**
 * The whole roadmap as switches, with the count kept live above them. State is
 * local and deliberately so: a toggle here moves the switch and the count and
 * nothing else, which the line under the table says outright. When the service
 * layer is behind it, this component's state becomes its optimistic layer rather
 * than its truth — the shape does not change.
 */
export const FlagTable = ({ flags }: Props) => {
  const [enabled, setEnabled] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(flags.map((flag) => [flag.id, flag.enabled])),
  );

  const on = flags.filter((flag) => enabled[flag.id]).length;

  const toggle = (id: string) => {
    setEnabled((current) => ({ ...current, [id]: !current[id] }));
  };

  return (
    <div className="flex flex-col gap-3">
      <Typography size="sm" tone="muted" className="tabular-nums">
        {on} of {flags.length} on.
      </Typography>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Flag</TableHead>
            <TableHead>What it turns on</TableHead>
            <TableHead>Scope</TableHead>
            <TableHead>Last changed</TableHead>
            <TableHead className="text-right">On</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {flags.map((flag) => (
            <TableRow key={flag.id}>
              <TableCell>
                <div className="flex flex-col gap-0.5">
                  <Typography as="span" size="sm" weight="medium">
                    {flag.label}
                  </Typography>
                  <Typography
                    as="code"
                    size="xs"
                    tone="muted"
                    className="font-mono"
                  >
                    {flag.id}
                  </Typography>
                </div>
              </TableCell>

              <TableCell className="text-muted-foreground max-w-md text-sm">
                {flag.description}
              </TableCell>

              <TableCell>
                <Badge
                  variant={scopeIntents[flag.scope]}
                  tone="subtle"
                  size="sm"
                >
                  {flag.scope}
                </Badge>
              </TableCell>

              <TableCell className="text-muted-foreground whitespace-nowrap text-sm">
                <div className="flex flex-col gap-0.5">
                  <span>{flag.updatedOn}</span>
                  <Typography size="xs" tone="muted">
                    {flag.updatedBy}
                  </Typography>
                </div>
              </TableCell>

              <TableCell className="text-right">
                <Switch
                  size="sm"
                  aria-label={flag.label}
                  checked={enabled[flag.id]}
                  onCheckedChange={() => toggle(flag.id)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Typography size="xs" tone="muted">
        Toggling is visual only — the console has no backend behind it, so a
        switch moved here is forgotten on reload and the last-changed column
        still shows who set it in the fixture.
      </Typography>
    </div>
  );
};
