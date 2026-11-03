"use client";

import NextLink from "next/link";
import { localePath } from "@remi/services/shared";
import { Checkbox } from "@remi/ui";
import { Link, Typography } from "@remi/ui/server";
import { CONSENT } from "@/lib/content/landing";

type Props = {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
};

/** The GDPR consent, never pre-ticked, with the link to the privacy policy. */
export const ConsentField = ({ id, checked, onChange, error }: Props) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-start gap-3">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(value) => onChange(value === true)}
        invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="mt-0.5"
      />
      <Typography as="label" htmlFor={id} size="sm">
        {CONSENT.text}{" "}
        <Link
          as={NextLink}
          href={localePath("fr", "/confidentialite")}
          target="_blank"
          rel="noopener"
          variant="underline"
        >
          {CONSENT.link}
        </Link>
      </Typography>
    </div>
    {error ? (
      <Typography id={`${id}-error`} size="sm" className="text-error-text" role="alert">
        {error}
      </Typography>
    ) : null}
  </div>
);
