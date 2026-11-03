import NextLink from "next/link";
import { localePath } from "@remi/services/shared";
import { Container, Link, Typography } from "@remi/ui/server";
import { Logo } from "@/components/logo";
import { FOOTER, LEGAL_NAV } from "@/lib/content/landing";
import { SITE } from "@/lib/site";

const year = new Date().getFullYear();

export const SiteFooter = () => (
  <footer className="bg-foreground text-background/80">
    <Container className="flex flex-col gap-8 py-12">
      <div className="grid gap-8 md:grid-cols-[2fr_1fr_1fr]">
        <div className="flex max-w-sm flex-col items-start gap-3">
          <span className="bg-background inline-flex rounded-lg px-2.5 py-1.5">
            <Logo height={28} />
          </span>
          <Typography size="sm" className="text-background/80">
            {FOOTER.tagline}
          </Typography>
        </div>

        <div className="flex flex-col gap-2">
          <Typography size="sm" weight="semibold" className="text-background">
            {FOOTER.contactTitle}
          </Typography>
          <Link href={`mailto:${SITE.contactEmail}`} className="text-background text-sm">
            {SITE.contactEmail}
          </Link>
          <Link href={SITE.contactPhoneHref} className="text-background text-sm">
            {SITE.contactPhone}
          </Link>
        </div>

        <nav aria-label={FOOTER.infoLabel} className="flex flex-col gap-2">
          <Typography size="sm" weight="semibold" className="text-background">
            {FOOTER.infoTitle}
          </Typography>
          {LEGAL_NAV.map((item) => (
            <Link
              key={item.slug}
              as={NextLink}
              href={localePath("fr", `/${item.slug}`)}
              className="text-background text-sm"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <Typography size="xs" className="text-background/60">
        {FOOTER.copyright(year)}
      </Typography>
    </Container>
  </footer>
);
