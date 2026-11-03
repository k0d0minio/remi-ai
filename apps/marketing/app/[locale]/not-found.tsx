import NextLink from "next/link";
import { Button } from "@remi/ui";
import { Container, Section, Typography } from "@remi/ui/server";

const NotFound = () => (
  <Section spacing="lg">
    <Container size="narrow" className="flex flex-col items-start gap-6">
      <Typography variant="eyebrow" tone="muted">
        404
      </Typography>
      <Typography as="h1" size="4xl" weight="bold" balance>
        Cette page n&apos;existe pas
      </Typography>
      <Typography variant="lead" size="lg">
        L&apos;adresse a peut-être changé, ou elle n&apos;a jamais existé.
      </Typography>
      <Button asChild>
        <NextLink href="/fr">Retour au site</NextLink>
      </Button>
    </Container>
  </Section>
);

export default NotFound;
