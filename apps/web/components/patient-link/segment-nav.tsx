"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { localePath, type Locale } from "@remi/services/shared";
import { cn } from "@remi/ui/utils";
import type { Content } from "@/lib/content/types";
import {
  segmentPath,
  type PatientLinkSegment,
} from "@/lib/patient-link/segments";

type Props = {
  locale: Locale;
  token: string;
  /** Exactly the segments this patient has content for, home first. */
  segments: readonly PatientLinkSegment[];
  content: Content["patientLink"];
};

/**
 * The segment navigation — a client island purely because the current route
 * decides which link is highlighted, the same reason the signed-in shell's
 * nav is one. Nothing here is a form, an input or a mutation: the link stays
 * view-only (decision #1).
 *
 * Phone-first is the acceptance bar rather than a preference, because patients
 * open this from a WhatsApp message: the row wraps instead of scrolling
 * sideways, and every target clears 44px.
 */
export const SegmentNav = ({ locale, token, segments, content }: Props) => {
  const pathname = usePathname();

  // A patient with a summary and nothing else sees one page and no nav.
  if (segments.length < 2) {
    return null;
  }

  return (
    <nav aria-label={content.navLabel}>
      <ul className="flex flex-wrap gap-1">
        {segments.map((segment) => {
          const href = localePath(locale, `/p/${token}${segmentPath(segment)}`);
          const active = pathname === href;

          return (
            <li key={segment}>
              <NextLink
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "focus-visible:ring-ring/40 flex min-h-11 items-center rounded-md px-3 py-2 text-sm transition-colors duration-[--duration-fast] focus-visible:outline-none focus-visible:ring-[3px]",
                  active
                    ? "bg-primary-subtle text-primary font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                {content.nav[segment]}
              </NextLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
