import NextLink from "next/link";
import { Container, Link, Separator, Typography } from "@remi/ui/server";
import { nav } from "@/lib/content/landing";
import { siteName } from "@/lib/metadata";

const year = new Date().getFullYear();

export const SiteFooter = () => (
  <footer className="border-border/60 border-t">
    <Container className="flex flex-col gap-8 py-12">
      <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex max-w-xs flex-col gap-2">
          <Typography as="span" variant="display" size="xl">
            Remi
          </Typography>
          <Typography size="sm" tone="muted">
            Nutrition tracking and decision support. Not a substitute for
            medical advice.
          </Typography>
        </div>

        <nav aria-label="Footer" className="flex flex-col gap-2.5">
          {nav.map((item) => (
            <Link
              key={item.href}
              as={NextLink}
              href={item.href}
              variant="muted"
              className="text-sm"
            >
              {item.label}
            </Link>
          ))}
          <Link
            as={NextLink}
            href="/contact"
            variant="muted"
            className="text-sm"
          >
            Contact
          </Link>
        </nav>
      </div>

      <Separator tone="subtle" />

      <Typography size="xs" tone="muted">
        © {year} {siteName}. Remi provides general nutritional information and
        does not diagnose or treat any condition — speak to your doctor or a
        registered dietitian about anything clinical.
      </Typography>
    </Container>
  </footer>
);
