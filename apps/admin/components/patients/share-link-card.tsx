"use client";

import { Check, Copy, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "@remi/ui";
import { Typography } from "@remi/ui/server";
import { regenerateShareTokenAction } from "@/lib/patients/actions";

type Props = {
  patientId: string;
  /** Built server-side by `appHref`, so only the links catalogue knows the origin. */
  url: string;
};

/**
 * The shareable patient link — what Morgane sends over WhatsApp, to patients
 * and to the consultants testing the interface. The URL is the whole
 * credential, so regenerating is the recovery move when one leaks, and it
 * takes a second click: the old link dies the moment the new one exists.
 */
export const ShareLinkCard = ({ patientId, url }: Props) => {
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access denied — the URL stays selectable below.
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <Typography
        size="sm"
        className="border-border bg-muted select-all break-all rounded-md border px-3 py-2 font-mono"
      >
        {url}
      </Typography>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" variant="outline" onClick={copy}>
          {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
          {copied ? "Copied" : "Copy link"}
        </Button>

        {confirming ? (
          <>
            <form
              action={async (formData: FormData) => {
                await regenerateShareTokenAction(formData);
                setConfirming(false);
              }}
            >
              <input type="hidden" name="id" value={patientId} />
              <Button type="submit" size="sm" variant="error">
                <RefreshCw aria-hidden="true" />
                Replace the link
              </Button>
            </form>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setConfirming(false)}
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setConfirming(true)}
          >
            <RefreshCw aria-hidden="true" />
            Regenerate
          </Button>
        )}
      </div>

      {confirming ? (
        <Typography size="xs" tone="muted">
          Regenerating kills the current link — anyone holding it loses access
          and needs the new one.
        </Typography>
      ) : (
        <Typography size="xs" tone="muted">
          Anyone with this link sees the profile and recommendations. Share it
          over a private channel only.
        </Typography>
      )}
    </div>
  );
};
