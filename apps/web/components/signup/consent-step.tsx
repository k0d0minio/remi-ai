"use client";

import type { ReactNode } from "react";
import type { ConsentKey, ShownConsent } from "@remi/services/shared";
import {
  Button,
  Checkbox,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@remi/ui";
import { Typography } from "@remi/ui/server";
import { cn } from "@remi/ui/utils";
import type { Content } from "@/lib/content/types";
import { fill } from "@/lib/content/fill";

/** A link in a text is blue and underlined, with a visible focus (REM-11). */
const documentClasses =
  "[&_table]:block [&_table]:overflow-x-auto [&_a]:text-primary [&_a]:font-medium [&_a]:rounded-sm [&_a]:outline-none [&_a:focus-visible]:ring-[3px] [&_a:focus-visible]:ring-ring";

/** One consent text as the page shows it. The server renders the body. */
export type ConsentStepText = ShownConsent & {
  /** The text's date, formatted for the page's language. */
  date: string;
  /** The `lang` of the text block: the text's language, not the page's. */
  lang: string;
  body: ReactNode;
};

type Props = {
  consents: readonly ConsentStepText[];
  ticked: ReadonlySet<ConsentKey>;
  onToggle: (key: ConsentKey, checked: boolean) => void;
  onContinue: () => void;
  /** A refusal from the server, already in the page's language. */
  alert: string | null;
  content: Content["signupLink"]["consent"];
};

/**
 * The consent step (story 3): the patient reads each mandatory text and ticks
 * one box per text before the form opens. Nothing goes to the server here. The
 * ticks travel with the final submit, and the server checks them again.
 *
 * Each text shows in full in a scroll block. « Relire » opens it again in a
 * full-height sheet, which reads better on a phone.
 *
 * The look follows the charter (sections 4 and 6, REM-6): each text is a white
 * card with a 24 px radius and a light border on the page's pale blue, and the
 * sheet is a white surface too.
 *
 * The type follows the charter (section 5, REM-8): the section title is 18 /
 * 24 px at weight 800, the main text 16 / 24 px, the secondary text 14 px.
 *
 * « Continuer » stays disabled until each box is ticked. No message repeats
 * that under the boxes (REM-11).
 */
export const ConsentStep = ({
  consents,
  ticked,
  onToggle,
  onContinue,
  alert,
  content,
}: Props) => {
  const missing = consents.filter((consent) => !ticked.has(consent.key));

  return (
    <section aria-labelledby="consent-title" className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Typography as="h2" id="consent-title" size="lg" weight="bold">
          {content.title}
        </Typography>
        <Typography tone="muted">{content.intro}</Typography>
      </div>

      {alert ? (
        <Typography size="sm" className="text-error-text" role="alert">
          {alert}
        </Typography>
      ) : null}

      {consents.map((consent) => {
        const name = content.names[consent.key];
        const version = fill(content.version, {
          version: consent.version,
          date: consent.date,
        });
        const boxId = `consent-${consent.key}`;
        return (
          <div
            key={consent.key}
            className="border-border bg-card flex flex-col gap-3 rounded-2xl border p-4"
          >
            <div className="flex flex-col gap-1">
              <Typography as="h3" size="base" weight="semibold">
                {name}
              </Typography>
              <Typography size="sm" tone="muted">
                {version}
              </Typography>
            </div>

            {/* Focusable so a keyboard can scroll it. Wide tables scroll inside it, never the page. */}
            <div
              lang={consent.lang}
              role="region"
              aria-label={name}
              tabIndex={0}
              className={cn(
                "border-border focus-visible:ring-ring max-h-72 overflow-y-auto overflow-x-hidden rounded-lg border p-3 outline-none focus-visible:ring-[3px]",
                documentClasses,
              )}
            >
              {consent.body}
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  className="self-start"
                >
                  {content.reread}
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-card w-full overflow-y-auto sm:max-w-xl">
                <SheetHeader className="pr-12">
                  <SheetTitle>{name}</SheetTitle>
                  <SheetDescription>{version}</SheetDescription>
                </SheetHeader>
                <div
                  lang={consent.lang}
                  className={cn("px-6 pb-6", documentClasses)}
                >
                  {consent.body}
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex min-h-11 items-center gap-3">
              {/* A 24 px box with a 44 × 44 px touch area (REM-11). */}
              <Checkbox
                id={boxId}
                className="relative size-6 after:absolute after:-inset-2.5"
                checked={ticked.has(consent.key)}
                onCheckedChange={(checked) =>
                  onToggle(consent.key, checked === true)
                }
              />
              <Typography as="label" htmlFor={boxId} className="cursor-pointer">
                {fill(content.accept, { name })}
              </Typography>
            </div>
          </div>
        );
      })}

      {/* The primary button of the screen: a 56 px pill. Disabled, it turns
          pale instead of a faded blue, so the patient sees it cannot act. */}
      <Button
        type="button"
        size="lg"
        className="disabled:bg-muted disabled:text-muted-foreground w-full disabled:opacity-100"
        disabled={missing.length > 0}
        onClick={onContinue}
      >
        {content.continue}
      </Button>
    </section>
  );
};
