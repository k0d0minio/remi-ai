/**
 * The public surface of @remi/ui.
 *
 * Everything exported here is a client component — tsup stamps a "use client"
 * banner on this entry (tsup.config.ts). A barrel export is a public-API
 * commitment: export a symbol only once an app imports it, and delete the line
 * when its last consumer goes (CONVENTIONS.md → "Keeping the codebase lean").
 *
 * `cn()` is deliberately NOT re-exported here — it lives on the server-safe
 * "@remi/ui/utils" subpath.
 */

export { Badge, badgeVariants } from "./components/badge";
export { Button, buttonVariants } from "./components/button";
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./components/card";
export { Typography } from "./components/typography";
