"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { leadTypes, type LeadType } from "@remi/services/shared";
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@remi/ui";
import {
  leadStateLabels,
  leadTypeLabels,
  type LeadState,
} from "@/components/leads/vocabulary";

type Props = {
  type: LeadType | "all";
  state: LeadState;
};

/**
 * The list's address, from its two filters. A filter at its default is left
 * out: `/leads` and `/leads?type=all&state=pending` are the same list.
 */
export const leadsHref = (type: string, state: string) => {
  const params = new URLSearchParams();
  if (type !== "all") {
    params.set("type", type);
  }
  if (state !== "pending") {
    params.set("state", state);
  }
  const queryString = params.toString();
  return queryString ? `/leads?${queryString}` : "/leads";
};

/**
 * The two selects of the waiting list. A client island only because a select
 * navigates: the filtering happens on the server, from the query string.
 */
export const LeadFilters = ({ type, state }: Props) => {
  const router = useRouter();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={type}
        onValueChange={(value) => router.push(leadsHref(value, state))}
      >
        <SelectTrigger aria-label="Filtrer par liste" className="w-56">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">toutes les listes</SelectItem>
          {leadTypes.map((value) => (
            <SelectItem key={value} value={value}>
              {leadTypeLabels[value]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={state}
        onValueChange={(value) => router.push(leadsHref(type, value))}
      >
        <SelectTrigger aria-label="Filtrer par état" className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(leadStateLabels) as LeadState[]).map((value) => (
            <SelectItem key={value} value={value}>
              {leadStateLabels[value]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {type !== "all" || state !== "pending" ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => router.push("/leads")}
        >
          <X aria-hidden="true" />
          Réinitialiser
        </Button>
      ) : null}
    </div>
  );
};
