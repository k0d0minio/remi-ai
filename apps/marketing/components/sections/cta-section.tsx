import { ArrowRight } from "lucide-react";
import NextLink from "next/link";
import { Button } from "@remi/ui";
import { CtaBand } from "@remi/ui/server";
import type { CtaContent } from "@/lib/content/types";
import { localePath, type Locale } from "@/lib/i18n";

type Props = {
  content: CtaContent;
  locale: Locale;
};

export const CtaSection = ({ content, locale }: Props) => (
  <CtaBand
    title={content.title}
    body={content.body}
    actions={
      <Button asChild size="xl" variant="secondary">
        <NextLink href={localePath(locale, content.action.href)}>
          {content.action.label}
          <ArrowRight aria-hidden="true" />
        </NextLink>
      </Button>
    }
  />
);
