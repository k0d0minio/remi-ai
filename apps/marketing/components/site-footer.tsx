import NextLink from "next/link";
import { localePath, type Locale } from "@remi/services/shared";
import {
  BRAND_LEGAL_NAME,
  Container,
  Link,
  Separator,
  Typography,
  Wordmark,
} from "@remi/ui/server";
import { getContent } from "@/lib/content";

type Props = {
  locale: Locale;
};

const year = new Date().getFullYear();

export const SiteFooter = ({ locale }: Props) => {
  const content = getContent(locale);

  return (
    <footer className="border-border/60 border-t">
      <Container className="flex flex-col gap-8 py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex max-w-xs flex-col gap-2">
            <Wordmark size="sm" />
            <Typography size="sm" tone="muted">
              {content.footer.tagline}
            </Typography>
          </div>

          <nav
            aria-label={content.footer.navLabel}
            className="flex flex-col gap-2.5"
          >
            {content.nav.map((item) => (
              <Link
                key={item.href}
                as={NextLink}
                href={localePath(locale, item.href)}
                variant="muted"
                className="text-sm"
              >
                {item.label}
              </Link>
            ))}
            <Link
              as={NextLink}
              href={localePath(locale, "/contact")}
              variant="muted"
              className="text-sm"
            >
              {content.header.contact}
            </Link>
          </nav>
        </div>

        <Separator tone="subtle" />

        <Typography size="xs" tone="muted">
          © {year} {BRAND_LEGAL_NAME}. {content.footer.disclaimer}
        </Typography>
      </Container>
    </footer>
  );
};
