/**
 * @remi/ui/server — the SERVER-SAFE surface.
 *
 * Nothing exported here needs a hook, an event handler or a browser API, and
 * tsup builds this entry WITHOUT the "use client" banner. A server component can
 * import from it and stay a server component; a client component can import from
 * it too. This is where a primitive belongs unless it has a concrete reason not
 * to be — most of a marketing page is markup, and markup should not cost bytes.
 *
 * The constraint that keeps it true: no module reachable from here may import
 * from ../components (client) or ../motion (client, and drags in `motion`).
 * tsup bundles per entry, so a single such import inlines the whole thing into
 * this bundle without the banner it needs. `eslint.config.ts` enforces it.
 *
 * The pattern for a compound that needs something interactive is a `ReactNode`
 * prop — `<Hero actions={<Button …/>} />`. A server page renders the button and
 * passes it down; the boundary stays exactly where it should.
 *
 * There is no `asChild` on anything here. Radix's Slot reaches for a hook, so it
 * belongs on the client side of the line; `as` does the same job and is pure.
 */

export {
  Alert,
  AlertDescription,
  AlertTitle,
  alertVariants,
} from "./server/alert";
export { Badge, badgeVariants } from "./server/badge";
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  cardVariants,
} from "./server/card";
export { Container } from "./server/container";
export { Field } from "./server/field";
export { IconTile } from "./server/icon-tile";
export { Input } from "./server/input";
export { Link, linkVariants } from "./server/link";
export { LocaleSwitcher } from "./server/locale-switcher";
export { Progress, progressBarVariants } from "./server/progress";
export { Section } from "./server/section";
export { Separator } from "./server/separator";
export { Skeleton } from "./server/skeleton";
export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./server/table";
export { Textarea } from "./server/textarea";
export { Typography } from "./server/typography";
export { VisuallyHidden } from "./server/visually-hidden";
export { Wordmark } from "./server/wordmark";

export {
  BRAND_COLORS,
  BRAND_GLYPH_PATH,
  BRAND_GLYPH_VIEW_BOX,
  BRAND_LEGAL_NAME,
  BRAND_NAME,
  BRAND_TAGLINE,
} from "./lib/brand";

/**
 * The theme's server-side half. `themeScript` is a string a root layout renders
 * before paint; `ThemeToggle` — the client half — lives in the main barrel.
 */
export { themeScript, type Theme } from "./lib/theme";

export { CtaBand } from "./server/compound/cta-band";
export { EmptyState } from "./server/compound/empty-state";
export { FeatureGrid, type Feature } from "./server/compound/feature-grid";
export { Hero } from "./server/compound/hero";
export { StatRow, type Stat } from "./server/compound/stat-row";
