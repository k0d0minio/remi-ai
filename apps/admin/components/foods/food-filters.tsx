"use client";

import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@remi/ui";
import { Input, VisuallyHidden } from "@remi/ui/server";

type Props = {
  search: string;
  group: string;
  /** The CIQUAL groups present in the table — no vocabulary of its own. */
  groups: readonly { code: string; nameFr: string }[];
};

const DEBOUNCE_MS = 250;

const foodsHref = (search: string, group: string) => {
  const params = new URLSearchParams();
  if (search.trim()) {
    params.set("q", search.trim());
  }
  if (group !== "all") {
    params.set("group", group);
  }
  const queryString = params.toString();
  return queryString ? `/aliments?${queryString}` : "/aliments";
};

/**
 * The catalogue's controls, built the same way the recipe library's are: the
 * URL is the source of truth, the server filters, and typing is debounced into
 * the query string so a filtered view is a link she can keep.
 */
export const FoodFilters = ({ search, group, groups }: Props) => {
  const router = useRouter();
  const [typed, setTyped] = useState({ value: search, from: search });
  const query = typed.from === search ? typed.value : search;

  useEffect(() => {
    if (query === search) {
      return;
    }
    const timer = setTimeout(
      () => router.push(foodsHref(query, group)),
      DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [query, search, group, router]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-56 flex-1">
        <Search
          aria-hidden="true"
          className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2"
        />
        <VisuallyHidden>
          <label htmlFor="food-search">Rechercher un aliment</label>
        </VisuallyHidden>
        <Input
          id="food-search"
          type="search"
          value={query}
          onChange={(event) =>
            setTyped({ value: event.target.value, from: search })
          }
          placeholder="Nom de l'aliment — les accents ne comptent pas"
          className="pl-9"
        />
      </div>

      {groups.length > 0 ? (
        <Select
          value={group}
          onValueChange={(value) => router.push(foodsHref(query, value))}
        >
          <SelectTrigger aria-label="Filtrer par groupe" className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">tous les groupes</SelectItem>
            {groups.map((entry) => (
              <SelectItem key={entry.code} value={entry.code}>
                {entry.nameFr}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}

      {search || group !== "all" ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setTyped({ value: "", from: search });
            router.push("/aliments");
          }}
        >
          <X aria-hidden="true" />
          Réinitialiser
        </Button>
      ) : null}
    </div>
  );
};
