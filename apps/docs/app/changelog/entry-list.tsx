import { getPageMap } from "nextra/page-map";
import { normalizePages } from "nextra/normalize-pages";
// The theme's own provider rather than the app's `mdx-components`: this one is
// typed with the concrete element components, so `ul` / `li` / `a` are not
// `| undefined` at the call site. The app adds no overrides on top of it, so the
// two return the same components either way — and the aliased name is what keeps
// `react-hooks/rules-of-hooks` out of a call that is not a hook.
import { useMDXComponents as getMdxComponents } from "nextra-theme-docs";

const CHANGELOG_ROUTE = "/changelog";

/**
 * Entry directories are named `<YYYY-MM-DD>-<slug>`, so the date is in the name
 * and a descending sort on it is chronological — newest first whatever order
 * `_meta.ts` happens to be in, and correct for an entry nobody registered there.
 */
const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const entryDate = (name: string) => {
  const parsed = new Date(`${name.slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? null : dateFormat.format(parsed);
};

/**
 * The changelog index, derived rather than written.
 *
 * `_meta.ts` is Nextra's navigation and every run updates it; the list that used
 * to sit under `## Entries` was a second copy of the same facts, kept by hand,
 * and it drifted seven entries behind. Reading the page map makes the folder
 * itself the list: an entry is reachable from `/changelog` the moment its
 * directory exists, and there is nothing left to forget.
 */
export const EntryList = async () => {
  const { a: Anchor, li: Item, ul: List } = getMdxComponents();
  const { directories } = normalizePages({
    list: await getPageMap(CHANGELOG_ROUTE),
    route: CHANGELOG_ROUTE,
  });

  const entries = directories
    .filter((entry) => entry.route !== CHANGELOG_ROUTE)
    .sort((a, b) => b.name.localeCompare(a.name));

  return (
    <List>
      {entries.map((entry) => {
        const date = entryDate(entry.name);
        return (
          <Item key={entry.route}>
            <Anchor href={entry.route}>{entry.title}</Anchor>
            {date ? ` — ${date}` : null}
          </Item>
        );
      })}
    </List>
  );
};
