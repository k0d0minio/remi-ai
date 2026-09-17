"use client";

import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  nutritionRuleKinds,
  nutritionRuleStatuses,
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
import { kindLabels, statusLabels } from "@/lib/knowledge/vocabulary";

type Props = {
  search: string;
  tag: string;
  kind: string;
  status: string;
  shelf: string;
  /** Every tag on a rule in force — the filter has no vocabulary of its own. */
  tags: readonly string[];
};

const DEBOUNCE_MS = 250;

type Query = {
  search: string;
  tag: string;
  kind: string;
  status: string;
  shelf: string;
};

const corpusHref = ({ search, tag, kind, status, shelf }: Query) => {
  const params = new URLSearchParams();
  if (search.trim()) {
    params.set("q", search.trim());
  }
  for (const [key, value] of [
    ["tag", tag],
    ["kind", kind],
    ["status", status],
    ["shelf", shelf],
  ] as const) {
    if (value !== "all" && value !== "current") {
      params.set(key, value);
    }
  }
  const queryString = params.toString();
  return queryString ? `/knowledge?${queryString}` : "/knowledge";
};

/**
 * The corpus' controls, built the way the recipe library's are: the URL is the
 * source of truth, the server does the filtering, and typing is debounced into
 * the query string so a filtered corpus is a link she can keep.
 *
 * The shelf selector is what makes superseded and archived rows reachable
 * without putting them in the way. They are history, and history is opt-in.
 */
export const CorpusFilters = ({
  search,
  tag,
  kind,
  status,
  shelf,
  tags,
}: Props) => {
  const router = useRouter();
  const [typed, setTyped] = useState({ value: search, from: search });
  const query = typed.from === search ? typed.value : search;
  const current = { search: query, tag, kind, status, shelf };
  const filtered =
    search !== "" ||
    tag !== "all" ||
    kind !== "all" ||
    status !== "all" ||
    shelf !== "current";

  useEffect(() => {
    if (query === search) {
      return;
    }
    const timer = setTimeout(
      () =>
        router.push(corpusHref({ search: query, tag, kind, status, shelf })),
      DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [query, search, tag, kind, status, shelf, router]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-56 flex-1">
        <Search
          aria-hidden="true"
          className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2"
        />
        <VisuallyHidden>
          <label htmlFor="corpus-search">Rechercher une règle</label>
        </VisuallyHidden>
        <Input
          id="corpus-search"
          type="search"
          value={query}
          onChange={(event) =>
            setTyped({ value: event.target.value, from: search })
          }
          placeholder="Titre de la règle"
          className="pl-9"
        />
      </div>

      {tags.length > 0 ? (
        <Select
          value={tag}
          onValueChange={(value) =>
            router.push(corpusHref({ ...current, tag: value }))
          }
        >
          <SelectTrigger aria-label="Filtrer par étiquette" className="w-44">
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

      <Select
        value={kind}
        onValueChange={(value) =>
          router.push(corpusHref({ ...current, kind: value }))
        }
      >
        <SelectTrigger aria-label="Filtrer par type" className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">tous les types</SelectItem>
          {nutritionRuleKinds.map((value) => (
            <SelectItem key={value} value={value}>
              {kindLabels[value]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={status}
        onValueChange={(value) =>
          router.push(corpusHref({ ...current, status: value }))
        }
      >
        <SelectTrigger aria-label="Filtrer par statut" className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">tous les statuts</SelectItem>
          {nutritionRuleStatuses.map((value) => (
            <SelectItem key={value} value={value}>
              {statusLabels[value]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={shelf}
        onValueChange={(value) =>
          router.push(corpusHref({ ...current, shelf: value }))
        }
      >
        <SelectTrigger aria-label="Afficher" className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="current">règles en vigueur</SelectItem>
          <SelectItem value="superseded">versions remplacées</SelectItem>
          <SelectItem value="archived">règles archivées</SelectItem>
        </SelectContent>
      </Select>

      {filtered ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setTyped({ value: "", from: search });
            router.push("/knowledge");
          }}
        >
          <X aria-hidden="true" />
          Réinitialiser
        </Button>
      ) : null}
    </div>
  );
};
