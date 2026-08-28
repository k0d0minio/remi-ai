"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { auditActions, type AuditActionName } from "@remi/services/shared";
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from "@remi/ui";
import { Typography } from "@remi/ui/server";
import { actionLabels } from "@/components/audit/vocabulary";

type Props = {
  action: AuditActionName | "all";
  /** Narrowed to the signed-in operator's own actions. */
  mine: boolean;
};

/**
 * The journal's two filters, in the URL for the same reason the roster's are:
 * a filtered journal is then a link, and the filtering itself stays on the
 * server where the rows are.
 */
const journalHref = (action: string, mine: boolean) => {
  const params = new URLSearchParams();
  if (action !== "all") {
    params.set("action", action);
  }
  if (mine) {
    params.set("mine", "1");
  }
  const queryString = params.toString();
  return queryString ? `/audit?${queryString}` : "/audit";
};

export const AuditFilters = ({ action, mine }: Props) => {
  const router = useRouter();

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Select
        value={action}
        onValueChange={(value) => router.push(journalHref(value, mine))}
      >
        <SelectTrigger aria-label="Filtrer par action" className="w-64">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">toutes les actions</SelectItem>
          {auditActions.map((value) => (
            <SelectItem key={value} value={value}>
              {actionLabels[value]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <label className="flex items-center gap-2">
        <Switch
          checked={mine}
          onCheckedChange={(checked) =>
            router.push(journalHref(action, checked))
          }
        />
        <Typography as="span" size="sm">
          Mes actions seulement
        </Typography>
      </label>

      {action !== "all" || mine ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => router.push("/audit")}
        >
          <X aria-hidden="true" />
          Réinitialiser
        </Button>
      ) : null}
    </div>
  );
};
