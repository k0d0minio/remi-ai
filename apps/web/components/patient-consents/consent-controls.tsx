"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import type { ConsentKey, Locale } from "@remi/services/shared";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@remi/ui";
import { Typography } from "@remi/ui/server";
import { fill } from "@/lib/content/fill";
import type { Content } from "@/lib/content/types";
import { giveConsentAction, withdrawConsentAction } from "@/lib/consents/actions";
import type { ConsentActionError } from "@/lib/consents/state";

/** A text as the server rendered it. */
type ShownText = {
  version: string;
  textLocale: string;
  lang: string;
  /** « Version 3 du 19 nov. 2026 ». */
  line: string;
  body: ReactNode;
};

type Props = {
  locale: Locale;
  consentKey: ConsentKey;
  name: string;
  /** The text of the patient's decision. `null`: no « Relire ». */
  accepted: ShownText | null;
  /** The consent is in force: the patient can withdraw it. */
  withdrawable: boolean;
  /** The text to accept now. `null`: the settings do not offer the consent. */
  current: ShownText | null;
  text: Content["patientConsents"];
};

const textBlockClass = "px-6 pb-6 [&_table]:block [&_table]:overflow-x-auto";

/**
 * The controls of one consent in « Mes consentements » (REM-43): « Relire »,
 * « Retirer mon consentement » behind a confirmation that names the
 * consequence, and « Donner à nouveau mon consentement » on the current text.
 *
 * The server actions read the patient from the session and check each value
 * again. A hidden button is not the rule.
 */
export const ConsentControls = ({
  locale,
  consentKey,
  name,
  accepted,
  withdrawable,
  current,
  text,
}: Props) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<ConsentActionError | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [giveOpen, setGiveOpen] = useState(false);

  const withdraw = () => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await withdrawConsentAction(locale, consentKey);
        if (result.ok) {
          setConfirmOpen(false);
          router.refresh();
        } else {
          setError(result.error);
        }
      } catch {
        setError("unavailable");
      }
    });
  };

  const give = () => {
    if (!current) {
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const result = await giveConsentAction(
          locale,
          consentKey,
          current.version,
          current.textLocale,
        );
        if (result.ok) {
          setGiveOpen(false);
          router.refresh();
        } else {
          setError(result.error);
        }
      } catch {
        setError("unavailable");
      }
    });
  };

  const alert = error ? (
    <Typography size="sm" className="text-error-text" role="alert">
      {text.errors[error]}
    </Typography>
  ) : null;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {accepted ? (
          <Sheet>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="min-h-11"
                aria-label={fill(text.rereadLabel, { name })}
              >
                {text.reread}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
              <SheetHeader className="pr-12">
                <SheetTitle>{name}</SheetTitle>
                <SheetDescription>{accepted.line}</SheetDescription>
              </SheetHeader>
              <div lang={accepted.lang} className={textBlockClass}>
                {accepted.body}
              </div>
            </SheetContent>
          </Sheet>
        ) : null}

        {withdrawable ? (
          <Dialog
            open={confirmOpen}
            onOpenChange={(open) => {
              setConfirmOpen(open);
              setError(null);
            }}
          >
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="min-h-11"
                aria-label={fill(text.withdrawLabel, { name })}
              >
                {text.withdraw}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{text.confirmTitle}</DialogTitle>
                <DialogDescription>
                  {text.consequences[consentKey]}
                </DialogDescription>
              </DialogHeader>
              <Typography size="sm" tone="muted">
                {text.past}
              </Typography>
              {alert}
              <DialogFooter>
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="min-h-11"
                    disabled={pending}
                  >
                    {text.cancel}
                  </Button>
                </DialogClose>
                <Button
                  type="button"
                  variant="error"
                  size="lg"
                  className="min-h-11"
                  disabled={pending}
                  onClick={withdraw}
                >
                  {pending ? text.withdrawing : text.confirm}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : null}

        {current ? (
          <Sheet
            open={giveOpen}
            onOpenChange={(open) => {
              setGiveOpen(open);
              setError(null);
            }}
          >
            <SheetTrigger asChild>
              <Button
                type="button"
                size="lg"
                className="min-h-11"
                aria-label={fill(text.giveLabel, { name })}
              >
                {text.give}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
              <SheetHeader className="pr-12">
                <SheetTitle>{name}</SheetTitle>
                <SheetDescription>{current.line}</SheetDescription>
              </SheetHeader>
              <div lang={current.lang} className={textBlockClass}>
                {current.body}
              </div>
              <div className="flex flex-col gap-3 px-6 pb-8">
                <Typography size="sm" tone="muted">
                  {text.giveIntro}
                </Typography>
                {alert}
                <Button
                  type="button"
                  size="lg"
                  className="min-h-11"
                  disabled={pending}
                  onClick={give}
                >
                  {pending ? text.giving : text.giveConfirm}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        ) : null}
    </div>
  );
};
