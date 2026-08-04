import { ArrowUpRight, ThumbsDown, ThumbsUp } from "lucide-react";
import type { Locale } from "@remi/services/shared";
import { Button } from "@remi/ui";
import { Link, Typography } from "@remi/ui/server";
import type { Content } from "@/lib/content/types";
import { externalHref } from "@/lib/links";

type Props = {
  locale: Locale;
  content: Content["article"]["helpful"];
};

/**
 * The row every help centre closes with — drawn, and disabled, and saying so.
 *
 * There is no feedback pipeline behind these two buttons: no storage vendor is
 * committed, so a click would be discarded. The same rule the home page's
 * search field follows applies here — a control that quietly swallows an answer
 * is worse than no control — so the shape is shown, the buttons are inert, and
 * the note points at the one channel that does reach a person.
 */
export const HelpfulRow = ({ locale, content }: Props) => (
  <section
    aria-labelledby="helpful"
    className="border-border bg-muted/40 flex flex-col gap-4 rounded-xl border p-6"
  >
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <Typography as="h2" id="helpful" weight="medium">
        {content.question}
      </Typography>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled>
          <ThumbsUp aria-hidden="true" />
          {content.yes}
        </Button>
        <Button variant="outline" size="sm" disabled>
          <ThumbsDown aria-hidden="true" />
          {content.no}
        </Button>
      </div>
    </div>

    <Typography size="sm" tone="muted" className="leading-relaxed">
      {content.note}
    </Typography>

    <Link
      href={externalHref(locale, content.action)}
      variant="standalone"
      className="text-sm"
    >
      {content.action.label}
      <ArrowUpRight aria-hidden="true" />
    </Link>
  </section>
);
