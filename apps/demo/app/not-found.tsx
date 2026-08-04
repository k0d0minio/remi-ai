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
  title: "Page introuvable",
};

/**
 * At the app root rather than inside the route group, because this is what an
 * unmatched URL resolves to — a not-found file nested in the group would only
 * ever catch an explicit `notFound()` call.
 *
 * It renders without the prototype chrome on purpose: the nav promises screens
 * that exist, and framing a dead address with it suggests the maquette covers
 * something it does not.
 */
const NotFound = () => (
  <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center gap-6 p-8">
    <div className="flex items-center gap-3">
      <Wordmark />
      <Badge variant="warning" tone="subtle" size="sm">
        maquette
      </Badge>
    </div>

    <Card variant="warning">
      <CardContent className="flex flex-col items-start gap-4">
        <Typography variant="eyebrow" tone="muted">
          404
        </Typography>

        <div className="flex flex-col gap-2">
          <Typography as="h1" size="xl" weight="semibold" balance>
            Cet écran n&apos;existe pas
          </Typography>
          <Typography size="sm" tone="muted">
            L&apos;adresse a peut-être changé, ou l&apos;écran n&apos;a pas
            encore été prototypé. Rien n&apos;est cassé : cette maquette ne
            couvre qu&apos;une partie du produit.
          </Typography>
        </div>

        <Button asChild size="sm">
          <NextLink href="/">Retour à l&apos;accueil</NextLink>
        </Button>
      </CardContent>
    </Card>
  </main>
);

export default NotFound;
