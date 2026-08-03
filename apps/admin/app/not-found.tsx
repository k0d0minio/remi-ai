import NextLink from "next/link";
import type { Metadata } from "next";
import { Button } from "@remi/ui";
import {
  Badge,
  Card,
  CardContent,
  Typography,
  Wordmark,
} from "@remi/ui/server";

export const metadata: Metadata = {
  title: "Not found",
};

/**
 * At the app root rather than inside the route group, because this is what an
 * unmatched URL resolves to — a not-found file nested in the group would only
 * ever catch an explicit `notFound()` call.
 *
 * It renders without the console chrome on purpose: the nav promises sections
 * that exist, and framing a dead address with it suggests the route is real and
 * merely empty.
 */
const NotFound = () => (
  <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center gap-6 p-8">
    <div className="flex items-center gap-3">
      <Wordmark />
      <Badge variant="warning">admin</Badge>
    </div>

    <Card variant="warning">
      <CardContent className="flex flex-col items-start gap-4">
        <Typography variant="eyebrow" tone="muted">
          404
        </Typography>

        <div className="flex flex-col gap-2">
          <Typography as="h1" size="xl" weight="semibold" balance>
            No console route lives here
          </Typography>
          <Typography size="sm" tone="muted">
            The address may have moved, or the tool behind it has not been built
            yet. Nothing was changed by landing on it.
          </Typography>
        </div>

        <Button asChild size="sm">
          <NextLink href="/">Back to overview</NextLink>
        </Button>
      </CardContent>
    </Card>
  </main>
);

export default NotFound;
