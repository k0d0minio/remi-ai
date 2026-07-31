import NextLink from "next/link";
import { Button } from "@remi/ui";
import { Container, Section, Typography } from "@remi/ui/server";

/**
 * Bilingual on one page: a not-found boundary has no reliable access to the
 * locale param, and a lost visitor is better served by both languages than by
 * a guess in the wrong one.
 */
const NotFound = () => (
  <Section spacing="lg">
    <Container size="narrow" className="flex flex-col items-start gap-6">
      <Typography variant="eyebrow" tone="muted">
        404
      </Typography>
      <Typography as="h1" variant="display" size="5xl" balance>
        This page does not exist · Cette page n'existe pas
      </Typography>
      <Typography variant="lead" size="lg">
        The address may have changed, or it never existed. · L'adresse a
        peut-être changé, ou elle n'a jamais existé.
      </Typography>
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <NextLink href="/en">Back to the site</NextLink>
        </Button>
        <Button asChild variant="outline">
          <NextLink href="/fr">Retour au site</NextLink>
        </Button>
      </div>
    </Container>
  </Section>
);

export default NotFound;
