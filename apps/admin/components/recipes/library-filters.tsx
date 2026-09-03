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
  tag: string;
  /** Every tag on an active recipe — the filter has no vocabulary of its own. */
  tags: readonly string[];
};

const DEBOUNCE_MS = 250;

const libraryHref = (search: string, tag: string) => {
  const params = new URLSearchParams();
  if (search.trim()) {
    params.set("q", search.trim());
  }
  if (tag !== "all") {
    params.set("tag", tag);
  }
  const queryString = params.toString();
  return queryString ? `/recipes?${queryString}` : "/recipes";
};

/**
 * The library's controls, built the same way the roster's are: the URL is the
 * source of truth, the server does the filtering, and typing is debounced into
 * the query string so a filtered library is a link.
 *
 * The tag list is passed in rather than defined here, because there is no tag
 * vocabulary to define — a tag exists exactly as long as a recipe carries it.
 */
export const LibraryFilters = ({ search, tag, tags }: Props) => {
  const router = useRouter();
  const [typed, setTyped] = useState({ value: search, from: search });
  const query = typed.from === search ? typed.value : search;

  useEffect(() => {
    if (query === search) {
      return;
    }
    const timer = setTimeout(
      () => router.push(libraryHref(query, tag)),
      DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [query, search, tag, router]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-56 flex-1">
        <Search
          aria-hidden="true"
          className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2"
        />
        <VisuallyHidden>
          <label htmlFor="library-search">Rechercher une recette</label>
        </VisuallyHidden>
        <Input
          id="library-search"
          type="search"
          value={query}
          onChange={(event) =>
            setTyped({ value: event.target.value, from: search })
          }
          placeholder="Titre de la recette"
          className="pl-9"
        />
      </div>

      {tags.length > 0 ? (
        <Select
          value={tag}
          onValueChange={(value) => router.push(libraryHref(query, value))}
        >
          <SelectTrigger aria-label="Filtrer par étiquette" className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">toutes les étiquettes</SelectItem>
            {tags.map((value) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}

      {search || tag !== "all" ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setTyped({ value: "", from: search });
            router.push("/recipes");
          }}
        >
          <X aria-hidden="true" />
          Réinitialiser
        </Button>
      ) : null}
    </div>
  );
};
