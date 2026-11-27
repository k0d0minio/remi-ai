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
import { Typography, linkVariants } from "@remi/ui/server";
import { cn } from "@remi/ui/utils";
import type { Content } from "@/lib/content/types";
import { fill } from "@/lib/content/fill";

/**
 * A link in a text is blue and underlined, with a visible focus (REM-11). A
 * long address breaks at any character, so it stays in the sheet (REM-12).
 */
const documentClasses =
  "[&_table]:block [&_table]:overflow-x-auto [&_a]:wrap-anywhere [&_a]:text-primary [&_a]:font-medium [&_a]:rounded-sm [&_a]:outline-none [&_a:focus-visible]:ring-[3px] [&_a:focus-visible]:ring-ring";

/** One document as the page shows it. The server renders the body. */
export type ConsentStepDocument = {
  version: string;
  /** The text's date, formatted for the page's language. */
  date: string;
  /** The `lang` of the text block: the text's language, not the page's. */
  lang: string;
  body: ReactNode;
};

/** One consent text as the page shows it. */
export type ConsentStepText = ShownConsent & ConsentStepDocument;

type Props = {
  /** The texts of the box: the care consent and the CGV (REM-207). */
  consents: readonly ConsentStepText[];
  ticked: ReadonlySet<ConsentKey>;
  onToggle: (key: ConsentKey, checked: boolean) => void;
  onContinue: () => void;
  /** A refusal from the server, already in the page's language. */
  alert: string | null;
  content: Content["signupLink"]["consent"];
};

type DocumentLinkProps = {
  name: string;
  document: ConsentStepDocument;
  versionText: string;
};

/**
 * A document name in the sentence of the box. It opens the document in a
 * full-height sheet, on the same page. Closing the sheet gives the focus back
 * to the link.
 *
 * The text line is 24 px high. A transparent layer adds 10 px above and below
 * the name, so the touch area is 44 px high and the sentence keeps its layout
 * (REM-12).
 */
const DocumentLink = ({ name, document, versionText }: DocumentLinkProps) => {
  const version = fill(versionText, {
    version: document.version,
    date: document.date,
  });
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className={cn(
            linkVariants({ variant: "primary" }),
            "relative cursor-pointer font-medium underline after:absolute after:inset-x-0 after:-inset-y-2.5",
          )}
        >
          {name}
        </button>
      </SheetTrigger>
      <SheetContent className="bg-card w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader className="pl-5 pr-12 pt-5 sm:pl-6 sm:pt-6">
          <SheetTitle>{name}</SheetTitle>
          <SheetDescription>{version}</SheetDescription>
        </SheetHeader>
        <div
          lang={document.lang}
          className={cn("px-5 pb-6 sm:px-6", documentClasses)}
        >
          {document.body}
        </div>
      </SheetContent>
    </Sheet>
  );
};

/**
 * The consent step (story 3): one box accepts the sales terms (CGV) and the
 * privacy policy before the form opens (REM-9). Each document name is a link
 * that opens the document in a sheet, with no change of page. Nothing goes to
 * the server here. The tick travels with the final submit, and the server
 * checks it again.
 *
 * The privacy policy is the text of the mandatory `care` consent, and the CGV
 * are the text of the `cgv` key. The box ticks both, so the form posts both
 * and the server records one row for each: the date, the version and the hash
 * of the text (REM-207).
 *
 * The sentence is not one `<label>`: a label may not hold the two links. The
 * text between the links is in small labels of the box, so a tap on it ticks
 * the box. The box takes its name from the whole sentence.
 *
 * The look follows the charter (sections 4 and 6, REM-6): the box is in a
 * white card with a 24 px radius and a light border on the page's pale blue,
 * and the sheet is a white surface too.
 *
 * The type follows the charter (section 5, REM-8): the section title is 18 /
 * 24 px at weight 800, the main text 16 / 24 px, the secondary text 14 px.
 *
 * « Continuer » stays disabled until the box is ticked. No message repeats
 * that under the box (REM-11).
 *
 * On a phone the sheet takes the full width, with the 20 px margin of the
 * page. The tick lives in the form, so opening and closing a sheet keeps it
 * (REM-12).
 */
export const ConsentStep = ({
  consents,
  ticked,
  onToggle,
  onContinue,
  alert,
  content,
}: Props) => {
  const accepted = consents.every((consent) => ticked.has(consent.key));
  const privacy = consents.find((consent) => consent.key === "care");
  const terms = consents.find((consent) => consent.key === "cgv");
  const boxId = "consent-accept";
  const sentenceId = "consent-accept-text";

  const links: Record<string, ReactNode> = {
    "{terms}": terms ? (
      <DocumentLink
        name={content.documents.terms}
        document={terms}
        versionText={content.version}
      />
    ) : (
      content.documents.terms
    ),
    "{privacy}": privacy ? (
      <DocumentLink
        name={content.documents.privacy}
        document={privacy}
        versionText={content.version}
      />
    ) : (
      content.documents.privacy
    ),
  };

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

      <div className="border-border bg-card flex min-h-11 items-start gap-3 rounded-2xl border p-4">
        {/* A 24 px box with a 44 × 44 px touch area (REM-11). */}
        <Checkbox
          id={boxId}
          aria-labelledby={sentenceId}
          className="relative size-6 shrink-0 after:absolute after:-inset-2.5"
          checked={accepted}
          onCheckedChange={(checked) => {
            for (const consent of consents) {
              onToggle(consent.key, checked === true);
            }
          }}
        />
        <Typography id={sentenceId}>
          {content.accept
            .split(/(\{terms\}|\{privacy\})/)
            .filter((part) => part !== "")
            .map((part, index) =>
              part in links ? (
                <span key={part}>{links[part]}</span>
              ) : (
                <label key={index} htmlFor={boxId} className="cursor-pointer">
                  {part}
                </label>
              ),
            )}
        </Typography>
      </div>

      {/* The primary button of the screen: a 56 px pill. Disabled, it turns
          pale instead of a faded blue, so the patient sees it cannot act. */}
      <Button
        type="button"
        size="lg"
        className="disabled:bg-muted disabled:text-muted-foreground w-full disabled:opacity-100"
        disabled={!accepted}
        onClick={onContinue}
      >
        {content.continue}
      </Button>
    </section>
  );
};
