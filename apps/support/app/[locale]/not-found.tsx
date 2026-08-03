import NextLink from "next/link";
import { Button } from "@remi/ui";
import { Container, Section, Typography } from "@remi/ui/server";

/**
 * Bilingual on one page: a not-found boundary has no reliable access to the
 * locale param, and someone who followed a stale link to an answer is better
 * served by both languages than by a guess in the wrong one.
 */
const NotFound = () => (
  <Section spacing="lg">
    <Container size="narrow" className="flex flex-col items-start gap-6">
      <Typography variant="eyebrow" tone="muted">
        404
      </Typography>
      <Typography as="h1" variant="display" size="5xl" balance>
        This answer does not exist · Cette réponse n&apos;existe pas
      </Typography>
      <Typography variant="lead" size="lg">
        The article may have moved, or it is not written yet. · L&apos;article a
        peut-être changé d&apos;adresse, ou il n&apos;est pas encore écrit.
      </Typography>
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <NextLink href="/en">Back to the help centre</NextLink>
        </Button>
        <Button asChild variant="outline">
          <NextLink href="/fr">Retour au centre d&apos;aide</NextLink>
        </Button>
      </div>
    </Container>
  </Section>
);

export default NotFound;
