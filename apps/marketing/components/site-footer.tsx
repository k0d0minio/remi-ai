import NextLink from "next/link";
import {
  BRAND_LEGAL_NAME,
  BRAND_NAME,
  BRAND_TAGLINE,
  Container,
  Link,
  Separator,
  Typography,
  Wordmark,
} from "@remi/ui/server";
import { nav } from "@/lib/content/landing";

const year = new Date().getFullYear();

export const SiteFooter = () => (
  <footer className="border-border/60 border-t">
    <Container className="flex flex-col gap-8 py-12">
      <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex max-w-xs flex-col gap-2">
          <Wordmark size="sm" />
          <Typography size="sm" tone="muted">
            {BRAND_TAGLINE.en}
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
        © {year} {BRAND_LEGAL_NAME}. {BRAND_NAME} provides general nutritional
        information and does not diagnose or treat any condition — speak to your
        doctor or a registered dietitian about anything clinical.
      </Typography>
    </Container>
  </footer>
);
