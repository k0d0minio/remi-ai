"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "./button";

type Props = {
  /** The text put on the clipboard. */
  value: string;
  label: string;
  /** Shown for a moment after a successful copy. */
  copiedLabel: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
};

/** How long the confirmation stays up before the button reads as itself again. */
const CONFIRMATION_MS = 2000;

/**
 * Copy a value to the clipboard, and say so.
 *
 * Here rather than in an app because the console has two of these already — a
 * patient's share link and an invitation link — and a third is coming. The
 * labels are props: this package holds no copy, and the console it serves is
 * French while the product apps are not.
 *
 * A denied clipboard is swallowed on purpose. Every caller renders the value
 * as selectable text beside the button, so the fallback is to select it by
 * hand; an error toast would be noise about something the reader can already
 * see and do.
 */
export const CopyButton = ({
  value,
  label,
  copiedLabel,
  variant = "outline",
  size = "sm",
  className,
}: Props) => {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Without this, copying and then navigating away sets state on a component
  // that is no longer mounted.
  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    },
    [],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (timer.current) {
        clearTimeout(timer.current);
      }
      timer.current = setTimeout(() => setCopied(false), CONFIRMATION_MS);
    } catch {
      // Clipboard access denied — the value stays selectable beside the button.
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={copy}
    >
      {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      {copied ? copiedLabel : label}
    </Button>
  );
};
