"use client";

import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  patientListSorts,
  patientStatuses,
  type PatientListSort,
  type PatientStatus,
} from "@remi/services/shared";
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@remi/ui";
import { Input, VisuallyHidden } from "@remi/ui/server";
import { patientStatusLabels } from "@/components/patients/vocabulary";
import { setPatientListSortAction } from "@/lib/patients/list-actions";

/** What has been typed into the search box, and the URL it was typed against. */
type Typed = { value: string; from: string };

type Props = {
  search: string;
  status: PatientStatus | "all";
  /** The practitioner's remembered order, read from their operator row. */
  sort: PatientListSort;
};

/** Morgane's words for the two orders of story 5. */
const sortLabels: Record<PatientListSort, string> = {
  appointment: "Date de rendez-vous",
  name: "Nom",
};

/** Long enough not to navigate on every keystroke, short enough not to feel laggy. */
const DEBOUNCE_MS = 250;

/**
 * The roster's URL, built from the two filters. A module-level function
 * rather than a closure, so the debounce effect can list every value it
 * depends on and the dependency array stays honest.
 *
 * A filter at its default is left out of the query string: `/patients` and
 * `/patients?status=all` are the same roster, and only one of them should be
 * the address it has. The sort is not in the URL: the practitioner's operator
 * row remembers it (story 5).
 */
const rosterHref = (q: string, status: string) => {
  const params = new URLSearchParams();
  if (q.trim()) {
    params.set("q", q.trim());
  }
  if (status !== "all") {
    params.set("status", status);
  }
  const queryString = params.toString();
  return queryString ? `/patients?${queryString}` : "/patients";
};

/**
 * The roster's controls. A client island only because typing has to feel
 * immediate — the filtering itself happens on the server, driven by the query
 * string this writes.
 *
 * The search box is debounced and pushed into the URL, so a filtered roster is
 * a shareable link and the back button steps through the filters the way it
 * does through pages. The status select navigates straight away: a dropdown
 * has no intermediate states worth waiting through. The sort select writes the
 * practitioner's remembered order, and the action refreshes the list.
 */
export const RosterFilters = ({ search, status, sort }: Props) => {
  const router = useRouter();
  const [sorting, startSorting] = useTransition();

  // The URL is the source of truth: a back navigation has to move the input,
  // not be overwritten by it. So what has been typed is not mirrored into
  // state — it is an override on the URL that lasts exactly as long as the URL
  // it was typed against. `from` records that URL, and the moment a navigation
  // moves it — a debounce landing, a back button, a reset — the override stops
  // applying and the box reads the query string again, in the same render
  // rather than one effect later.
  const [typed, setTyped] = useState<Typed>({ value: search, from: search });
  const query = typed.from === search ? typed.value : search;
  const setQuery = (value: string) => setTyped({ value, from: search });

  // Typing navigates after a pause. The guard is what stops the effect firing
  // on the render that a completed navigation causes.
  useEffect(() => {
    if (query === search) {
      return;
    }
    const timer = setTimeout(
      () => router.push(rosterHref(query, status)),
      DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [query, search, status, router]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-56 flex-1">
        <Search
          aria-hidden="true"
          className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2"
        />
        <VisuallyHidden>
          <label htmlFor="roster-search">Rechercher un profil</label>
        </VisuallyHidden>
        <Input
          id="roster-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Pseudonyme, nom ou email"
          className="pl-9"
        />
      </div>

      <Select
        value={status}
        onValueChange={(value) => router.push(rosterHref(query, value))}
      >
        <SelectTrigger aria-label="Filtrer par statut" className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">tous les statuts</SelectItem>
          {patientStatuses.map((value) => (
            <SelectItem key={value} value={value}>
              {patientStatusLabels[value]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={sort}
        disabled={sorting}
        onValueChange={(value) =>
          startSorting(() => setPatientListSortAction(value))
        }
      >
        <SelectTrigger aria-label="Trier" className="w-52">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {patientListSorts.map((value) => (
            <SelectItem key={value} value={value}>
              {sortLabels[value]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {search || status !== "all" ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setQuery("");
            router.push("/patients");
          }}
        >
          <X aria-hidden="true" />
          Réinitialiser
        </Button>
      ) : null}
    </div>
  );
};
