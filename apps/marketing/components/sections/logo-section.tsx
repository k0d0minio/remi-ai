import { Marquee } from "@remi/ui/motion";
import { Container, Section, Typography } from "@remi/ui/server";
import { logos } from "@/lib/content/landing";

/**
 * PLACEHOLDER. None of the names in lib/content/landing.ts has any relationship
 * with REMI. Replace them with real ones or delete this section — an implied
 * endorsement that does not exist is a claim, and a false one.
 *
 * The marquee's static fallback renders every name in the HTML, so this is
 * readable before its chunk arrives and with JavaScript off entirely.
 */
export const LogoSection = () => (
  <Section spacing="sm">
    <Container className="flex flex-col gap-6">
      <Typography size="sm" tone="muted" className="text-center">
        Placeholder — partner and press logos
      </Typography>

      <Marquee speed={45}>
        {logos.map((name) => (
          <Typography
            key={name}
            as="span"
            size="lg"
            weight="medium"
            tone="muted"
            className="px-8 opacity-60"
          >
            {name}
          </Typography>
        ))}
      </Marquee>
    </Container>
  </Section>
);
