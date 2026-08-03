import { ArrowRight } from "lucide-react";
import NextLink from "next/link";
import { localePath, type Locale } from "@remi/services/shared";
import { Button } from "@remi/ui";
import { CtaBand } from "@remi/ui/server";
import type { CtaContent } from "@/lib/content/types";

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
