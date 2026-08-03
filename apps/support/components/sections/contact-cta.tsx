import { ArrowRight } from "lucide-react";
import type { Locale } from "@remi/services/shared";
import { Button } from "@remi/ui";
import { CtaBand } from "@remi/ui/server";
import type { Content } from "@/lib/content/types";
import { externalHref } from "@/lib/links";

type Props = {
  content: Content["home"]["cta"];
  locale: Locale;
};

/**
 * The last resort, and the only inverted block on the page. It points at the
 * public site's contact form rather than an address of its own: there is one
 * front door for a message to this team, and a second one would quietly become
 * the unread one.
 */
export const ContactCta = ({ content, locale }: Props) => (
  <CtaBand
    title={content.title}
    body={content.body}
    actions={
      <Button asChild size="xl" variant="secondary">
        <a href={externalHref(locale, content.action)}>
          {content.action.label}
          <ArrowRight aria-hidden="true" />
        </a>
      </Button>
    }
  />
);
