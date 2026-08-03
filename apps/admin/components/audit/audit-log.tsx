"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@remi/ui";
import { Typography } from "@remi/ui/server";
import { AuditTable } from "@/components/audit/audit-table";
import { auditKindLabels, auditKinds } from "@/components/audit/kinds";
import type { AuditEntry, AuditKind } from "@/lib/fixtures";

type Props = {
  entries: AuditEntry[];
};

/**
 * The one filter the log gets, and it genuinely narrows: the whole log is
 * already in memory, so filtering it needs no backend and pretending otherwise
 * would be a worse lie than the inert filter row on the practitioners table.
 *
 * Kind rather than operator or date because the question after an incident is
 * "what changed", not "what did Dana do on Tuesday" — and a date range over
 * thirty-odd entries narrows nothing an eye cannot.
 */
export const AuditLog = ({ entries }: Props) => {
  const [kind, setKind] = useState<AuditKind | "all">("all");

  const shown =
    kind === "all" ? entries : entries.filter((entry) => entry.kind === kind);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Select
          value={kind}
          onValueChange={(value) => setKind(value as AuditKind | "all")}
        >
          <SelectTrigger size="sm" aria-label="Kind" className="sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Every kind</SelectItem>
            {auditKinds.map((auditKind) => (
              <SelectItem key={auditKind} value={auditKind}>
                {auditKindLabels[auditKind]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Typography size="sm" tone="muted" className="tabular-nums">
          {shown.length === entries.length
            ? `${entries.length} entries`
            : `${shown.length} of ${entries.length} entries`}
        </Typography>
      </div>

      <AuditTable entries={shown} />
    </div>
  );
};
