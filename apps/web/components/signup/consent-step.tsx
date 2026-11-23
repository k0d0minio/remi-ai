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
import type { Content } from "@/lib/content/types";
import { fill } from "@/lib/content/fill";

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
  const missingId = "consent-missing";

  return (
    <section aria-labelledby="consent-title" className="flex flex-col gap-5">
      <Typography as="h2" id="consent-title" size="xl" weight="semibold">
        {content.title}
      </Typography>
      <Typography size="sm" tone="muted">
        {content.intro}
      </Typography>

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
              <Typography size="xs" tone="muted">
                {version}
              </Typography>
            </div>

            {/* Focusable so a keyboard can scroll it. Wide tables scroll inside it, never the page. */}
            <div
              lang={consent.lang}
              role="region"
              aria-label={name}
              tabIndex={0}
              className="border-border max-h-72 overflow-y-auto overflow-x-hidden rounded-lg border p-3 [&_table]:block [&_table]:overflow-x-auto"
            >
              {consent.body}
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="min-h-11 self-start"
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
                  className="px-6 pb-6 [&_table]:block [&_table]:overflow-x-auto"
                >
                  {consent.body}
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex min-h-11 items-center gap-3">
              <Checkbox
                id={boxId}
                className="size-6"
                checked={ticked.has(consent.key)}
                onCheckedChange={(checked) =>
                  onToggle(consent.key, checked === true)
                }
              />
              <Typography as="label" htmlFor={boxId} size="sm">
                {fill(content.accept, { name })}
              </Typography>
            </div>
          </div>
        );
      })}

      {missing.length > 0 ? (
        <Typography id={missingId} size="sm" tone="muted">
          {fill(content.missing, {
            consents: missing
              .map((consent) => content.names[consent.key])
              .join(", "),
          })}
        </Typography>
      ) : null}

      <Button
        type="button"
        size="lg"
        className="min-h-11 w-full"
        disabled={missing.length > 0}
        aria-describedby={missing.length > 0 ? missingId : undefined}
        onClick={onContinue}
      >
        {content.continue}
      </Button>
    </section>
  );
};
