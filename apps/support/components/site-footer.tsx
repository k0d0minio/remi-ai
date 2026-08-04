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
import { externalHref } from "@/lib/links";

type Props = {
  locale: Locale;
};

const year = new Date().getFullYear();

/**
 * The public site's footer, with the same medical disclaimer — the sentence
 * matters most here, where someone is reading an answer about their own plan
 * and could mistake a help article for clinical advice.
 *
 * Every link leaves for another origin, so they are plain anchors: `next/link`
 * would resolve them against this app.
 */
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
            {content.footer.links.map((link) => (
              <Link
                key={`${link.target}${link.path}`}
                href={externalHref(locale, link)}
                variant="muted"
                className="text-sm"
              >
                {link.label}
              </Link>
            ))}

            {/* The one link in this footer that stays on this origin, so it is
                the one that routes rather than navigates. */}
            <Link
              as={NextLink}
              href={localePath(locale, "/status")}
              variant="muted"
              className="text-sm"
            >
              {content.footer.status}
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
